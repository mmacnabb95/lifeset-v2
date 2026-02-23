import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";

/**
 * Callable: Get attendance for an organisation.
 * Uses admin access so no Firestore rules apply - fixes permission/index issues.
 */
export const getAttendance = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const { organisationId, filterClassId, filterMemberId } = request.data || {};
    if (!organisationId) {
      throw new Error("Missing required field: organisationId");
    }

    // Verify caller is staff/admin of this org
    const staffDoc = await db.collection("users").doc(request.auth.uid).get();
    if (!staffDoc.exists) {
      throw new Error("User not found");
    }
    const staffData = staffDoc.data();
    const role = staffData?.role;
    if (role !== "admin" && role !== "staff") {
      throw new Error("Only staff or admins can view attendance");
    }
    const staffOrgIds = [
      staffData?.organisationId,
      staffData?.activeOrganisationId,
      ...(staffData?.organisations || []),
    ].filter(Boolean);
    if (!staffOrgIds.includes(organisationId)) {
      throw new Error("You do not have access to this organisation");
    }

    let attendanceQuery = db
      .collection("attendance")
      .where("organisationId", "==", organisationId)
      .orderBy("checkedInAt", "desc")
      .limit(500);

    const snapshot = await attendanceQuery.get();

    const attendanceList: Array<{
      attendanceId: string;
      userId: string;
      organisationId: string;
      classId?: string;
      className?: string;
      checkedInAt: admin.firestore.Timestamp;
      userEmail?: string;
      username?: string;
      profilePictureUrl?: string;
    }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (filterClassId && filterClassId !== "all" && data.classId !== filterClassId) {
        continue;
      }
      if (filterMemberId && filterMemberId !== "all" && data.userId !== filterMemberId) {
        continue;
      }

      let className = "No Class";
      if (data.classId) {
        const classDoc = await db.collection("classes").doc(data.classId).get();
        if (classDoc.exists) {
          className = classDoc.data()?.name || "Unnamed Class";
        }
      }

      let userEmail = "";
      let username = "";
      let profilePictureUrl = "";
      if (data.userId) {
        const userDoc = await db.collection("users").doc(data.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userEmail = userData?.email || "";
          username = userData?.username || "";
          profilePictureUrl = userData?.profilePictureUrl || "";
        }
      }

      const checkedInAt = data.checkedInAt as admin.firestore.Timestamp;
      attendanceList.push({
        attendanceId: doc.id,
        userId: data.userId || "",
        organisationId: data.organisationId || "",
        classId: data.classId || undefined,
        className,
        checkedInAt,
        userEmail,
        username,
        profilePictureUrl: profilePictureUrl || undefined,
      });
    }

    return {
      attendance: attendanceList.map((a) => ({
        ...a,
        checkedInAt: a.checkedInAt?.toMillis ? a.checkedInAt.toMillis() : 0,
      })),
    };
  } catch (error: any) {
    console.error("Error getting attendance:", error);
    throw new Error(error.message || "Failed to load attendance");
  }
});
