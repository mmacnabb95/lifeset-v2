"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

interface Booking {
  bookingId: string;
  userId: string;
  organisationId: string;
  classId?: string;
  className?: string;
  status: "confirmed" | "cancelled" | "completed";
  bookedAt: Date;
  cancelledAt?: Date;
  createdAt?: any;
  // User info (we'll fetch separately)
  userEmail?: string;
  username?: string;
}

interface Class {
  classId: string;
  name: string;
  date: Date;
  startTime: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  
  // Filters
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (organisationId) {
      loadBookings();
    }
  }, [organisationId, filterClassId, filterStatus, filterDate]);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // Get user's organisation
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const orgId = userData?.organisationId || userData?.activeOrganisationId || userData?.organisations?.[0];

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);

      // Load classes
      const classesQuery = query(
        collection(db, "classes"),
        where("organisationId", "==", orgId),
        orderBy("date", "desc")
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classesList: Class[] = [];
      classesSnapshot.forEach((doc) => {
        const data = doc.data();
        classesList.push({
          classId: doc.id,
          name: data.name || "Unnamed Class",
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          startTime: data.startTime || "",
        });
      });

      setClasses(classesList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!organisationId) return;

    try {
      // Query by organisationId only (avoids composite index), filter and sort in memory
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("organisationId", "==", organisationId)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookingsList: Booking[] = [];
      
      for (const bookingDoc of bookingsSnapshot.docs) {
        const data = bookingDoc.data();
        
        // Get class name if classId exists
        let className = "No Class";
        if (data.classId) {
          const classDoc = await getDoc(doc(db, "classes", data.classId));
          if (classDoc.exists()) {
            className = classDoc.data().name || "Unnamed Class";
          }
        }

        // Get user info
        let userEmail = "";
        let username = "";
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", data.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userEmail = userData.email || "";
              username = userData.username || "";
            }
          } catch (error) {
            console.error("Error loading user:", error);
          }
        }

        // Apply filters in memory
        if (filterClassId !== "all" && data.classId !== filterClassId) continue;
        if (filterStatus !== "all" && data.status !== filterStatus) continue;

        const bookedDate = data.bookedAt?.toDate ? data.bookedAt.toDate() : new Date(data.bookedAt);
        if (filterDate) {
          const filterDateObj = new Date(filterDate);
          if (
            bookedDate.getDate() !== filterDateObj.getDate() ||
            bookedDate.getMonth() !== filterDateObj.getMonth() ||
            bookedDate.getFullYear() !== filterDateObj.getFullYear()
          ) {
            continue;
          }
        }

        bookingsList.push({
          bookingId: bookingDoc.id,
          userId: data.userId || "",
          organisationId: data.organisationId || "",
          classId: data.classId || undefined,
          className,
          status: data.status || "confirmed",
          bookedAt: bookedDate,
          cancelledAt: data.cancelledAt?.toDate ? data.cancelledAt.toDate() : undefined,
          createdAt: data.createdAt,
          userEmail,
          username,
        });
      }

      // Sort by bookedAt descending
      bookingsList.sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime());

      setBookings(bookingsList);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      
      // Reload bookings
      await loadBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.userEmail?.toLowerCase().includes(searchLower) ||
      booking.username?.toLowerCase().includes(searchLower) ||
      booking.className?.toLowerCase().includes(searchLower) ||
      booking.bookingId.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class bookings
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage bookings.
          </p>
        </div>
      </div>
    );
  }

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage class bookings ({bookings.length} total)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
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
                    {confirmedCount}
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
                <div className="text-2xl">❌</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cancelled
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {cancelledCount}
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
                <div className="text-2xl">✓</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by member or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            >
              <option value="all">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem.classId} value={classItem.classId}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booked At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm || filterClassId !== "all" || filterStatus !== "all" || filterDate
                    ? "No bookings found matching your filters"
                    : "No bookings yet"}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lifeset-primary-light flex items-center justify-center">
                        <span className="text-lifeset-primary font-medium">
                          {booking.username?.charAt(0).toUpperCase() || booking.userEmail?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.username || "No username"}
                        </div>
                        <div className="text-sm text-gray-500">{booking.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.className}</div>
                    {booking.classId && (
                      <Link
                        href={`/dashboard/schedule?classId=${booking.classId}`}
                        className="text-xs text-lifeset-primary hover:text-lifeset-primary-dark"
                      >
                        View Class
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.bookedAt.toLocaleDateString()} {booking.bookedAt.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === "cancelled" && booking.cancelledAt && (
                      <span className="text-gray-400 text-xs">
                        Cancelled {booking.cancelledAt.toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

