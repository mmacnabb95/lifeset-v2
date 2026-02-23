"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface MembershipTier {
  membershipId: string;
  organisationId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  active: boolean;
  recurring?: boolean; // true = subscription (renews), false = one-time payment
  createdAt?: any;
}

interface UserMembership {
  membershipId: string;
  userId: string;
  organisationId: string;
  membershipTierId?: string; // Reference to membership tier
  membershipTierName?: string; // Denormalized for display
  status: "active" | "expired" | "cancelled" | "past_due";
  startsAt: Date;
  expiresAt: Date;
  createdAt?: any;
  // User info
  userEmail?: string;
  username?: string;
}

export default function MembershipsPage() {
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tiers" | "members">("tiers");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<MembershipTier | null>(null);
  const [newMembership, setNewMembership] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    duration: 30,
    features: "",
    active: true,
    recurring: true, // Default to recurring subscription
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const orgId = userData?.organisationId;

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
      await Promise.all([loadMembershipTiers(orgId), loadUserMemberships(orgId)]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembershipTiers = async (orgId: string) => {
    try {
      // Get all memberships for this organisation
      // Tiers don't have userId, user memberships do
      const allMembershipsQuery = query(
        collection(db, "memberships"),
        where("organisationId", "==", orgId)
      );
      const allSnapshot = await getDocs(allMembershipsQuery);
      
      const tiersList: MembershipTier[] = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        // Tiers don't have userId field (user memberships do)
        if (!data.userId) {
          tiersList.push({
            membershipId: doc.id,
            ...data,
          } as MembershipTier);
        }
      });

      setMembershipTiers(tiersList);
    } catch (error) {
      console.error("Error loading membership tiers:", error);
    }
  };

  const loadUserMemberships = async (orgId: string) => {
    try {
      // Get user memberships (purchases) - these have userId
      // Note: Removed orderBy to avoid index requirement - we'll sort in memory
      const userMembershipsQuery = query(
        collection(db, "memberships"),
        where("organisationId", "==", orgId)
      );
      const userMembershipsSnapshot = await getDocs(userMembershipsQuery);
      
      const userMembershipsList: UserMembership[] = [];
      
      for (const membershipDoc of userMembershipsSnapshot.docs) {
        const data = membershipDoc.data();
        
        // Only process memberships that have a userId (actual purchases)
        if (!data.userId) continue;
        
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

        // Get membership tier info
        let tierName = "Unknown Tier";
        if (data.membershipTierId) {
          try {
            const tierDoc = await getDoc(doc(db, "memberships", data.membershipTierId));
            if (tierDoc.exists()) {
              tierName = tierDoc.data().name || "Unknown Tier";
            }
          } catch (error) {
            console.error("Error loading tier:", error);
          }
        } else if (data.name) {
          // Fallback to name field if tierId not set
          tierName = data.name;
        }

        userMembershipsList.push({
          membershipId: membershipDoc.id,
          userId: data.userId || "",
          organisationId: data.organisationId || "",
          membershipTierId: data.membershipTierId || "",
          membershipTierName: tierName,
          status: data.status || "active",
          startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : new Date(data.startsAt),
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          userEmail,
          username,
        });
      }

      // Sort by createdAt descending (newest first)
      userMembershipsList.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });

      setUserMemberships(userMembershipsList);
    } catch (error) {
      console.error("Error loading user memberships:", error);
    }
  };

  const handleCreateMembership = async () => {
    if (!newMembership.name || !organisationId) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const features = newMembership.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await addDoc(collection(db, "memberships"), {
        organisationId,
        name: newMembership.name,
        description: newMembership.description || "",
        price: newMembership.price,
        currency: newMembership.currency,
        duration: newMembership.duration,
        features,
        active: newMembership.active,
        recurring: newMembership.recurring !== false, // Default to true if not specified
        // Explicitly set userId to null to mark this as a tier (product), not a purchase
        userId: null,
        createdAt: new Date(),
      });

      // Reset form
      setNewMembership({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        duration: 30,
        features: "",
        active: true,
        recurring: true,
      });
      setShowCreateModal(false);
      
      // Reload data
      await loadMembershipTiers(organisationId);
    } catch (error) {
      console.error("Error creating membership:", error);
      alert("Failed to create membership");
    } finally {
      setCreating(false);
    }
  };

  const handleEditMembership = (membership: MembershipTier) => {
    setEditingMembership(membership);
    setNewMembership({
      name: membership.name,
      description: membership.description || "",
      price: membership.price,
      currency: membership.currency,
      duration: membership.duration,
      features: membership.features.join("\n"),
      active: membership.active,
      recurring: membership.recurring !== false, // Default to true if not specified
    });
    setShowEditModal(true);
  };

  const handleUpdateMembership = async () => {
    if (!editingMembership || !newMembership.name || !organisationId) {
      alert("Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const features = newMembership.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await updateDoc(doc(db, "memberships", editingMembership.membershipId), {
        name: newMembership.name,
        description: newMembership.description || "",
        price: newMembership.price,
        currency: newMembership.currency,
        duration: newMembership.duration,
        features,
        active: newMembership.active,
        recurring: newMembership.recurring !== false, // Default to true if not specified
      });

      // Reset form
      setNewMembership({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        duration: 30,
        features: "",
        active: true,
        recurring: true,
      });
      setShowEditModal(false);
      setEditingMembership(null);
      
      // Reload data
      await loadMembershipTiers(organisationId);
    } catch (error) {
      console.error("Error updating membership:", error);
      alert("Failed to update membership");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (membershipId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "memberships", membershipId), {
        active: !currentActive,
      });
      await loadMembershipTiers(organisationId!);
    } catch (error) {
      console.error("Error toggling membership:", error);
      alert("Failed to update membership");
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
          <h1 className="text-3xl font-bold text-gray-900">Memberships</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage membership tiers
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage memberships.
          </p>
        </div>
      </div>
    );
  }

  const activeMemberships = userMemberships.filter((m) => m.status === "active").length;
  const expiredMemberships = userMemberships.filter((m) => m.status === "expired").length;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memberships</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage membership tiers and active memberships
          </p>
        </div>
        {activeTab === "tiers" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
          >
            + Create Membership Tier
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("tiers")}
            className={`${
              activeTab === "tiers"
                ? "border-lifeset-primary text-lifeset-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Membership Tiers ({membershipTiers.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`${
              activeTab === "members"
                ? "border-lifeset-primary text-lifeset-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active Memberships ({userMemberships.length})
          </button>
        </nav>
      </div>

      {/* Stats */}
      {activeTab === "members" && (
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
                      Active Memberships
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {activeMemberships}
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
                      Expired Memberships
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {expiredMemberships}
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
                  <div className="text-2xl">👥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Memberships
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {userMemberships.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Tiers Tab */}
      {activeTab === "tiers" && (
        <>
          {membershipTiers.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-4">No membership tiers created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
              >
                Create Your First Membership Tier
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {membershipTiers.map((membership) => (
                <div
                  key={membership.membershipId}
                  className={`bg-white shadow rounded-lg p-6 border-2 ${
                    membership.active ? "border-green-200" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{membership.name}</h3>
                      <p className="text-2xl font-bold text-lifeset-primary mt-2">
                        ${membership.price}
                        <span className="text-sm font-normal text-gray-500">
                          /{membership.duration} days
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(membership.membershipId, membership.active)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        membership.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {membership.active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {membership.description && (
                    <p className="text-sm text-gray-600 mb-4">{membership.description}</p>
                  )}

                  {membership.features && membership.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {membership.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleEditMembership(membership)}
                      className="text-lifeset-primary hover:text-lifeset-primary-dark text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Active Memberships Tab */}
      {activeTab === "members" && (
        <>
          {userMemberships.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No active memberships yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Memberships will appear here once members purchase them
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Starts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userMemberships.map((membership) => (
                    <tr key={membership.membershipId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lifeset-primary-light flex items-center justify-center">
                            <span className="text-lifeset-primary font-medium">
                              {membership.username?.charAt(0).toUpperCase() || membership.userEmail?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {membership.username || "No username"}
                            </div>
                            <div className="text-sm text-gray-500">{membership.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {membership.membershipTierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            membership.status === "active"
                              ? "bg-green-100 text-green-800"
                              : membership.status === "expired"
                              ? "bg-red-100 text-red-800"
                              : membership.status === "past_due"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {membership.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {membership.startsAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {membership.expiresAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create Membership Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Membership Tier</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={newMembership.name}
                    onChange={(e) => setNewMembership({ ...newMembership, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    placeholder="Basic Membership"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newMembership.description}
                    onChange={(e) => setNewMembership({ ...newMembership, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input
                      type="number"
                      value={newMembership.price}
                      onChange={(e) => setNewMembership({ ...newMembership, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={newMembership.currency}
                      onChange={(e) => setNewMembership({ ...newMembership, currency: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (days) *</label>
                  <input
                    type="number"
                    value={newMembership.duration}
                    onChange={(e) => setNewMembership({ ...newMembership, duration: parseInt(e.target.value) || 30 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features (one per line)</label>
                  <textarea
                    value={newMembership.features}
                    onChange={(e) => setNewMembership({ ...newMembership, features: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={4}
                    placeholder="Access to all classes&#10;Free parking&#10;Locker access"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMembership.active}
                      onChange={(e) => setNewMembership({ ...newMembership, active: e.target.checked })}
                      className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active (available for purchase)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMembership.recurring}
                      onChange={(e) => setNewMembership({ ...newMembership, recurring: e.target.checked })}
                      className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Recurring Subscription (auto-renews)
                      <span className="text-xs text-gray-500 block mt-1">
                        {newMembership.recurring 
                          ? "Customer will be charged automatically each billing period" 
                          : "One-time payment - customer pays once and membership expires after duration"}
                      </span>
                      <span className="text-xs text-blue-600 block mt-1">
                        Only applies to Sell Membership (Stripe). Cash/Assign memberships always require manual renewal.
                      </span>
                    </span>
                  </label>
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
                  onClick={handleCreateMembership}
                  disabled={creating || !newMembership.name}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Membership Tier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
