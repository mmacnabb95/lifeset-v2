"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, orderBy } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface Attendance {
  attendanceId: string;
  userId: string;
  organisationId: string;
  classId?: string;
  className?: string;
  checkedInAt: Date;
  createdAt?: any;
  // User info
  userEmail?: string;
  username?: string;
  profilePictureUrl?: string;
}

interface Class {
  classId: string;
  name: string;
  date: Date;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  
  // Filters
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [filterMemberId, setFilterMemberId] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Manual check-in
  const [showManualCheckIn, setShowManualCheckIn] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (organisationId) {
      loadAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationId, filterClassId, filterMemberId, filterDate]);

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
      const orgId =
        userData?.organisationId ||
        userData?.activeOrganisationId ||
        (userData?.organisations && userData.organisations[0]);

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
        });
      });

      setClasses(classesList);

      // Load members
      const membersQuery = query(
        collection(db, "users"),
        where("organisationId", "==", orgId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      const membersList: any[] = [];
      membersSnapshot.forEach((doc) => {
        const data = doc.data();
        membersList.push({
          uid: doc.id,
          email: data.email || "",
          username: data.username || "",
          profilePictureUrl: data.profilePictureUrl || undefined,
        });
      });

      setMembers(membersList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!organisationId) return;

    try {
      const getAttendanceFn = httpsCallable(functions, "getAttendance");
      const result = await getAttendanceFn({
        organisationId,
        filterClassId: filterClassId !== "all" ? filterClassId : undefined,
        filterMemberId: filterMemberId !== "all" ? filterMemberId : undefined,
      });

      const data = result.data as { attendance: Array<{ checkedInAt: number } & Attendance> };
      const rawList = data?.attendance || [];

      const attendanceList: Attendance[] = [];
      for (const item of rawList) {
        const checkedInDate = new Date(item.checkedInAt);
        if (filterDate) {
          const filterDateObj = new Date(filterDate);
          if (
            checkedInDate.getDate() !== filterDateObj.getDate() ||
            checkedInDate.getMonth() !== filterDateObj.getMonth() ||
            checkedInDate.getFullYear() !== filterDateObj.getFullYear()
          ) {
            continue;
          }
        }
        attendanceList.push({
          ...item,
          checkedInAt: checkedInDate,
        });
      }

      setAttendance(attendanceList);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const handleManualCheckIn = async () => {
    if (!selectedMemberId || !organisationId) {
      alert("Please select a member");
      return;
    }

    setCheckingIn(true);
    try {
      await addDoc(collection(db, "attendance"), {
        userId: selectedMemberId,
        organisationId,
        classId: selectedClassId || null,
        checkedInAt: new Date(),
        createdAt: new Date(),
      });

      alert("Check-in successful!");
      setShowManualCheckIn(false);
      setSelectedMemberId("");
      setSelectedClassId("");
      
      // Reload attendance
      await loadAttendance();
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in member");
    } finally {
      setCheckingIn(false);
    }
  };

  const filteredAttendance = attendance.filter((item) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.userEmail?.toLowerCase().includes(searchLower) ||
      item.username?.toLowerCase().includes(searchLower) ||
      item.className?.toLowerCase().includes(searchLower) ||
      item.attendanceId.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCheckIns = attendance.filter((item) => {
    const checkInDate = new Date(item.checkedInAt);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate.getTime() === today.getTime();
  }).length;

  const thisWeekCheckIns = attendance.filter((item) => {
    const checkInDate = new Date(item.checkedInAt);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return checkInDate >= weekAgo;
  }).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-sm text-gray-600">
            View check-in history and manage attendance
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to view attendance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-sm text-gray-600">
            View check-in history ({attendance.length} total check-ins)
          </p>
        </div>
        <button
          onClick={() => setShowManualCheckIn(true)}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
        >
          + Manual Check-in
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
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
                    {attendance.length}
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
                <div className="text-2xl">📅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {todayCheckIns}
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
                    {thisWeekCheckIns}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Member</label>
            <select
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
            >
              <option value="all">All Members</option>
              {members.map((member) => (
                <option key={member.uid} value={member.uid}>
                  {member.username || member.email}
                </option>
              ))}
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

      {/* Attendance Table */}
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
                Checked In At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm || filterClassId !== "all" || filterMemberId !== "all" || filterDate
                    ? "No check-ins found matching your filters"
                    : "No check-ins yet"}
                </td>
              </tr>
            ) : (
              filteredAttendance.map((item) => (
                <tr key={item.attendanceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-lifeset-primary-light flex items-center justify-center">
                        {item.profilePictureUrl ? (
                          <img
                            src={item.profilePictureUrl}
                            alt=""
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="text-lifeset-primary font-medium">
                            {item.username?.charAt(0).toUpperCase() || item.userEmail?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.username || "No username"}
                        </div>
                        <div className="text-sm text-gray-500">{item.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.className}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.checkedInAt.toLocaleDateString()} {item.checkedInAt.toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Check-in Modal */}
      {showManualCheckIn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Check-in</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member *</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md divide-y divide-gray-100">
                    {members.map((member) => (
                      <button
                        key={member.uid}
                        type="button"
                        onClick={() => setSelectedMemberId(selectedMemberId === member.uid ? "" : member.uid)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                          selectedMemberId === member.uid ? "bg-lifeset-primary-light" : ""
                        }`}
                      >
                        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-lifeset-primary-light flex items-center justify-center">
                          {member.profilePictureUrl ? (
                            <img
                              src={member.profilePictureUrl}
                              alt=""
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            <span className="text-sm text-lifeset-primary font-medium">
                              {member.username?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm truncate">{member.username || member.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class (Optional)</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  >
                    <option value="">No class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.classId} value={classItem.classId}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowManualCheckIn(false);
                    setSelectedMemberId("");
                    setSelectedClassId("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualCheckIn}
                  disabled={!selectedMemberId || checkingIn}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingIn ? "Checking in..." : "Check In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

