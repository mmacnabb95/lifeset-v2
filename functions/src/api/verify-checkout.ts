// Verify and process checkout session (fallback when webhook doesn't fire)
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { getStripeForAccount } from "../config/stripe";
import { sendWelcomeEmail } from "../services/email";

/**
 * Verify checkout session and process payment if webhook hasn't fired
 * This is a fallback for when webhooks from connected accounts don't reach the platform
 */
export const verifyCheckoutSession = onCall(
  {
    secrets: ["STRIPE_SECRET_KEY", "RESEND_API_KEY"],
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    try {
      const { sessionId, organisationId } = request.data;

      if (!sessionId || !organisationId) {
        throw new Error("Missing required fields: sessionId, organisationId");
      }

      // Get organisation to find connected account
      const orgDoc = await db.collection("organisations").doc(organisationId).get();
      if (!orgDoc.exists) {
        throw new Error("Organisation not found");
      }

      const orgData = orgDoc.data();
      const stripeAccountId = orgData?.stripeAccountId;

      if (!stripeAccountId) {
        throw new Error("Organisation has not connected Stripe");
      }

      // Get Stripe instance for connected account
      const stripe = getStripeForAccount(stripeAccountId);

      // Retrieve checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'subscription']
      });

      // Check if session is completed
      console.log(`Checkout session status: payment_status=${session.payment_status}, status=${session.status}`);
      if (session.payment_status !== 'paid' || session.status !== 'complete') {
        console.log(`Session not completed yet. Payment status: ${session.payment_status}, Session status: ${session.status}`);
        return {
          success: false,
          message: `Payment not completed yet. Status: ${session.payment_status}, Session: ${session.status}`,
          paymentStatus: session.payment_status,
          sessionStatus: session.status
        };
      }

      // Check if we've already processed this session
      const existingPurchase = await db.collection("pendingPurchases")
        .where("stripeSessionId", "==", sessionId)
        .limit(1)
        .get();

      if (!existingPurchase.empty) {
        const purchase = existingPurchase.docs[0].data();
        if (purchase.status === "completed") {
          return {
            success: true,
            message: "Payment already processed",
            alreadyProcessed: true
          };
        }
      }

      // Process the payment (similar to webhook handler)
      const metadata = session.metadata || {};
      const { purchaseId, type, membershipTierId, email } = metadata;
      
      console.log("Session metadata:", JSON.stringify(metadata, null, 2));
      console.log("Extracted values:", { purchaseId, type, membershipTierId, email });
      
      const customerEmail = email || session.customer_details?.email || session.customer_email;
      console.log("Customer email:", customerEmail);

      if (!customerEmail) {
        throw new Error("No email found in checkout session");
      }

      // Check if user exists
      let existingUserId: string | null = null;
      console.log("Checking if user exists for email:", customerEmail);
      const usersQuery = await db.collection("users")
        .where("email", "==", customerEmail)
        .limit(1)
        .get();

      if (!usersQuery.empty) {
        existingUserId = usersQuery.docs[0].id;
      } else {
        try {
          const userRecord = await admin.auth().getUserByEmail(customerEmail);
          existingUserId = userRecord.uid;
        } catch (error: any) {
          if (error.code !== "auth/user-not-found") {
            console.error("Error checking Firebase Auth:", error);
          }
        }
      }

      let inviteCode: string | null = null;

      console.log("User check result:", { existingUserId, type, membershipTierId });
      console.log("Will create pendingMember?", !existingUserId && type === "membership" && membershipTierId);
      console.log("Will create membership for existing user?", existingUserId && type === "membership" && membershipTierId);

      // If user exists, create membership directly
      if (existingUserId && type === "membership" && membershipTierId) {
        console.log("User exists, creating membership directly...");
        
        // Get membership tier
        const membershipDoc = await db.collection("memberships").doc(membershipTierId).get();
        if (!membershipDoc.exists) {
          throw new Error(`Membership tier ${membershipTierId} not found`);
        }

        const membershipData = membershipDoc.data();
        if (!membershipData) {
          throw new Error("Membership tier data not found");
        }

        // Check if user already has this organisation
        const userDoc = await db.collection("users").doc(existingUserId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const organisations = userData?.organisations || [];
          
          // Add organisation if not already present
          if (!organisations.includes(organisationId)) {
            await db.collection("users").doc(existingUserId).update({
              organisations: admin.firestore.FieldValue.arrayUnion(organisationId),
              organisationId: organisationId, // Also set singular for backward compatibility with members list query
              activeOrganisationId: userData?.activeOrganisationId || organisationId,
            });
            console.log(`Added organisation ${organisationId} to user ${existingUserId}`);
          } else {
            // Organisation already in array, but ensure organisationId field is set
            if (!userData?.organisationId) {
              await db.collection("users").doc(existingUserId).update({
                organisationId: organisationId,
              });
              console.log(`Set organisationId field for user ${existingUserId}`);
            }
          }
        }

        // Calculate expiration date
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (membershipData.duration || 30) * 24 * 60 * 60 * 1000);

        // Create membership
        const membershipRef = db.collection("memberships").doc();
        await membershipRef.set({
          membershipId: membershipRef.id,
          userId: existingUserId,
          organisationId,
          membershipTierId,
          status: "active",
          startsAt: admin.firestore.Timestamp.fromDate(now),
          expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
          stripeSubscriptionId: session.subscription || null,
          stripeCustomerId: session.customer || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Created membership for existing user ${existingUserId}`);
        
        // Return success - no invite code needed for existing users
        if (purchaseId) {
          await db.collection("pendingPurchases").doc(purchaseId).update({
            status: "completed",
            stripeSessionId: sessionId,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            verifiedVia: "verifyCheckoutSession",
          });
        }

        return {
          success: true,
          message: "Payment verified and membership created for existing user",
          email: customerEmail,
          inviteCode: null,
          alreadyProcessed: false
        };
      }

      // If user doesn't exist, create pendingMember and send email
      if (!existingUserId && type === "membership" && membershipTierId) {
        console.log("Creating pendingMember for new user...");
        // Check for existing pendingMember
        const existingPendingMembers = await db.collection("pendingMembers")
          .where("email", "==", customerEmail)
          .where("organisationId", "==", organisationId)
          .limit(1)
          .get();

        if (existingPendingMembers.empty) {
          // Create new pendingMember
          const pendingMemberRef = db.collection("pendingMembers").doc();
          const pendingMemberId = pendingMemberRef.id;

          const customerName = session.customer_details?.name || null;

          await pendingMemberRef.set({
            organisationId,
            email: customerEmail,
            fullName: customerName,
            status: "pending",
            createdFrom: "stripe",
            membershipTierId,
            stripeCustomerId: session.customer || null,
            stripeSubscriptionId: session.subscription || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Generate invite code
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let code = "";
          let codeExists = true;
          let attempts = 0;

          while (codeExists && attempts < 10) {
            code = "";
            for (let i = 0; i < 6; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const existingInvites = await db.collection("organisationInvites")
              .where("code", "==", code)
              .limit(1)
              .get();

            if (existingInvites.empty) {
              codeExists = false;
            } else {
              attempts++;
            }
          }

          if (codeExists) {
            throw new Error("Failed to generate unique invite code");
          }

          inviteCode = code;

          // Create organisationInvite
          const inviteRef = db.collection("organisationInvites").doc();
          const inviteCodeId = inviteRef.id;

          const now = new Date();
          await inviteRef.set({
            code: inviteCode,
            organisationId,
            role: "member",
            active: true,
            reusable: false,
            createdFrom: "stripe",
            email: customerEmail,
            pendingMemberId: pendingMemberId,
            membershipTierId,
            startDate: now.toISOString().split('T')[0],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Link pendingMember to invite
          await pendingMemberRef.update({
            inviteCodeId: inviteCodeId,
          });

          // Get organisation name for email
          const orgName = orgData?.name || "your organisation";

          // Send welcome email (inviteCode is guaranteed to be set here since we just assigned it)
          if (inviteCode) {
            try {
              await sendWelcomeEmail(customerEmail, inviteCode, orgName);
              console.log(`Welcome email sent successfully to ${customerEmail}`);
            } catch (emailError: any) {
              console.error(`Failed to send welcome email to ${customerEmail}:`, emailError);
              // Don't throw - continue processing even if email fails
            }
          } else {
            console.warn(`No invite code generated, cannot send welcome email`);
          }

          console.log(`Created pendingMember and sent welcome email via verifyCheckoutSession fallback`);
        } else {
          // Get existing invite code
          const existingData = existingPendingMembers.docs[0].data();
          const existingInviteCodeId = existingData.inviteCodeId;
          if (existingInviteCodeId) {
            const existingInviteDoc = await db.collection("organisationInvites").doc(existingInviteCodeId).get();
            if (existingInviteDoc.exists) {
              const existingInviteData = existingInviteDoc.data();
              const existingCode = existingInviteData?.code;
              const isActive = existingInviteData?.active !== false;
              
              if (existingCode && isActive) {
                // Reuse existing active invite code
                inviteCode = existingCode;
                // Resend email
                const orgName = orgData?.name || "your organisation";
                try {
                  await sendWelcomeEmail(customerEmail, existingCode, orgName);
                  console.log(`Welcome email resent successfully to ${customerEmail} with existing code ${existingCode}`);
                } catch (emailError: any) {
                  console.error(`Failed to resend welcome email to ${customerEmail}:`, emailError);
                  // Don't throw - continue processing even if email fails
                }
              } else {
                // Existing invite code was already used (inactive) - create a new one for duplicate payment
                console.log(`Existing invite code ${existingCode} is inactive, creating new invite code for duplicate payment`);
                
                // Generate new invite code
                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                let code = "";
                let codeExists = true;
                let attempts = 0;

                while (codeExists && attempts < 10) {
                  code = "";
                  for (let i = 0; i < 6; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                  }

                  const existingInvites = await db.collection("organisationInvites")
                    .where("code", "==", code)
                    .limit(1)
                    .get();

                  if (existingInvites.empty) {
                    codeExists = false;
                  } else {
                    attempts++;
                  }
                }

                if (codeExists) {
                  throw new Error("Failed to generate unique invite code for duplicate payment");
                }

                inviteCode = code;

                // Create new organisationInvite for duplicate payment
                const inviteRef = db.collection("organisationInvites").doc();
                const inviteCodeId = inviteRef.id;

                const now = new Date();
                await inviteRef.set({
                  code: inviteCode,
                  organisationId,
                  role: "member",
                  active: true,
                  reusable: false,
                  createdFrom: "stripe",
                  email: customerEmail,
                  pendingMemberId: existingPendingMembers.docs[0].id,
                  membershipTierId,
                  startDate: now.toISOString().split('T')[0],
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Update pendingMember with new invite code
                await existingPendingMembers.docs[0].ref.update({
                  inviteCodeId: inviteCodeId,
                });

                // Send welcome email with new code
                const orgName = orgData?.name || "your organisation";
                try {
                  await sendWelcomeEmail(customerEmail, inviteCode, orgName);
                  console.log(`Welcome email sent successfully to ${customerEmail} with new invite code ${inviteCode} for duplicate payment`);
                } catch (emailError: any) {
                  console.error(`Failed to send welcome email to ${customerEmail}:`, emailError);
                  // Don't throw - continue processing even if email fails
                }
              }
            }
          }
        }
      }

      // Mark pending purchase as completed if it exists
      if (purchaseId) {
        await db.collection("pendingPurchases").doc(purchaseId).update({
          status: "completed",
          stripeSessionId: sessionId,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          verifiedVia: "verifyCheckoutSession", // Track that this was processed via fallback
        });
      }

      return {
        success: true,
        message: "Payment verified and processed",
        email: customerEmail,
        inviteCode: inviteCode || null
      };

    } catch (error: any) {
      console.error("Error verifying checkout session:", error);
      throw new Error(error.message || "Failed to verify checkout session");
    }
  }
);

