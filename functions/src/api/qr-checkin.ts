// QR Check-in validation endpoint
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, auth } from "../config";

export const validateQRCheckIn = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const staffUserId = decodedToken.uid;

    const { qrCode, classId } = req.body;
    if (!qrCode || typeof qrCode !== "string") {
      res.status(400).json({ error: "QR code is required" });
      return;
    }

    // Get staff user - must be admin or staff of the org
    const staffDoc = await db.collection("users").doc(staffUserId).get();
    if (!staffDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const staffData = staffDoc.data();
    const staffRole = staffData?.role;
    const isStaffOrAdmin = staffRole === "admin" || staffRole === "staff";

    if (!isStaffOrAdmin) {
      res.status(403).json({ error: "Only staff or admins can check in members" });
      return;
    }

    // Staff's organisation (where they're checking in)
    const organisationId =
      staffData?.organisationId ||
      staffData?.activeOrganisationId ||
      (staffData?.organisations && Array.isArray(staffData.organisations) && staffData.organisations[0]);

    if (!organisationId) {
      res.status(400).json({ error: "Staff does not belong to an organisation" });
      return;
    }

    // Parse QR code: format {memberUserId}:{timestamp}
    const [memberUserId] = qrCode.split(":");
    if (!memberUserId) {
      res.status(400).json({ error: "Invalid QR code format" });
      return;
    }

    // Verify member exists and belongs to this org
    const memberDoc = await db.collection("users").doc(memberUserId).get();
    if (!memberDoc.exists) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    const memberData = memberDoc.data();
    const memberOrgIds = [
      memberData?.organisationId,
      memberData?.activeOrganisationId,
      ...(memberData?.organisations || []),
    ].filter(Boolean);
    if (!memberOrgIds.includes(organisationId)) {
      res.status(403).json({ error: "Member does not belong to this organisation" });
      return;
    }

    // Check if member has active membership OR active pack with remaining classes
    // Query by userId only to avoid composite index; filter in memory
    const now = admin.firestore.Timestamp.now();
    
    const membershipsSnap = await db.collection("memberships")
      .where("userId", "==", memberUserId)
      .get();
    const nowMs = now.toMillis();
    const getExpiresMs = (exp: unknown): number | null => {
      if (!exp) return null;
      if (typeof (exp as any).toMillis === "function") return (exp as any).toMillis();
      if (typeof (exp as any).seconds === "number") return (exp as any).seconds * 1000;
      return null;
    };

    const activeMembership = membershipsSnap.docs.find((d) => {
      const data = d.data();
      const expMs = getExpiresMs(data.expiresAt);
      return (
        data.organisationId === organisationId &&
        data.status === "active" &&
        expMs != null &&
        expMs > nowMs
      );
    });

    const packsSnap = await db.collection("packPurchases")
      .where("userId", "==", memberUserId)
      .get();
    const activePack = packsSnap.docs.find((d) => {
      const data = d.data();
      const expMs = getExpiresMs(data.expiresAt);
      return (
        data.organisationId === organisationId &&
        data.status === "active" &&
        expMs != null &&
        expMs > nowMs &&
        (data.classesRemaining ?? 0) > 0
      );
    });

    if (!activeMembership && !activePack) {
      res.status(403).json({ error: "No active membership or pack with remaining classes" });
      return;
    }

    // If using pack, decrement classes remaining
    if (activePack && !activeMembership) {
      const packDoc = activePack;
      const currentRemaining = packDoc.data().classesRemaining || 0;
      
      if (currentRemaining <= 0) {
        res.status(403).json({ error: "Pack has no remaining classes" });
        return;
      }

      // Decrement classes remaining
      await packDoc.ref.update({
        classesRemaining: currentRemaining - 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // If no classes left, mark as used
      if (currentRemaining - 1 === 0) {
        await packDoc.ref.update({
          status: "used",
        });
      }
    }

    // Log attendance for the member (not staff)
    const attendanceRef = db.collection("attendance").doc();
    await attendanceRef.set({
      attendanceId: attendanceRef.id,
      userId: memberUserId,
      organisationId,
      classId: classId || null,
      checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      attendanceId: attendanceRef.id,
      message: "Check-in successful" 
    });
  } catch (error: any) {
    console.error("Error validating QR check-in:", error);
    const msg = error?.message || String(error);
    res.status(500).json({
      error: "Internal server error",
      message: msg,
    });
  }
});

