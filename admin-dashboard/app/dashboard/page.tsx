"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    members: 0,
    activeMemberships: 0,
    upcomingClasses: 0,
    todayBookings: 0,
    activePacks: 0,
    totalPackPurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  // Auto-refresh stats when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadStats();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log("No user found");
        setLoading(false);
        return;
      }

      // Get user's organisation
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log("User document not found");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const organisationId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];

      if (!organisationId) {
        console.log("No organisation ID found");
        setLoading(false);
        return;
      }

      console.log("Loading stats for organisation:", organisationId);

      // Get members count
      const membersQuery = query(
        collection(db, "users"),
        where("organisationId", "==", organisationId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersCount = membersSnapshot.size;
      console.log("Members count:", membersCount);

      // Get active memberships count
      // Note: Filter out tiers (tiers don't have userId or status)
      const membershipsQuery = query(
        collection(db, "memberships"),
        where("organisationId", "==", organisationId),
        where("status", "==", "active")
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      
      // Filter out tiers (tiers have userId: null, user memberships have userId set)
      const activeMemberships = membershipsSnapshot.docs.filter(
        (doc) => doc.data().userId != null
      );
      const activeMembershipsCount = activeMemberships.length;
      console.log("Active memberships count:", activeMembershipsCount, "Total docs:", membershipsSnapshot.size);

      // Get upcoming classes (next 7 days)
      // Note: Using single where clause to avoid index requirement
      // We'll filter in memory for date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const classesQuery = query(
        collection(db, "classes"),
        where("organisationId", "==", organisationId)
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      // Filter by date range in memory
      const upcomingClasses = classesSnapshot.docs.filter((doc) => {
        const classData = doc.data();
        const classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date);
        return classDate >= today && classDate <= nextWeek;
      });
      const upcomingClassesCount = upcomingClasses.length;

      // Get today's bookings
      const todayForBookings = new Date();
      todayForBookings.setHours(0, 0, 0, 0);
      const todayStart = todayForBookings;
      const todayEnd = new Date(todayForBookings);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Note: Using single where clause to avoid index requirement
      // We'll filter in memory for date range
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("organisationId", "==", organisationId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      // Filter by date range in memory
      const todayBookings = bookingsSnapshot.docs.filter((doc) => {
        const bookingData = doc.data();
        const createdAt = bookingData.createdAt?.toDate ? bookingData.createdAt.toDate() : new Date(bookingData.createdAt);
        return createdAt >= todayStart && createdAt <= todayEnd;
      });
      const todayBookingsCount = todayBookings.length;

      // Get active packs count
      const packsQuery = query(
        collection(db, "packs"),
        where("organisationId", "==", organisationId),
        where("active", "==", true)
      );
      const packsSnapshot = await getDocs(packsQuery);
      const activePacksCount = packsSnapshot.size;

      // Get total pack purchases count
      const packPurchasesQuery = query(
        collection(db, "packPurchases"),
        where("organisationId", "==", organisationId)
      );
      const packPurchasesSnapshot = await getDocs(packPurchasesQuery);
      const totalPackPurchasesCount = packPurchasesSnapshot.size;

      const newStats = {
        members: membersCount,
        activeMemberships: activeMembershipsCount,
        upcomingClasses: upcomingClassesCount,
        todayBookings: todayBookingsCount,
        activePacks: activePacksCount,
        totalPackPurchases: totalPackPurchasesCount,
      };
      
      console.log("Setting stats:", newStats);
      setStats(newStats);

      // Check setup status for gym-type orgs
      const orgDoc = await getDoc(doc(db, "organisations", organisationId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        const gymTypes = ["gym", "yoga", "pilates", "hiit", "sauna"];
        if (gymTypes.includes(orgData?.type || "")) {
          const hasStripe = !!orgData?.stripeAccountId;
          const membershipsSnap = await getDocs(
            query(collection(db, "memberships"), where("organisationId", "==", organisationId))
          );
          const hasTier = membershipsSnap.docs.some((d) => !d.data().userId);
          const classesSnap = await getDocs(
            query(collection(db, "classes"), where("organisationId", "==", organisationId))
          );
          setSetupComplete(hasStripe && hasTier && classesSnap.size > 0);
        } else {
          setSetupComplete(true);
        }
      } else {
        setSetupComplete(true);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Show error to user
      alert(`Error loading stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {setupComplete === false && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-amber-800">
            <strong>Complete your setup</strong> – Connect Stripe, add a membership, and create your first class to start accepting members.
          </p>
          <Link
            href="/dashboard/setup"
            className="shrink-0 ml-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
          >
            Complete Setup
          </Link>
        </div>
      )}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your organisation
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Members
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.members}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/members"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                View all members
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">💳</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Memberships
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activeMemberships}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/memberships"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                Manage memberships
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Classes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.upcomingClasses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/schedule"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                View schedule
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today&apos;s Bookings
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.todayBookings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/bookings"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                View bookings
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📦</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Packs
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activePacks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/packs"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                Manage packs
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pack Purchases
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalPackPurchases}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/packs"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                View purchases
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/members"
            className="block p-4 border border-gray-200 rounded-lg hover:border-lifeset-primary hover:bg-lifeset-primary-light transition"
          >
            <h3 className="font-medium text-gray-900">Add Member</h3>
            <p className="mt-1 text-sm text-gray-500">
              Invite a new member to your organisation
            </p>
          </Link>
          <Link
            href="/dashboard/schedule"
            className="block p-4 border border-gray-200 rounded-lg hover:border-lifeset-primary hover:bg-lifeset-primary-light transition"
          >
            <h3 className="font-medium text-gray-900">Create Class</h3>
            <p className="mt-1 text-sm text-gray-500">
              Schedule a new class or session
            </p>
          </Link>
          <Link
            href="/dashboard/memberships"
            className="block p-4 border border-gray-200 rounded-lg hover:border-lifeset-primary hover:bg-lifeset-primary-light transition"
          >
            <h3 className="font-medium text-gray-900">New Membership</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new membership tier
            </p>
          </Link>
          <Link
            href="/dashboard/packs"
            className="block p-4 border border-gray-200 rounded-lg hover:border-lifeset-primary hover:bg-lifeset-primary-light transition"
          >
            <h3 className="font-medium text-gray-900">Create Pack</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new class pack
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

