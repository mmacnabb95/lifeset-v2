import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config";
import { createBookingWithAccessCheck } from "./booking-enforcement";
import { sendBookingConfirmationEmail } from "../services/email";

/**
 * Cloud Function for members to book classes
 * Only works for gym-type organisations (gym, yoga, pilates, hiit, sauna)
 */
export const bookClass = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to book a class");
    }

    const userId = request.auth.uid;
    const { classId, organisationId } = request.data;

    if (!classId || !organisationId) {
      throw new HttpsError("invalid-argument", "Missing required fields: classId, organisationId");
    }

    // Verify user belongs to this organisation
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

    // Verify organisation exists and is a gym-type (not corporate)
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    if (!orgDoc.exists) {
      throw new HttpsError("not-found", "Organisation not found");
    }

    const orgData = orgDoc.data();
    const orgType = orgData?.type;

    // Only allow bookings for gym-type organisations
    const gymTypes = ["gym", "yoga", "pilates", "hiit", "sauna"];
    if (!orgType || !gymTypes.includes(orgType)) {
      throw new HttpsError("failed-precondition", "Bookings are only available for gym-type organisations");
    }

    // Create booking with access check
    const result = await createBookingWithAccessCheck(userId, organisationId, classId);

    if (!result.success) {
      throw new HttpsError("failed-precondition", result.reason || "Failed to book class");
    }

    // Send booking confirmation email (non-blocking)
    const classDoc = await db.collection("classes").doc(classId).get();
    const classData = classDoc.exists ? classDoc.data() : null;
    const userEmail = userData?.email;
    const orgName = orgData?.name || "your gym";

    if (userEmail && classData) {
      const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date);
      sendBookingConfirmationEmail(userEmail, {
        className: classData.name || "Class",
        classDate: classDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        classTime: classData.startTime && classData.endTime ? `${classData.startTime} - ${classData.endTime}` : classData.startTime || "TBC",
        organisationName: orgName,
      }).catch((err) => console.error("Booking confirmation email failed:", err));
    }

    return {
      success: true,
      bookingId: result.bookingId,
      message: "Class booked successfully"
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Error booking class:", error);
    throw new HttpsError("internal", error.message || "Failed to book class");
  }
});

