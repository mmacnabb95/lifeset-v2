"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

interface Class {
  classId: string;
  organisationId: string;
  name: string;
  description?: string;
  instructor?: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  createdAt?: any;
}

export default function SchedulePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    instructor: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: 20,
  });
  const [recurringWeeks, setRecurringWeeks] = useState(8);
  const [recurringDays, setRecurringDays] = useState<number[]>([1]); // 0=Sun, 1=Mon, ...
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
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
      const orgId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);

      // Get all classes for this organisation
      const classesQuery = query(
        collection(db, "classes"),
        where("organisationId", "==", orgId)
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classesList: Class[] = [];
      
      for (const classDoc of classesSnapshot.docs) {
        const data = classDoc.data();
        
        // Get booking count for this class
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("classId", "==", classDoc.id),
          where("status", "==", "confirmed")
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookedCount = bookingsSnapshot.size;
        
        classesList.push({
          classId: classDoc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          bookedCount,
        } as Class);
      }

      // Sort by date
      classesList.sort((a, b) => a.date.getTime() - b.date.getTime());

      setClasses(classesList);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Generate dates for recurring classes: each selected weekday for N weeks from start date */
  const getRecurringDates = (): Date[] => {
    if (!newClass.date) return [];
    const start = new Date(newClass.date);
    start.setHours(0, 0, 0, 0);
    const dates: Date[] = [];
    for (let w = 0; w < recurringWeeks; w++) {
      for (const dayOfWeek of recurringDays) {
        const daysFromStart = (dayOfWeek - start.getDay() + 7) % 7;
        const classDate = new Date(start);
        classDate.setDate(start.getDate() + daysFromStart + w * 7);
        if (classDate >= start) dates.push(classDate);
      }
    }
    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.date || !newClass.startTime || !newClass.endTime || !organisationId) {
      alert("Please fill in all required fields");
      return;
    }
    if (isRecurring && recurringDays.length === 0) {
      alert("Select at least one day for recurring classes");
      return;
    }

    setCreating(true);
    try {
      const dates = isRecurring ? getRecurringDates() : [new Date(`${newClass.date}T${newClass.startTime}`)];

      for (const classDate of dates) {
        await addDoc(collection(db, "classes"), {
          organisationId,
          name: newClass.name,
          description: newClass.description || "",
          instructor: newClass.instructor || "",
          date: classDate,
          startTime: newClass.startTime,
          endTime: newClass.endTime,
          capacity: newClass.capacity,
          bookedCount: 0,
          createdAt: new Date(),
        });
      }

      // Reset form
      setNewClass({
        name: "",
        description: "",
        instructor: "",
        date: "",
        startTime: "",
        endTime: "",
        capacity: 20,
      });
      setIsRecurring(false);
      setRecurringWeeks(8);
      setRecurringDays([1]);
      setShowCreateModal(false);

      await loadSchedule();
      if (dates.length > 1) alert(`Created ${dates.length} classes successfully.`);
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "classes", classId));
      await loadSchedule();
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class");
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
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class schedules and bookings
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage schedules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class schedules ({classes.length} classes)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          + Create Class
        </button>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No classes scheduled yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
          >
            Create Your First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div key={classItem.classId} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                  {classItem.instructor && (
                    <p className="text-sm text-gray-500">Instructor: {classItem.instructor}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteClass(classItem.classId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              
              {classItem.description && (
                <p className="text-sm text-gray-600 mb-4">{classItem.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Date:</span>
                  {classItem.date.toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Time:</span>
                  {classItem.startTime} - {classItem.endTime}
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Capacity:</span>
                  {classItem.bookedCount || 0} / {classItem.capacity}
                </div>
                <div className="mt-2">
                  <Link
                    href={`/dashboard/bookings?classId=${classItem.classId}`}
                    className="text-xs text-lifeset-primary hover:text-lifeset-primary-dark"
                  >
                    View Bookings →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Class</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Create recurring weekly</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class Name *</label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    placeholder="Morning Yoga"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instructor</label>
                  <input
                    type="text"
                    value={newClass.instructor}
                    onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    placeholder="Optional instructor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{isRecurring ? "Start date *" : "Date *"}</label>
                  <input
                    type="date"
                    value={newClass.date}
                    onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                </div>
                {isRecurring && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on</label>
                      <div className="flex flex-wrap gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setRecurringDays((prev) =>
                                prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort((a, b) => a - b)
                              )
                            }
                            className={`px-3 py-1 rounded text-sm ${
                              recurringDays.includes(i)
                                ? "bg-lifeset-primary text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">For (weeks)</label>
                      <input
                        type="number"
                        value={recurringWeeks}
                        onChange={(e) => setRecurringWeeks(Math.max(1, parseInt(e.target.value) || 8))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                        min="1"
                        max="52"
                      />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                    <input
                      type="time"
                      value={newClass.startTime}
                      onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time *</label>
                    <input
                      type="time"
                      value={newClass.endTime}
                      onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) || 20 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    min="1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={
                    creating ||
                    !newClass.name ||
                    !newClass.date ||
                    !newClass.startTime ||
                    !newClass.endTime ||
                    (isRecurring && recurringDays.length === 0)
                  }
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating
                    ? isRecurring
                      ? `Creating ${getRecurringDates().length} classes...`
                      : "Creating..."
                    : isRecurring
                      ? `Create ${getRecurringDates().length} Classes`
                      : "Create Class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
