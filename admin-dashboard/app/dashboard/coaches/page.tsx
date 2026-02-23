"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface Coach {
  uid: string;
  email: string;
  fullName?: string;
  username?: string;
  profilePictureUrl?: string;
  role: string;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ email: "", fullName: "", password: "" });
  const [addResult, setAddResult] = useState<{ success: boolean; message: string; password?: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const orgId =
        userData?.activeOrganisationId ||
        userData?.organisationId ||
        (userData?.organisations && userData.organisations[0]);

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
      setCurrentUserRole(userData?.role || "");

      // Load coaches: users with role "coach" in this org
      const coachesQuery = query(
        collection(db, "users"),
        where("organisationId", "==", orgId),
        where("role", "==", "coach")
      );
      const coachesArrayQuery = query(
        collection(db, "users"),
        where("organisations", "array-contains", orgId),
        where("role", "==", "coach")
      );

      const [coachesSnap, coachesArraySnap] = await Promise.all([
        getDocs(coachesQuery),
        getDocs(coachesArrayQuery),
      ]);

      const coachesMap = new Map<string, Coach>();
      coachesSnap.forEach((d) => {
        const data = d.data();
        coachesMap.set(d.id, {
          uid: d.id,
          email: data.email || "",
          fullName: data.fullName,
          username: data.username,
          profilePictureUrl: data.profilePictureUrl,
          role: data.role || "coach",
        });
      });
      coachesArraySnap.forEach((d) => {
        if (!coachesMap.has(d.id)) {
          const data = d.data();
          coachesMap.set(d.id, {
            uid: d.id,
            email: data.email || "",
            fullName: data.fullName,
            username: data.username,
            profilePictureUrl: data.profilePictureUrl,
            role: data.role || "coach",
          });
        }
      });

      setCoaches(
        Array.from(coachesMap.values()).sort((a, b) =>
          (a.fullName || a.email).localeCompare(b.fullName || b.email)
        )
      );
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = async () => {
    if (!organisationId || !formData.email.trim()) {
      alert("Please enter an email address");
      return;
    }

    setSaving(true);
    setAddResult(null);
    try {
      const createCoach = httpsCallable(functions, "createCoachAccount");
      const result = await createCoach({
        organisationId,
        email: formData.email.trim(),
        fullName: formData.fullName.trim() || undefined,
        password: formData.password.trim() || undefined,
      });

      const data = result.data as { success: boolean; message: string; password?: string };
      setAddResult({
        success: data.success,
        message: data.message,
        password: data.password ?? undefined,
      });

      if (data.success) {
        await loadData();
        setFormData({ email: "", fullName: "", password: "" });
        if (!data.password) {
          setShowAddModal(false);
        }
      }
    } catch (error: any) {
      setAddResult({
        success: false,
        message: error.message || "Failed to create coach account",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCoach = async (coachUid: string) => {
    if (!confirm("Remove this coach? They will lose access to the admin dashboard. Their role will be changed to member.")) {
      return;
    }
    if (!organisationId) return;
    try {
      await updateDoc(doc(db, "users", coachUid), {
        role: "member",
        updatedAt: new Date(),
      });
      await loadData();
    } catch (error: any) {
      alert(error.message || "Failed to remove coach");
    }
  };

  const canAddCoach = currentUserRole === "admin" || currentUserRole === "staff";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lifeset-primary"></div>
      </div>
    );
  }

  if (!organisationId) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">You need to belong to an organisation to view coaches.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentUserRole === "coach"
              ? "Your fellow coaches. Create workouts for members in Workout Plans."
              : `PTs and coaches who can create workouts for members (${coaches.length} total)`}
          </p>
        </div>
        {canAddCoach && (
          <button
            onClick={() => {
              setShowAddModal(true);
              setAddResult(null);
              setFormData({ email: "", fullName: "", password: "" });
            }}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
          >
            + Add Coach
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {coaches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No coaches yet.</p>
            {canAddCoach && (
              <button
                onClick={() => setShowAddModal(true)}
                className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
              >
                Add your first coach
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {coaches.map((coach) => (
              <li key={coach.uid} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-lifeset-primary-light flex items-center justify-center">
                    {coach.profilePictureUrl ? (
                      <img
                        src={coach.profilePictureUrl}
                        alt=""
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <span className="text-lifeset-primary font-medium">
                        {(coach.fullName || coach.username || coach.email)?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {coach.fullName || coach.username || "No name"}
                    </p>
                    <p className="text-sm text-gray-500">{coach.email}</p>
                  </div>
                </div>
                {canAddCoach && (
                  <button
                    onClick={() => handleRemoveCoach(coach.uid)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove as coach
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Coach Modal */}
      {showAddModal && canAddCoach && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Coach</h2>
              <p className="text-sm text-gray-600 mb-4">
                Create a coach account. They can log in to the admin dashboard to create workouts for members. No membership or app sign-up required.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="coach@yourgym.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Jane Smith"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
                  <p className="text-xs text-gray-500 mb-1">Leave blank to auto-generate. Share the password with the coach securely.</p>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {addResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      addResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p className={`text-sm font-medium ${addResult.success ? "text-green-800" : "text-red-800"}`}>
                      {addResult.message}
                    </p>
                    {addResult.password && (
                      <div className="mt-3">
                        <p className="text-xs text-green-700 font-medium">Temporary password (share securely):</p>
                        <code className="block mt-1 p-2 bg-white rounded border border-green-300 text-sm font-mono break-all">
                          {addResult.password}
                        </code>
                        <p className="text-xs text-green-600 mt-2">
                          Coach can log in at the admin dashboard URL with this email and password.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {addResult?.success && addResult?.password ? "Done" : "Cancel"}
                </button>
                {(!addResult?.success || !addResult?.password) && (
                  <button
                    onClick={handleAddCoach}
                    disabled={saving || !formData.email.trim()}
                    className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Add Coach"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
