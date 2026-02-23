import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config";

/**
 * Cloud Function for members to join a class waitlist when the class is full
 */
export const joinWaitlist = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to join the waitlist");
    }

    const userId = request.auth.uid;
    const { classId, organisationId } = request.data;

    if (!classId || !organisationId) {
      throw new HttpsError("invalid-argument", "Missing required fields: classId, organisationId");
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    const belongsToOrg =
      userData?.organisationId === organisationId ||
      userData?.activeOrganisationId === organisationId ||
      (userData?.organisations && userData.organisations.includes && userData.organisations.includes(organisationId));
    if (!belongsToOrg) {
      throw new HttpsError("permission-denied", "You do not belong to this organisation");
    }

    const classDoc = await db.collection("classes").doc(classId).get();
    if (!classDoc.exists) {
      throw new HttpsError("not-found", "Class not found");
    }

    const classData = classDoc.data();
    if (classData?.organisationId !== organisationId) {
      throw new HttpsError("invalid-argument", "Class does not belong to organisation");
    }

    const bookingsSnap = await db.collection("bookings")
      .where("classId", "==", classId)
      .get();
    const bookedCount = bookingsSnap.docs.filter((d) => d.data().status === "confirmed").length;
    const capacity = classData?.capacity || 0;

    if (bookedCount < capacity) {
      throw new HttpsError("failed-precondition", "Class is not full – you can book directly");
    }

    const existingWaitlist = await db.collection("waitlistEntries")
      .where("classId", "==", classId)
      .where("userId", "==", userId)
      .get();

    if (!existingWaitlist.empty) {
      throw new HttpsError("already-exists", "You are already on the waitlist for this class");
    }

    const alreadyBooked = bookingsSnap.docs.some(
      (d) => d.data().userId === userId && d.data().status === "confirmed"
    );
    if (alreadyBooked) {
      throw new HttpsError("failed-precondition", "You already have a booking for this class");
    }

    await db.collection("waitlistEntries").add({
      classId,
      organisationId,
      userId,
      email: userData?.email || "",
      createdAt: new Date(),
    });

    return { success: true, message: "Added to waitlist" };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    console.error("Error joining waitlist:", error);
    throw new HttpsError("internal", error.message || "Failed to join waitlist");
  }
});
