// Stripe webhook handlers
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { stripe } from "../config/stripe";
import { sendWelcomeEmail, sendPaymentFailureEmail } from "../services/email";

/**
 * Stripe webhook handler
 * POST /stripeWebhook
 * 
 * Note: For Firebase Functions v2, raw body is automatically available
 * when using onRequest. Stripe webhook signature verification requires
 * the raw request body.
 */
export const stripeWebhook = onRequest(
  {
    secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY", "RESEND_API_KEY"],
  },
  async (req, res) => {
    // Log all incoming requests for debugging
    console.log(`Webhook endpoint hit: ${req.method} ${req.path}`);
    console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
    
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    if (!sig || !webhookSecret) {
      console.error("Missing signature or webhook secret", { hasSig: !!sig, hasSecret: !!webhookSecret });
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    let event;

    try {
      // Verify webhook signature
      // Firebase Functions v2 provides rawBody automatically
      // If rawBody is not available, fall back to stringified body
      const rawBody = (req as any).rawBody || 
                      (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
      
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

  // Log webhook event
  console.log(`Webhook received: ${event.type} (ID: ${event.id})`);
  console.log(`Event account: ${event.account || 'platform'}`); // Log which account the event is from
  await db.collection("webhookLogs").add({
    eventId: event.id,
    type: event.type,
    account: event.account || 'platform', // Track which account the event is from
    data: event.data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log(`Processing checkout.session.completed for session ${event.data.object.id}`);
        await handleCheckoutSessionCompleted(event.data.object);
        console.log(`Successfully processed checkout.session.completed`);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate unique invite code
 */
async function generateInviteCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
  let code = "";
  let codeExists = true;
  let attempts = 0;

  while (codeExists && attempts < 10) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
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
    throw new Error("Failed to generate unique invite code after 10 attempts");
  }

  return code;
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session: any) {
  const metadata = session.metadata;
  if (!metadata) {
    console.error("No metadata in checkout session");
    return;
  }

  const { organisationId, email, userId, type, purchaseId, membershipTierId, packId } = metadata;

  // Get email from metadata or session
  const customerEmail = email || session.customer_details?.email || session.customer_email;
  
  if (!customerEmail) {
    console.error("No email found in checkout session");
    // Mark purchase as error
    if (purchaseId) {
      await db.collection("pendingPurchases").doc(purchaseId).update({
        status: "error",
        error: "Missing email",
        stripeSessionId: session.id,
      });
    }
    return;
  }

  // Load pending purchase
  let pendingPurchase: any = null;
  if (purchaseId) {
    const purchaseDoc = await db.collection("pendingPurchases").doc(purchaseId).get();
    if (purchaseDoc.exists) {
      pendingPurchase = { id: purchaseDoc.id, ...purchaseDoc.data() };
    }
  }

  // Mark pending purchase as completed
  if (purchaseId) {
    await db.collection("pendingPurchases").doc(purchaseId).update({
      status: "completed",
      stripeSessionId: session.id,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Check if user exists by email (check Firestore first, then Firebase Auth)
  let existingUser: any = null;
  let existingUserId: string | null = null;

  // Check Firestore users collection
  const usersQuery = await db.collection("users")
    .where("email", "==", customerEmail)
    .limit(1)
    .get();

  if (!usersQuery.empty) {
    existingUser = { id: usersQuery.docs[0].id, ...usersQuery.docs[0].data() };
    existingUserId = existingUser.id;
  } else {
    // Check Firebase Auth (requires Admin SDK)
    try {
      const userRecord = await admin.auth().getUserByEmail(customerEmail);
      existingUserId = userRecord.uid;
      // User exists in Auth but not in Firestore - we'll create Firestore doc when they join
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        console.error("Error checking Firebase Auth:", error);
      }
      // User doesn't exist - will create pendingMember
    }
  }

  // Use userId from metadata if provided (for existing users)
  const finalUserId = userId || existingUserId;

  if (type === "membership" && membershipTierId) {
    await handleMembershipPurchase({
      organisationId,
      customerEmail,
      userId: finalUserId,
      membershipTierId,
      session,
      pendingPurchase,
    });
  }

  if (type === "pack" && packId) {
    await handlePackPurchase({
      organisationId,
      customerEmail,
      userId: finalUserId,
      packId,
      session,
      pendingPurchase,
    });
  }
}

/**
 * Handle membership purchase
 */
async function handleMembershipPurchase(params: {
  organisationId: string;
  customerEmail: string;
  userId: string | null;
  membershipTierId: string;
  session: any;
  pendingPurchase: any;
}) {
  const { organisationId, customerEmail, userId, membershipTierId, session, pendingPurchase } = params;

  // Get membership tier
  const membershipDoc = await db.collection("memberships").doc(membershipTierId).get();
  if (!membershipDoc.exists) {
    console.error(`Membership tier ${membershipTierId} not found`);
    return;
  }

  const membershipData = membershipDoc.data();
  if (!membershipData) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (membershipData.duration || 30) * 24 * 60 * 60 * 1000);

  // If user exists, create membership directly
  if (userId) {
    // Check if user already has this organisation in their organisations array
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const organisations = userData?.organisations || [];
      
      // Add organisation if not already present
      if (!organisations.includes(organisationId)) {
        await db.collection("users").doc(userId).update({
          organisations: admin.firestore.FieldValue.arrayUnion(organisationId),
          activeOrganisationId: userData?.activeOrganisationId || organisationId,
        });
      }
    }

    // Create membership
    const membershipRef = db.collection("memberships").doc();
    await membershipRef.set({
      membershipId: membershipRef.id,
      userId,
      organisationId,
      membershipTierId,
      status: "active",
      startsAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      stripeSubscriptionId: session.subscription || null,
      stripeCustomerId: session.customer || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Created membership for existing user ${userId}`);
    return;
  }

  // User doesn't exist - create pendingMember + invite
  // Check for existing pendingMember (duplicate payment handling)
  const existingPendingMembers = await db.collection("pendingMembers")
    .where("email", "==", customerEmail)
    .where("organisationId", "==", organisationId)
    .limit(1)
    .get();

  let pendingMemberRef: admin.firestore.DocumentReference;
  let pendingMemberId: string;
  let inviteCodeId: string | null = null;

  if (!existingPendingMembers.empty) {
    // Reuse existing pendingMember (duplicate payment)
    pendingMemberRef = existingPendingMembers.docs[0].ref;
    pendingMemberId = existingPendingMembers.docs[0].id;
    const existingData = existingPendingMembers.docs[0].data();
    inviteCodeId = existingData.inviteCodeId || null;

    console.log(`Reusing existing pendingMember ${pendingMemberId} for duplicate payment`);
    
    // Resend welcome email for duplicate payment (in case first email wasn't received)
    if (inviteCodeId) {
      const existingInviteDoc = await db.collection("organisationInvites").doc(inviteCodeId).get();
      if (existingInviteDoc.exists) {
        const existingInviteCode = existingInviteDoc.data()?.code;
        // Get organisation name for email
        const orgDoc = await db.collection("organisations").doc(organisationId).get();
        const orgName = orgDoc.exists ? orgDoc.data()?.name || "your organisation" : "your organisation";
        
        console.log(`Resending welcome email for duplicate payment with invite code ${existingInviteCode}`);
        await sendWelcomeEmail(customerEmail, existingInviteCode, orgName);
      }
    }
  } else {
    // Create new pendingMember
    pendingMemberRef = db.collection("pendingMembers").doc();
    pendingMemberId = pendingMemberRef.id;

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
    const inviteCode = await generateInviteCode();

    // Create organisationInvite (single-use, from Stripe)
    const inviteRef = db.collection("organisationInvites").doc();
    inviteCodeId = inviteRef.id;

    await inviteRef.set({
      code: inviteCode,
      organisationId,
      role: "member",
      active: true,
      reusable: false, // Stripe invites are single-use
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

    // Link pendingPurchase to invite
    if (pendingPurchase?.id) {
      await db.collection("pendingPurchases").doc(pendingPurchase.id).update({
        inviteCodeId: inviteCodeId,
      });
    }

    console.log(`Created pendingMember ${pendingMemberId} and invite code ${inviteCode} for new user`);

    // Get organisation name for email
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    const orgName = orgDoc.exists ? orgDoc.data()?.name || "your organisation" : "your organisation";

    // Send welcome email
    await sendWelcomeEmail(customerEmail, inviteCode, orgName);
  }

  // Create membership document linked to pendingMember (will be activated when user joins)
  // Store it with a special flag so we know it's pending activation
  const membershipRef = db.collection("memberships").doc();
  await membershipRef.set({
    membershipId: membershipRef.id,
    userId: null, // Will be set when user joins
    organisationId,
    membershipTierId,
    status: "pending_activation", // Special status for Stripe-paid memberships
    startsAt: admin.firestore.Timestamp.fromDate(now),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    stripeSubscriptionId: session.subscription || null,
    stripeCustomerId: session.customer || null,
    pendingMemberId: pendingMemberId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle pack purchase
 */
async function handlePackPurchase(params: {
  organisationId: string;
  customerEmail: string;
  userId: string | null;
  packId: string;
  session: any;
  pendingPurchase: any;
}) {
  const { organisationId, customerEmail, userId, packId, session, pendingPurchase } = params;

  // Get pack
  const packDoc = await db.collection("packs").doc(packId).get();
  if (!packDoc.exists) {
    console.error(`Pack ${packId} not found`);
    return;
  }

  const packData = packDoc.data();
  if (!packData) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (packData.validityDays || 90) * 24 * 60 * 60 * 1000);

  // If user exists, create pack purchase directly
  if (userId) {
    // Check if user already has this organisation in their organisations array
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const organisations = userData?.organisations || [];
      
      // Add organisation if not already present
      if (!organisations.includes(organisationId)) {
        await db.collection("users").doc(userId).update({
          organisations: admin.firestore.FieldValue.arrayUnion(organisationId),
          activeOrganisationId: userData?.activeOrganisationId || organisationId,
        });
      }
    }

    // Create pack purchase
    const purchaseRef = db.collection("packPurchases").doc();
    await purchaseRef.set({
      purchaseId: purchaseRef.id,
      userId,
      organisationId,
      packId,
      classesRemaining: packData.classCount || 0,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: "active",
      stripePaymentIntentId: session.payment_intent || null,
      purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Created pack purchase for existing user ${userId}`);
    return;
  }

  // User doesn't exist - create pendingMember + invite
  // Check for existing pendingMember (duplicate payment handling)
  const existingPendingMembers = await db.collection("pendingMembers")
    .where("email", "==", customerEmail)
    .where("organisationId", "==", organisationId)
    .limit(1)
    .get();

  let pendingMemberRef: admin.firestore.DocumentReference;
  let pendingMemberId: string;
  let inviteCodeId: string | null = null;

  if (!existingPendingMembers.empty) {
    // Reuse existing pendingMember (duplicate payment)
    pendingMemberRef = existingPendingMembers.docs[0].ref;
    pendingMemberId = existingPendingMembers.docs[0].id;
    const existingData = existingPendingMembers.docs[0].data();
    inviteCodeId = existingData.inviteCodeId || null;

    console.log(`Reusing existing pendingMember ${pendingMemberId} for duplicate payment`);
    
    // Resend welcome email for duplicate payment (in case first email wasn't received)
    if (inviteCodeId) {
      const existingInviteDoc = await db.collection("organisationInvites").doc(inviteCodeId).get();
      if (existingInviteDoc.exists) {
        const existingInviteCode = existingInviteDoc.data()?.code;
        // Get organisation name for email
        const orgDoc = await db.collection("organisations").doc(organisationId).get();
        const orgName = orgDoc.exists ? orgDoc.data()?.name || "your organisation" : "your organisation";
        
        console.log(`Resending welcome email for duplicate payment with invite code ${existingInviteCode}`);
        await sendWelcomeEmail(customerEmail, existingInviteCode, orgName);
      }
    }
  } else {
    // Create new pendingMember
    pendingMemberRef = db.collection("pendingMembers").doc();
    pendingMemberId = pendingMemberRef.id;

    const customerName = session.customer_details?.name || null;

    await pendingMemberRef.set({
      organisationId,
      email: customerEmail,
      fullName: customerName,
      status: "pending",
      createdFrom: "stripe",
      packId,
      stripeCustomerId: session.customer || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate invite code
    const inviteCode = await generateInviteCode();

    // Create organisationInvite (single-use, from Stripe)
    const inviteRef = db.collection("organisationInvites").doc();
    inviteCodeId = inviteRef.id;

    await inviteRef.set({
      code: inviteCode,
      organisationId,
      role: "member",
      active: true,
      reusable: false, // Stripe invites are single-use
      createdFrom: "stripe",
      email: customerEmail,
      pendingMemberId: pendingMemberId,
      packId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Link pendingMember to invite
    await pendingMemberRef.update({
      inviteCodeId: inviteCodeId,
    });

    // Link pendingPurchase to invite
    if (pendingPurchase?.id) {
      await db.collection("pendingPurchases").doc(pendingPurchase.id).update({
        inviteCodeId: inviteCodeId,
      });
    }

    console.log(`Created pendingMember ${pendingMemberId} and invite code ${inviteCode} for new user`);

    // Get organisation name for email
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    const orgName = orgDoc.exists ? orgDoc.data()?.name || "your organisation" : "your organisation";

    // Send welcome email
    await sendWelcomeEmail(customerEmail, inviteCode, orgName);
  }

  // Check if pack purchase already exists (e.g. created by completeWebSignup before webhook ran)
  if (pendingPurchase?.id) {
    const existing = await db.collection("packPurchases")
      .where("pendingPurchaseId", "==", pendingPurchase.id)
      .limit(1)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data();
      // If already activated by completeWebSignup, skip creating
      if (data?.status === "active" && data?.userId) {
        return;
      }
      // Otherwise update with pendingMemberId for app invite flow
      await doc.ref.update({
        pendingMemberId: pendingMemberId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }
  }

  // Create pack purchase document linked to pendingMember (will be activated when user joins)
  const purchaseRef = db.collection("packPurchases").doc();
  await purchaseRef.set({
    purchaseId: purchaseRef.id,
    userId: null, // Will be set when user joins (via app invite or web signup)
    organisationId,
    packId,
    classesRemaining: packData.classCount || 0,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    status: "pending_activation", // Special status for Stripe-paid packs
    stripePaymentIntentId: session.payment_intent || null,
    pendingMemberId: pendingMemberId,
    pendingPurchaseId: pendingPurchase?.id || null, // For web signup lookup
    customerEmail: customerEmail, // For web signup lookup
    purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Find membership by subscription ID
  const membershipsQuery = await db.collection("memberships")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (membershipsQuery.empty) return;

  const membershipDoc = membershipsQuery.docs[0];
  const membershipData = membershipDoc.data();

  // Get membership tier to determine duration
  const membershipTierId = membershipData?.membershipTierId;
  let duration = 30; // Default 30 days

  if (membershipTierId) {
    const tierDoc = await db.collection("memberships").doc(membershipTierId).get();
    if (tierDoc.exists) {
      const tierData = tierDoc.data();
      duration = tierData?.duration || 30;
    }
  }

  // Calculate new expiry date (extend from current expiresAt or now)
  const now = new Date();
  const currentExpiresAt = membershipData?.expiresAt;
  let newExpiresAt: Date;

  if (currentExpiresAt) {
    const expiryDate = currentExpiresAt.toDate ? currentExpiresAt.toDate() : new Date(currentExpiresAt);
    // Extend from current expiry date (or now if already expired)
    const baseDate = expiryDate > now ? expiryDate : now;
    newExpiresAt = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
  } else {
    // No expiry date, extend from now
    newExpiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
  }

  // Update membership status to active and extend expiry date
  await membershipDoc.ref.update({
    status: "active",
    expiresAt: admin.firestore.Timestamp.fromDate(newExpiresAt),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Membership renewed: extended expiresAt to ${newExpiresAt.toISOString()}`);
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Find membership by subscription ID
  const membershipsQuery = await db.collection("memberships")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (membershipsQuery.empty) return;

  const membershipDoc = membershipsQuery.docs[0];
  const membershipData = membershipDoc.data();

  // Calculate grace period expiry (7 days from now)
  const now = new Date();
  const gracePeriodExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Update membership status to past_due and set grace period
  await membershipDoc.ref.update({
    status: "past_due",
    gracePeriodExpiresAt: admin.firestore.Timestamp.fromDate(gracePeriodExpiresAt),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Membership marked as past_due with 7-day grace period until ${gracePeriodExpiresAt.toISOString()}`);

  // Send payment failure email to user
  const userId = membershipData?.userId;
  const organisationId = membershipData?.organisationId;
  if (userId && organisationId) {
    try {
      const [userDoc, orgDoc] = await Promise.all([
        db.collection("users").doc(userId).get(),
        db.collection("organisations").doc(organisationId).get(),
      ]);
      const userEmail = userDoc.exists ? userDoc.data()?.email : null;
      const organisationName = orgDoc.exists ? orgDoc.data()?.name : "your organisation";
      if (userEmail) {
        await sendPaymentFailureEmail(userEmail, organisationName);
      } else {
        console.warn("Could not send payment failure email: no user email for userId", userId);
      }
    } catch (emailError: any) {
      console.error("Failed to send payment failure email:", emailError.message);
    }
  }
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;

  // Find membership by subscription ID
  const membershipsQuery = await db.collection("memberships")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (membershipsQuery.empty) return;

  const membershipDoc = membershipsQuery.docs[0];

  // Update membership based on subscription status
  let status = "active";
  if (subscription.status === "canceled" || subscription.status === "unpaid") {
    status = "cancelled";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  }

  await membershipDoc.ref.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionId = subscription.id;

  // Find membership by subscription ID
  const membershipsQuery = await db.collection("memberships")
    .where("stripeSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (membershipsQuery.empty) return;

  const membershipDoc = membershipsQuery.docs[0];

  // Mark membership as cancelled
  await membershipDoc.ref.update({
    status: "cancelled",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

