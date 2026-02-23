import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { db } from "../config";
import { sendClassReminderEmail } from "../services/email";

/**
 * Scheduled job to send class reminder emails ~24h before class.
 * Runs every 6 hours to catch classes in different timezones.
 * Sends for classes starting in 20-28 hours from run time.
 */
export const sendClassReminders = onSchedule(
  {
    schedule: "0 */6 * * *",
    timeZone: "UTC",
  },
  async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000);

    const classesSnap = await db.collection("classes").get();
    let sent = 0;

    for (const classDoc of classesSnap.docs) {
      const classData = classDoc.data();
      const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date);
      const [startH, startM] = (classData.startTime || "09:00").split(":").map(Number);
      const classStart = new Date(classDate);
      classStart.setHours(startH, startM, 0, 0);

      if (classStart < windowStart || classStart > windowEnd) continue;

      const bookingsSnap = await db.collection("bookings")
        .where("classId", "==", classDoc.id)
        .where("status", "==", "confirmed")
        .get();

      if (bookingsSnap.empty) continue;

      const orgDoc = await db.collection("organisations").doc(classData.organisationId).get();
      const orgData = orgDoc.exists ? orgDoc.data() : null;
      const orgName = orgData?.name || "your gym";

      const classDateStr = classStart.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const classTimeStr =
        classData.startTime && classData.endTime
          ? `${classData.startTime} - ${classData.endTime}`
          : classData.startTime || "TBC";

      for (const bookingDoc of bookingsSnap.docs) {
        const booking = bookingDoc.data();
        if (booking.reminderSentAt) continue;

        const userDoc = await db.collection("users").doc(booking.userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;
        const email = userData?.email;
        if (!email) continue;

        try {
          await sendClassReminderEmail(email, {
            className: classData.name || "Class",
            classDate: classDateStr,
            classTime: classTimeStr,
            organisationName: orgName,
          });
          await bookingDoc.ref.update({
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          sent++;
        } catch (err) {
          console.error(`Failed to send reminder for booking ${bookingDoc.id}:`, err);
        }
      }
    }

    if (sent > 0) {
      console.log(`sendClassReminders: Sent ${sent} reminder emails`);
    }
  }
);
