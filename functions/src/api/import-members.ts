/**
 * Import members from CRM migration (Mindbody/Glofox style)
 * Creates pendingMember + invite code for each. Optionally creates membership for imported members.
 */
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { sendWelcomeEmail } from "../services/email";

async function generateInviteCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let codeExists = true;
  let attempts = 0;

  while (codeExists && attempts < 10) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await db.collection("organisationInvites").where("code", "==", code).limit(1).get();
    if (existing.empty) codeExists = false;
    else attempts++;
  }
  if (codeExists) throw new Error("Failed to generate unique invite code");
  return code;
}

interface ImportMemberRow {
  email: string;
  fullName?: string;
  phone?: string;
  membershipTierId?: string;
  membershipExpiresAt?: string; // ISO date or YYYY-MM-DD
}

export const importMembers = onCall(
  { secrets: ["RESEND_API_KEY"] },
  async (request) => {
    if (!request.auth) throw new Error("Unauthorized");

    const { organisationId, members, sendWelcomeEmails = false } = request.data as {
      organisationId: string;
      members: ImportMemberRow[];
      sendWelcomeEmails?: boolean;
    };

    if (!organisationId || !Array.isArray(members) || members.length === 0) {
      throw new Error("organisationId and members array (non-empty) are required");
    }

    // Verify user is admin of org
    const userDoc = await db.collection("users").doc(request.auth.uid).get();
    const userData = userDoc.data();
    const orgId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];
    if (orgId !== organisationId || (userData?.role !== "admin" && userData?.role !== "staff")) {
      throw new Error("You do not have permission to import members for this organisation");
    }

    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    if (!orgDoc.exists) throw new Error("Organisation not found");
    const orgName = orgDoc.data()?.name || "your organisation";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results: { email: string; status: "created" | "skipped" | "error"; inviteCode?: string; message?: string }[] = [];
    const seenEmails = new Set<string>();

    for (const row of members) {
      const email = (row.email || "").trim().toLowerCase();
      if (!email) {
        results.push({ email: row.email || "", status: "skipped", message: "Empty email" });
        continue;
      }
      if (!emailRegex.test(email)) {
        results.push({ email, status: "skipped", message: "Invalid email format" });
        continue;
      }
      if (seenEmails.has(email)) {
        results.push({ email, status: "skipped", message: "Duplicate in file" });
        continue;
      }
      seenEmails.add(email);

      try {
        // Skip if already a member (user exists with this org)
        const existingUsers = await db.collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();
        if (!existingUsers.empty) {
          const ud = existingUsers.docs[0].data();
          if (ud?.organisations?.includes(organisationId) || ud?.organisationId === organisationId) {
            results.push({ email, status: "skipped", message: "Already a member" });
            continue;
          }
        }

        // Skip if pendingMember already exists
        const existingPending = await db.collection("pendingMembers")
          .where("email", "==", email)
          .where("organisationId", "==", organisationId)
          .limit(1)
          .get();
        if (!existingPending.empty) {
          const pm = existingPending.docs[0].data();
          const inviteDoc = pm.inviteCodeId
            ? await db.collection("organisationInvites").doc(pm.inviteCodeId).get()
            : null;
          const code = inviteDoc?.data()?.code;
          results.push({ email, status: "skipped", message: "Already imported", inviteCode: code });
          continue;
        }

        const inviteCode = await generateInviteCode();
        const inviteRef = db.collection("organisationInvites").doc();
        await inviteRef.set({
          code: inviteCode,
          organisationId,
          role: "member",
          singleUse: true,
          used: false,
          createdFrom: "import",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const pendingMemberRef = db.collection("pendingMembers").doc();
        await pendingMemberRef.set({
          organisationId,
          email,
          fullName: (row.fullName || "").trim() || null,
          phone: (row.phone || "").trim() || null,
          status: "pending",
          createdFrom: "import",
          inviteCodeId: inviteRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Link invite back to pendingMember so members list can display invite code
        await inviteRef.update({ pendingMemberId: pendingMemberRef.id });

        // Optional: create membership for imported members (no Stripe - manual/legacy)
        let membershipTierId = row.membershipTierId?.trim();
        let expiresAt: Date | null = null;
        if (row.membershipExpiresAt) {
          const parsed = new Date(row.membershipExpiresAt);
          if (!isNaN(parsed.getTime())) expiresAt = parsed;
        }
        if (membershipTierId && expiresAt) {
          const tierDoc = await db.collection("memberships").doc(membershipTierId).get();
          if (tierDoc.exists && tierDoc.data()?.organisationId === organisationId && !tierDoc.data()?.userId) {
            const membershipRef = db.collection("memberships").doc();
            await membershipRef.set({
              membershipId: membershipRef.id,
              userId: null,
              organisationId,
              membershipTierId,
              status: "active",
              startsAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              stripeSubscriptionId: null,
              stripeCustomerId: null,
              createdFrom: "import",
              pendingMemberId: pendingMemberRef.id,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        if (sendWelcomeEmails) {
          try {
            await sendWelcomeEmail(email, inviteCode, orgName);
          } catch (e) {
            console.warn(`Failed to send welcome email to ${email}:`, e);
          }
        }

        results.push({ email, status: "created", inviteCode });
      } catch (err: any) {
        results.push({ email, status: "error", message: err.message || "Import failed" });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errors = results.filter((r) => r.status === "error").length;

    return {
      success: true,
      summary: { created, skipped, errors, total: members.length },
      results,
    };
  }
);
