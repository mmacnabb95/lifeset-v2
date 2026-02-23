import { onCall } from "firebase-functions/v2/https";
import { db } from "../config";
import * as admin from "firebase-admin";
import { sendWaitlistSpotOpenedEmail } from "../services/email";

/**
 * Cloud Function for members to cancel a class booking
 * When a spot opens, notifies the first person on the waitlist
 */
export const cancelBooking = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const userId = request.auth.uid;
    const { bookingId } = request.data;

    if (!bookingId) {
      throw new Error("Missing required field: bookingId");
    }

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new Error("Booking not found");
    }

    const bookingData = bookingDoc.data();
    if (!bookingData) {
      throw new Error("Booking data not found");
    }

    // User can only cancel their own booking
    if (bookingData.userId !== userId) {
      throw new Error("You can only cancel your own bookings");
    }

    // Cannot cancel already cancelled booking
    if (bookingData.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Check cancellation policy: must cancel at least X hours before class
    const classDoc = await db.collection("classes").doc(bookingData.classId).get();
    if (classDoc.exists) {
      const classData = classDoc.data();
      const classDate = classData?.date?.toDate ? classData.date.toDate() : new Date(classData?.date);
      const [startH, startM] = (classData?.startTime || "09:00").split(":").map(Number);
      const classStart = new Date(classDate);
      classStart.setHours(startH, startM, 0, 0);

      const orgDoc = await db.collection("organisations").doc(bookingData.organisationId).get();
      const orgData = orgDoc.exists ? orgDoc.data() : null;
      const hoursBefore = orgData?.cancellationPolicyHours;
      if (typeof hoursBefore === "number" && hoursBefore > 0) {
        const cutoff = new Date(classStart.getTime() - hoursBefore * 60 * 60 * 1000);
        if (new Date() > cutoff) {
          throw new Error(
            `Cancellation policy: you must cancel at least ${hoursBefore} hour${hoursBefore === 1 ? "" : "s"} before the class starts.`
          );
        }
      }
    }

    await bookingRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const classId = bookingData.classId;
    const organisationId = bookingData.organisationId;

    // Notify first person on waitlist (non-blocking)
    if (classId && organisationId) {
      try {
        const waitlistSnap = await db.collection("waitlistEntries")
          .where("classId", "==", classId)
          .get();

        const sorted = waitlistSnap.docs
          .sort((a, b) => {
            const aAt = a.data().createdAt?.toDate?.() || new Date(a.data().createdAt);
            const bAt = b.data().createdAt?.toDate?.() || new Date(b.data().createdAt);
            return aAt.getTime() - bAt.getTime();
          });

        if (sorted.length > 0) {
          const first = sorted[0];
          const entry = first.data();
          await first.ref.delete();

          const classDoc = await db.collection("classes").doc(classId).get();
          const classData = classDoc.exists ? classDoc.data() : null;
          const orgDoc = await db.collection("organisations").doc(organisationId).get();
          const orgData = orgDoc.exists ? orgDoc.data() : null;

          if (entry.email && classData) {
            const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date);
            sendWaitlistSpotOpenedEmail(entry.email, {
              className: classData.name || "Class",
              classDate: classDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
              classTime: classData.startTime && classData.endTime ? `${classData.startTime} - ${classData.endTime}` : classData.startTime || "TBC",
              organisationName: orgData?.name || "your gym",
            }).catch((err) => console.error("Waitlist notification failed:", err));
          }
        }
      } catch (waitlistErr) {
        console.error("Waitlist processing error:", waitlistErr);
      }
    }

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    throw new Error(error.message || "Failed to cancel booking");
  }
});
