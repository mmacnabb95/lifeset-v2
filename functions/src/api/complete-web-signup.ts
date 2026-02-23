/**
 * Complete web signup for pack purchasers
 * Creates Firebase Auth user + Firestore doc, activates pack purchase
 * Callable - requires no auth (user doesn't exist yet)
 */
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";

export const completeWebSignup = onCall(
  {},
  async (request) => {
    // No auth required - user is creating account
    const { email, password, purchaseId } = request.data;

    if (!email || !password || !purchaseId) {
      throw new Error("Missing required fields: email, password, purchaseId");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    // 1. Find pack purchase (webhook may have created it)
    let packPurchase: admin.firestore.DocumentSnapshot | null = null;

    const byPendingPurchase = await db.collection("packPurchases")
      .where("pendingPurchaseId", "==", purchaseId)
      .where("status", "==", "pending_activation")
      .limit(1)
      .get();

    if (!byPendingPurchase.empty) {
      packPurchase = byPendingPurchase.docs[0];
    } else {
      // Fallback: find by pendingPurchase + email (webhook might not have run yet)
      const pendingPurchaseDoc = await db.collection("pendingPurchases").doc(purchaseId).get();
      if (!pendingPurchaseDoc.exists) {
        throw new Error("Purchase not found. Please complete checkout first.");
      }

      const pendingData = pendingPurchaseDoc.data();
      if (pendingData?.email?.toLowerCase() !== email.toLowerCase()) {
        throw new Error("Email does not match purchase");
      }
      if (pendingData?.type !== "pack" || !pendingData?.packId || !pendingData?.organisationId) {
        throw new Error("Invalid purchase type");
      }
      if (pendingData?.status !== "completed") {
        throw new Error("Payment not yet confirmed. Please wait a moment and try again.");
      }

      // Webhook may not have run - create pack purchase from pending data
      const packDoc = await db.collection("packs").doc(pendingData.packId).get();
      if (!packDoc.exists) {
        throw new Error("Pack not found");
      }

      const packData = packDoc.data();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + (packData?.validityDays || 90) * 24 * 60 * 60 * 1000
      );

      const purchaseRef = db.collection("packPurchases").doc();
      await purchaseRef.set({
        purchaseId: purchaseRef.id,
        userId: null, // Will set below
        organisationId: pendingData.organisationId,
        packId: pendingData.packId,
        classesRemaining: packData?.classCount || 0,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        status: "pending_activation",
        pendingPurchaseId: purchaseId,
        customerEmail: email,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      packPurchase = await purchaseRef.get();
    }

    const purchaseData = packPurchase!.data();
    if (!purchaseData || purchaseData.customerEmail?.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Email does not match this purchase");
    }

    const organisationId = purchaseData.organisationId;

    // 2. Check if user already exists
    try {
      await admin.auth().getUserByEmail(email);
      throw new Error("An account with this email already exists. Please sign in instead.");
    } catch (err: any) {
      if (err.message?.includes("already exists")) throw err;
      if (err.code !== "auth/user-not-found") {
        console.error("Auth check error:", err);
        throw new Error("Could not verify account status");
      }
    }

    // 3. Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });
    const userId = userRecord.uid;

    // 4. Create Firestore user doc
    await db.collection("users").doc(userId).set({
      email,
      organisations: [organisationId],
      activeOrganisationId: organisationId,
      organisationId, // Legacy
      role: "member",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      xp: 0,
      level: 1,
    });

    // 5. Activate pack purchase
    await packPurchase!.ref.update({
      userId,
      status: "active",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Mark pending purchase as linked (optional)
    await db.collection("pendingPurchases").doc(purchaseId).update({
      userId,
      linkedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 7. Clean up pendingMember if exists (they're now active)
    const pendingMembersQuery = await db.collection("pendingMembers")
      .where("email", "==", email)
      .where("organisationId", "==", organisationId)
      .limit(1)
      .get();

    if (!pendingMembersQuery.empty) {
      await pendingMembersQuery.docs[0].ref.delete();
    }

    return {
      success: true,
      userId,
      message: "Account created successfully. You can now book classes.",
    };
  }
);
