import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { db } from "../config";

/**
 * Daily scheduled job to mark memberships as expired when their expiresAt date has passed.
 * Runs at 2 AM UTC.
 * Note: past_due grace period expiry is handled in the me function when users call it.
 */
export const expireMembershipsDaily = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "UTC",
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const expiredSnapshot = await db
      .collection("memberships")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    if (expiredSnapshot.empty) {
      console.log("expireMembershipsDaily: No memberships to expire");
      return;
    }

    const batch = db.batch();
    expiredSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "expired",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`expireMembershipsDaily: Marked ${expiredSnapshot.size} memberships as expired`);
  }
);
