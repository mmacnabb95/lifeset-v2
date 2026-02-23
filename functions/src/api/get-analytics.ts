import { onCall } from "firebase-functions/v2/https";
import { db } from "../config";

/**
 * Callable: Get analytics for an organisation.
 * Uses admin access so no Firestore rules apply - fixes permission/index issues.
 */
export const getAnalytics = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const { organisationId, timeRange = "month" } = request.data || {};
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
      throw new Error("Only staff or admins can view analytics");
    }
    const staffOrgIds = [
      staffData?.organisationId,
      staffData?.activeOrganisationId,
      ...(staffData?.organisations || []),
    ].filter(Boolean);
    if (!staffOrgIds.includes(organisationId)) {
      throw new Error("You do not have access to this organisation");
    }

    const now = new Date();
    const startDate = new Date();
    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get members (belong to org)
    const membersSnap = await db.collection("users")
      .where("organisationId", "==", organisationId)
      .get();
    const membersByActiveSnap = await db.collection("users")
      .where("activeOrganisationId", "==", organisationId)
      .get();
    const memberIds = new Set<string>();
    membersSnap.docs.forEach((d) => memberIds.add(d.id));
    membersByActiveSnap.docs.forEach((d) => memberIds.add(d.id));
    const totalMembers = memberIds.size;

    const newMembersThisMonth = [...membersSnap.docs, ...membersByActiveSnap.docs]
      .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
      .filter((d) => {
        const createdAt = d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null;
        return createdAt && createdAt >= startDate;
      }).length;

    // Get all attendance for org
    const attendanceSnap = await db.collection("attendance")
      .where("organisationId", "==", organisationId)
      .get();

    const totalCheckIns = attendanceSnap.size;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const checkInsThisWeek = attendanceSnap.docs.filter((d) => {
      const checkedInAt = d.data().checkedInAt?.toDate ? d.data().checkedInAt.toDate() : new Date(0);
      return checkedInAt >= weekStart;
    }).length;

    const activeMemberIds = new Set<string>();
    attendanceSnap.docs.forEach((d) => {
      const checkedInAt = d.data().checkedInAt?.toDate ? d.data().checkedInAt.toDate() : null;
      if (checkedInAt && checkedInAt >= startDate) {
        activeMemberIds.add(d.data().userId);
      }
    });

    // Get all bookings for org
    const bookingsSnap = await db.collection("bookings")
      .where("organisationId", "==", organisationId)
      .get();

    bookingsSnap.docs.forEach((d) => {
      const data = d.data();
      const bookedAt = data.bookedAt?.toDate ? data.bookedAt.toDate() : null;
      if (bookedAt && bookedAt >= startDate) {
        activeMemberIds.add(data.userId);
      }
    });

    const activeMembers = activeMemberIds.size;

    // Get classes
    const classesSnap = await db.collection("classes")
      .where("organisationId", "==", organisationId)
      .get();

    const totalClasses = classesSnap.size;
    const upcomingClasses = classesSnap.docs.filter((d) => {
      const classDate = d.data().date?.toDate ? d.data().date.toDate() : new Date(0);
      return classDate >= now;
    }).length;

    const confirmedBookings = bookingsSnap.docs.filter((d) => d.data().status === "confirmed").length;
    const totalBookings = bookingsSnap.size;

    // Most popular class (by bookings)
    const classBookings: Record<string, number> = {};
    bookingsSnap.docs.forEach((d) => {
      const data = d.data();
      if (data.classId && data.status === "confirmed") {
        classBookings[data.classId] = (classBookings[data.classId] || 0) + 1;
      }
    });

    let mostPopularClass = "None";
    let maxBookings = 0;
    for (const [classId, count] of Object.entries(classBookings)) {
      if (count > maxBookings) {
        maxBookings = count;
        const classDoc = classesSnap.docs.find((c) => c.id === classId);
        mostPopularClass = classDoc ? (classDoc.data().name || "Unnamed Class") : "Unknown";
      }
    }

    // Average class attendance
    const classAttendance: Record<string, number> = {};
    attendanceSnap.docs.forEach((d) => {
      const classId = d.data().classId;
      if (classId) {
        classAttendance[classId] = (classAttendance[classId] || 0) + 1;
      }
    });
    const totalAttendance = Object.values(classAttendance).reduce((sum, c) => sum + c, 0);
    const classesWithAttendance = Object.keys(classAttendance).length;
    const averageClassAttendance = classesWithAttendance > 0 ? Math.round(totalAttendance / classesWithAttendance) : 0;

    // Memberships
    const membershipsSnap = await db.collection("memberships")
      .where("organisationId", "==", organisationId)
      .get();

    let activeMemberships = 0;
    let expiredMemberships = 0;
    let totalMembershipRevenue = 0;
    const membershipCounts: Record<string, number> = {};

    for (const doc of membershipsSnap.docs) {
      const data = doc.data();
      if (data.userId) {
        if (data.status === "active") activeMemberships++;
        else if (data.status === "expired") expiredMemberships++;

        if (data.membershipTierId) {
          const tierDoc = await db.collection("memberships").doc(data.membershipTierId).get();
          if (tierDoc.exists) {
            const tierData = tierDoc.data();
            totalMembershipRevenue += tierData?.price || 0;
            const tierName = tierData?.name || "Unknown";
            membershipCounts[tierName] = (membershipCounts[tierName] || 0) + 1;
          }
        }
      }
    }

    // Packs
    const packsSnap = await db.collection("packs")
      .where("organisationId", "==", organisationId)
      .get();

    const packPrices: Record<string, number> = {};
    packsSnap.docs.forEach((d) => {
      packPrices[d.id] = d.data().price || 0;
    });

    const packPurchasesSnap = await db.collection("packPurchases")
      .where("organisationId", "==", organisationId)
      .get();

    let activePackPurchases = 0;
    let totalPackRevenue = 0;
    const packCounts: Record<string, number> = {};

    for (const doc of packPurchasesSnap.docs) {
      const data = doc.data();
      if (data.status === "active") activePackPurchases++;
      totalPackRevenue += packPrices[data.packId] || 0;
      if (data.packId) {
        const packDoc = packsSnap.docs.find((p) => p.id === data.packId);
        const packName = packDoc ? packDoc.data().name || "Unknown" : "Unknown";
        packCounts[packName] = (packCounts[packName] || 0) + 1;
      }
    }

    let mostPopularPack = "None";
    let maxPackCount = 0;
    for (const [name, count] of Object.entries(packCounts)) {
      if (count > maxPackCount) {
        maxPackCount = count;
        mostPopularPack = name;
      }
    }

    let mostPopularMembership = "None";
    let maxMembershipCount = 0;
    for (const [name, count] of Object.entries(membershipCounts)) {
      if (count > maxMembershipCount) {
        maxMembershipCount = count;
        mostPopularMembership = name;
      }
    }

    return {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalClasses,
      upcomingClasses,
      totalBookings,
      confirmedBookings,
      totalCheckIns,
      checkInsThisWeek,
      mostPopularClass,
      averageClassAttendance,
      activeMemberships,
      expiredMemberships,
      totalPackPurchases: packPurchasesSnap.size,
      activePackPurchases,
      totalPackRevenue,
      totalMembershipRevenue,
      mostPopularPack,
      mostPopularMembership,
    };
  } catch (error: any) {
    console.error("Error getting analytics:", error);
    throw new Error(error.message || "Failed to load analytics");
  }
});
