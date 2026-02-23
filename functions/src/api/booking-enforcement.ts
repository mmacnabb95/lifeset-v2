// Booking enforcement utilities
import { db } from "../config";
import * as admin from "firebase-admin";

/**
 * Check if user can book a class
 * Returns: { canBook: boolean, reason?: string }
 */
export async function canUserBookClass(
  userId: string,
  organisationId: string,
  classId: string
): Promise<{ canBook: boolean; reason?: string }> {
  try {
    // Get class
    const classDoc = await db.collection("classes").doc(classId).get();
    if (!classDoc.exists) {
      return { canBook: false, reason: "Class not found" };
    }

    const classData = classDoc.data();
    if (!classData) {
      return { canBook: false, reason: "Class data not found" };
    }

    if (classData.organisationId !== organisationId) {
      return { canBook: false, reason: "Class does not belong to organisation" };
    }

    // Check class capacity - query by classId only, filter status in memory (avoids composite index)
    const bookingsQuery = await db.collection("bookings")
      .where("classId", "==", classId)
      .get();
    const currentBookings = bookingsQuery.docs.filter((d) => d.data().status === "confirmed").length;
    if (currentBookings >= (classData.capacity || 0)) {
      return { canBook: false, reason: "Class is full" };
    }

    // Check if user already booked this class - query by userId only, filter in memory (avoids composite index)
    const userBookingsSnap = await db.collection("bookings")
      .where("userId", "==", userId)
      .get();
    const alreadyBooked = userBookingsSnap.docs.some(
      (d) => d.data().classId === classId && d.data().status === "confirmed"
    );

    if (alreadyBooked) {
      return { canBook: false, reason: "Already booked this class" };
    }

    // Org admins/staff can book without membership (for testing and staff access)
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const userRole = userData?.role;
    const isOrgAdminOrStaff = userRole === "admin" || userRole === "staff";

    if (!isOrgAdminOrStaff) {
      // Check for active membership - query by userId only to avoid composite index, filter in memory
      const membershipsSnap = await db.collection("memberships")
        .where("userId", "==", userId)
        .get();
      const hasActiveMembership = membershipsSnap.docs.some((d) => {
        const data = d.data();
        return (
          data.organisationId === organisationId &&
          data.status === "active" &&
          data.expiresAt &&
          data.expiresAt.toDate &&
          data.expiresAt.toDate() > new Date()
        );
      });

      // Check for active pack - query by userId only to avoid composite index, filter in memory
      const packsSnap = await db.collection("packPurchases")
        .where("userId", "==", userId)
        .get();
      const hasActivePack = packsSnap.docs.some((d) => {
        const data = d.data();
        return (
          data.organisationId === organisationId &&
          data.status === "active" &&
          (data.classesRemaining || 0) > 0 &&
          data.expiresAt &&
          data.expiresAt.toDate &&
          data.expiresAt.toDate() > new Date()
        );
      });

      if (!hasActiveMembership && !hasActivePack) {
        // Check intro offer: first class free for new members
        const orgDoc = await db.collection("organisations").doc(organisationId).get();
        const orgData = orgDoc.exists ? orgDoc.data() : null;
        const introOfferEnabled = orgData?.introOfferFirstClassFree === true;

        if (introOfferEnabled) {
          const orgBookingsSnap = await db.collection("bookings")
            .where("userId", "==", userId)
            .get();
          const hasBookedAtOrg = orgBookingsSnap.docs.some(
            (d) => d.data().organisationId === organisationId && d.data().status === "confirmed"
          );
          if (!hasBookedAtOrg) {
            // First class free - allow
            return { canBook: true };
          }
        }

        return { canBook: false, reason: "You need an active membership or class pack to book. Purchase one from your organisation." };
      }
    }

    return { canBook: true };
  } catch (error: any) {
    console.error("Error checking booking eligibility:", error);
    const msg = error?.message || "Error checking eligibility";
    if (msg.includes("index") || error?.code === "failed-precondition") {
      return { canBook: false, reason: "A database index is required. Please check Firebase Console for index creation prompts." };
    }
    return { canBook: false, reason: msg };
  }
}

/**
 * Create booking and decrement pack if applicable
 */
export async function createBookingWithAccessCheck(
  userId: string,
  organisationId: string,
  classId: string
): Promise<{ success: boolean; bookingId?: string; reason?: string }> {
  try {
    // Check if user can book
    const accessCheck = await canUserBookClass(userId, organisationId, classId);
    if (!accessCheck.canBook) {
      return { success: false, reason: accessCheck.reason };
    }

    // Get active pack (if using pack) - query by userId only, filter in memory
    const packsSnap = await db.collection("packPurchases")
      .where("userId", "==", userId)
      .get();
    const activePackDoc = packsSnap.docs.find((d) => {
      const data = d.data();
      return (
        data.organisationId === organisationId &&
        data.status === "active" &&
        (data.classesRemaining || 0) > 0 &&
        data.expiresAt &&
        data.expiresAt.toDate &&
        data.expiresAt.toDate() > new Date()
      );
    });

    // Create booking
    const bookingRef = db.collection("bookings").doc();
    await bookingRef.set({
      bookingId: bookingRef.id,
      userId,
      organisationId,
      classId,
      status: "confirmed",
      bookedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If using pack, decrement classes remaining
    if (activePackDoc) {
      const packDoc = activePackDoc;
      const currentRemaining = packDoc.data().classesRemaining || 0;

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

    return { success: true, bookingId: bookingRef.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { success: false, reason: error.message };
  }
}

