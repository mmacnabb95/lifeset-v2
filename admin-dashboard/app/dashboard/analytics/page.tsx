"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface Analytics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalClasses: number;
  upcomingClasses: number;
  totalBookings: number;
  confirmedBookings: number;
  totalCheckIns: number;
  checkInsThisWeek: number;
  mostPopularClass: string;
  averageClassAttendance: number;
  // Pack & Membership insights
  activeMemberships: number;
  expiredMemberships: number;
  totalPackPurchases: number;
  activePackPurchases: number;
  totalPackRevenue: number;
  totalMembershipRevenue: number;
  mostPopularPack: string;
  mostPopularMembership: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const orgId =
        userData?.organisationId ||
        userData?.activeOrganisationId ||
        (userData?.organisations && userData.organisations[0]);

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);

      const getAnalyticsFn = httpsCallable(functions, "getAnalytics");
      const result = await getAnalyticsFn({ organisationId: orgId, timeRange });
      const data = result.data as Analytics;

      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
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

  if (!organisationId) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            View organisation insights and statistics
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            View organisation insights and statistics
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">No analytics data available yet.</p>
        </div>
      </div>
    );
  }

  const memberGrowthRate = analytics.totalMembers > 0 
    ? ((analytics.newMembersThisMonth / analytics.totalMembers) * 100).toFixed(1)
    : "0";

  const bookingConversionRate = analytics.totalBookings > 0
    ? ((analytics.confirmedBookings / analytics.totalBookings) * 100).toFixed(1)
    : "0";

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Organisation insights and statistics
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === "week"
                ? "bg-lifeset-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === "month"
                ? "bg-lifeset-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === "year"
                ? "bg-lifeset-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Statistics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                      {analytics.totalMembers}
                    </dd>
                  </dl>
                </div>
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
                      Active Members ({timeRange})
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.activeMembers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📈</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New This Month
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.newMembersThisMonth}
                    </dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      {memberGrowthRate}% growth
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Class Statistics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Classes
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.totalClasses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🔜</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Classes
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.upcomingClasses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⭐</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Most Popular
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 truncate">
                      {analytics.mostPopularClass}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking & Attendance Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking & Attendance</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📝</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Bookings
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.totalBookings}
                    </dd>
                  </dl>
                </div>
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
                      Confirmed
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.confirmedBookings}
                    </dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      {bookingConversionRate}% rate
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Check-ins
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.totalCheckIns}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📈</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      This Week
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.checkInsThisWeek}
                    </dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      Avg: {analytics.averageClassAttendance}/class
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pack & Membership Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pack & Membership Insights</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      {analytics.activeMemberships}
                    </dd>
                  </dl>
                </div>
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
                      Active Pack Purchases
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {analytics.activePackPurchases}
                    </dd>
                  </dl>
                </div>
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
                      Total Pack Revenue
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ${analytics.totalPackRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">💵</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Membership Revenue
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ${analytics.totalMembershipRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Most Popular Pack</h3>
            <p className="text-xl font-semibold text-gray-900">{analytics.mostPopularPack}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalPackPurchases} total purchases
            </p>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Most Popular Membership</h3>
            <p className="text-xl font-semibold text-gray-900">{analytics.mostPopularMembership}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.activeMemberships + analytics.expiredMemberships} total memberships
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-lifeset-primary to-lifeset-accent rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">Member Engagement</p>
            <p className="text-2xl font-bold">
              {analytics.totalMembers > 0 
                ? ((analytics.activeMembers / analytics.totalMembers) * 100).toFixed(0)
                : "0"}%
            </p>
            <p className="text-xs opacity-75 mt-1">
              {analytics.activeMembers} of {analytics.totalMembers} members active
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${(analytics.totalPackRevenue + analytics.totalMembershipRevenue).toFixed(2)}
            </p>
            <p className="text-xs opacity-75 mt-1">
              Packs: ${analytics.totalPackRevenue.toFixed(2)} | Memberships: ${analytics.totalMembershipRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

