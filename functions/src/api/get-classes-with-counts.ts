import { onCall } from "firebase-functions/v2/https";
import { db } from "../config";

/**
 * Callable: Get classes for an organisation with booking counts.
 * Uses admin access so no Firestore rules apply - fixes "Missing or insufficient permissions" for booking count queries.
 */
export const getClassesWithBookingCounts = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const { organisationId } = request.data;
    if (!organisationId) {
      throw new Error("Missing required field: organisationId");
    }

    const classesQuery = await db.collection("classes")
      .where("organisationId", "==", organisationId)
      .get();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classes = await Promise.all(
      classesQuery.docs.map(async (classDoc) => {
        const data = classDoc.data();
        const classDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        const daysDiff = Math.floor((classDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Only include upcoming classes (next 30 days)
        if (daysDiff < 0 || daysDiff > 30) {
          return null;
        }

        const bookingsSnap = await db.collection("bookings")
          .where("classId", "==", classDoc.id)
          .get();
        const bookedCount = bookingsSnap.docs.filter((d) => d.data().status === "confirmed").length;

        const dateVal = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return {
          classId: classDoc.id,
          name: data.name || "Unnamed Class",
          description: data.description,
          instructor: data.instructor,
          date: dateVal.toISOString(),
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          capacity: data.capacity || 0,
          bookedCount,
        };
      })
    );

    const filtered = classes.filter((c): c is NonNullable<typeof c> => c !== null);
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { classes: filtered };
  } catch (error: any) {
    console.error("Error getting classes with counts:", error);
    throw new Error(error.message || "Failed to load classes");
  }
});
