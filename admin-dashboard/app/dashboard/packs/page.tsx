"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface Pack {
  packId: string;
  organisationId: string;
  name: string;
  description?: string;
  features?: string[];
  price: number;
  currency: string;
  classCount: number;
  validityDays: number;
  active: boolean;
  createdAt?: any;
}

interface PackPurchase {
  purchaseId: string;
  userId: string;
  packId: string;
  organisationId: string;
  classesRemaining: number;
  expiresAt: Date;
  purchasedAt: Date;
  status: "active" | "expired" | "used";
  // User info
  userEmail?: string;
  username?: string;
  // Pack info
  packName?: string;
}

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [purchases, setPurchases] = useState<PackPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [showPurchases, setShowPurchases] = useState(false);
  const [newPack, setNewPack] = useState({
    name: "",
    description: "",
    features: "",
    price: 0,
    currency: "USD",
    classCount: 10,
    validityDays: 90,
    active: true,
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
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
      await Promise.all([loadPacks(orgId), loadPurchases(orgId)]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPacks = async (orgId: string) => {
    try {
      const packsQuery = query(
        collection(db, "packs"),
        where("organisationId", "==", orgId),
        orderBy("createdAt", "desc")
      );
      const packsSnapshot = await getDocs(packsQuery);
      
      const packsList: Pack[] = [];
      packsSnapshot.forEach((doc) => {
        packsList.push({
          packId: doc.id,
          ...doc.data(),
        } as Pack);
      });

      setPacks(packsList);
    } catch (error) {
      console.error("Error loading packs:", error);
    }
  };

  const loadPurchases = async (orgId: string) => {
    try {
      // Note: Removed orderBy to avoid index requirement - we'll sort in memory
      const purchasesQuery = query(
        collection(db, "packPurchases"),
        where("organisationId", "==", orgId)
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);
      
      const purchasesList: PackPurchase[] = [];
      
      for (const purchaseDoc of purchasesSnapshot.docs) {
        const data = purchaseDoc.data();
        
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

        // Get pack info
        let packName = "Unknown Pack";
        if (data.packId) {
          try {
            const packDoc = await getDoc(doc(db, "packs", data.packId));
            if (packDoc.exists()) {
              packName = packDoc.data().name || "Unknown Pack";
            }
          } catch (error) {
            console.error("Error loading pack:", error);
          }
        }

        purchasesList.push({
          purchaseId: purchaseDoc.id,
          userId: data.userId || "",
          packId: data.packId || "",
          organisationId: data.organisationId || "",
          classesRemaining: data.classesRemaining || 0,
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
          purchasedAt: data.purchasedAt?.toDate ? data.purchasedAt.toDate() : new Date(data.purchasedAt),
          status: data.status || "active",
          userEmail,
          username,
          packName,
        });
      }

      // Sort by purchasedAt descending (newest first)
      purchasesList.sort((a, b) => {
        const aTime = a.purchasedAt?.getTime() || 0;
        const bTime = b.purchasedAt?.getTime() || 0;
        return bTime - aTime;
      });

      console.log("Loaded pack purchases:", purchasesList.length);
      setPurchases(purchasesList);
    } catch (error) {
      console.error("Error loading purchases:", error);
    }
  };

  const handleCreatePack = async () => {
    if (!newPack.name || !organisationId) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const features = newPack.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
      await addDoc(collection(db, "packs"), {
        organisationId,
        name: newPack.name,
        description: newPack.description || "",
        features,
        price: newPack.price,
        currency: newPack.currency,
        classCount: newPack.classCount,
        validityDays: newPack.validityDays,
        active: newPack.active,
        createdAt: new Date(),
      });

      // Reset form
      setNewPack({
        name: "",
        description: "",
        features: "",
        price: 0,
        currency: "USD",
        classCount: 10,
        validityDays: 90,
        active: true,
      });
      setShowCreateModal(false);
      
      // Reload packs
      await loadPacks(organisationId);
    } catch (error) {
      console.error("Error creating pack:", error);
      alert("Failed to create pack");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (packId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "packs", packId), {
        active: !currentActive,
      });
      await loadPacks(organisationId!);
    } catch (error) {
      console.error("Error toggling pack:", error);
      alert("Failed to update pack");
    }
  };

  const handleEditPack = (pack: Pack) => {
    setEditingPack(pack);
    setNewPack({
      name: pack.name,
      description: pack.description || "",
      features: (pack.features || []).join("\n"),
      price: pack.price,
      currency: pack.currency,
      classCount: pack.classCount,
      validityDays: pack.validityDays,
      active: pack.active,
    });
    setShowEditModal(true);
  };

  const handleUpdatePack = async () => {
    if (!editingPack || !newPack.name || !organisationId) {
      alert("Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const features = newPack.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
      await updateDoc(doc(db, "packs", editingPack.packId), {
        name: newPack.name,
        description: newPack.description || "",
        features,
        price: newPack.price,
        currency: newPack.currency,
        classCount: newPack.classCount,
        validityDays: newPack.validityDays,
        active: newPack.active,
      });

      // Reset form
      setNewPack({
        name: "",
        description: "",
        features: "",
        price: 0,
        currency: "USD",
        classCount: 10,
        validityDays: 90,
        active: true,
      });
      setShowEditModal(false);
      setEditingPack(null);
      
      // Reload packs
      await loadPacks(organisationId);
    } catch (error) {
      console.error("Error updating pack:", error);
      alert("Failed to update pack");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm("Are you sure you want to delete this pack? This will not affect existing purchases.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "packs", packId));
      await loadPacks(organisationId!);
    } catch (error) {
      console.error("Error deleting pack:", error);
      alert("Failed to delete pack");
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
          <h1 className="text-3xl font-bold text-gray-900">Packs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class packs
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage packs.
          </p>
        </div>
      </div>
    );
  }

  const activePacks = packs.filter((p) => p.active).length;
  const totalPurchases = purchases.length;
  const activePurchases = purchases.filter((p) => p.status === "active").length;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class packs ({packs.length} packs, {totalPurchases} purchases)
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPurchases(!showPurchases)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {showPurchases ? "Hide" : "Show"} Purchases ({totalPurchases})
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-lifeset-primary"
          >
            + Create Pack
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
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
                    {activePacks}
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
                    Total Purchases
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalPurchases}
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
                    Active Purchases
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {activePurchases}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pack Purchases View */}
      {showPurchases && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pack Purchases</h2>
          {purchases.length === 0 ? (
            <p className="text-gray-500">No pack purchases yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pack</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes Remaining</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.purchaseId}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{purchase.username || "No username"}</div>
                        <div className="text-sm text-gray-500">{purchase.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{purchase.packName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{purchase.classesRemaining}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            purchase.status === "active"
                              ? "bg-green-100 text-green-800"
                              : purchase.status === "expired"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {purchase.expiresAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Packs List */}
      {packs.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No packs created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
          >
            Create Your First Pack
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.packId}
              className={`bg-white shadow rounded-lg p-6 border-2 ${
                pack.active ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                  <p className="text-2xl font-bold text-lifeset-primary mt-2">
                    ${pack.price}
                    <span className="text-sm font-normal text-gray-500"> / {pack.classCount} classes</span>
                  </p>
                </div>
                <button
                  onClick={() => handleToggleActive(pack.packId, pack.active)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    pack.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pack.active ? "Active" : "Inactive"}
                </button>
              </div>

              {pack.description && (
                <p className="text-sm text-gray-600 mb-4">{pack.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>Classes: {pack.classCount}</div>
                <div>Validity: {pack.validityDays} days</div>
                <div>Currency: {pack.currency}</div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditPack(pack)}
                  className="text-lifeset-primary hover:text-lifeset-primary-dark text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePack(pack.packId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Pack Modal */}
      {showEditModal && editingPack && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Pack</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pack Name *</label>
                  <input
                    type="text"
                    value={newPack.name}
                    onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    placeholder="10-Class Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newPack.description}
                    onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={3}
                    placeholder="Perfect for casual gym-goers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bullet points for sign-up page (one per line)</label>
                  <textarea
                    value={newPack.features}
                    onChange={(e) => setNewPack({ ...newPack, features: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={4}
                    placeholder="Use any class&#10;No expiry pressure&#10;Great value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input
                      type="number"
                      value={newPack.price}
                      onChange={(e) => setNewPack({ ...newPack, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={newPack.currency}
                      onChange={(e) => setNewPack({ ...newPack, currency: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Count *</label>
                    <input
                      type="number"
                      value={newPack.classCount}
                      onChange={(e) => setNewPack({ ...newPack, classCount: parseInt(e.target.value) || 10 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Validity (days) *</label>
                    <input
                      type="number"
                      value={newPack.validityDays}
                      onChange={(e) => setNewPack({ ...newPack, validityDays: parseInt(e.target.value) || 90 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPack.active}
                      onChange={(e) => setNewPack({ ...newPack, active: e.target.checked })}
                      className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active (available for purchase)</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPack(null);
                    setNewPack({
                      name: "",
                      description: "",
                      features: "",
                      price: 0,
                      currency: "USD",
                      classCount: 10,
                      validityDays: 90,
                      active: true,
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePack}
                  disabled={updating || !newPack.name}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Updating..." : "Update Pack"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Pack Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Pack</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pack Name *</label>
                  <input
                    type="text"
                    value={newPack.name}
                    onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    placeholder="10-Class Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newPack.description}
                    onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={3}
                    placeholder="Perfect for casual gym-goers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bullet points for sign-up page (one per line)</label>
                  <textarea
                    value={newPack.features}
                    onChange={(e) => setNewPack({ ...newPack, features: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={4}
                    placeholder="Use any class&#10;No expiry pressure&#10;Great value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input
                      type="number"
                      value={newPack.price}
                      onChange={(e) => setNewPack({ ...newPack, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={newPack.currency}
                      onChange={(e) => setNewPack({ ...newPack, currency: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Count *</label>
                    <input
                      type="number"
                      value={newPack.classCount}
                      onChange={(e) => setNewPack({ ...newPack, classCount: parseInt(e.target.value) || 10 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Validity (days) *</label>
                    <input
                      type="number"
                      value={newPack.validityDays}
                      onChange={(e) => setNewPack({ ...newPack, validityDays: parseInt(e.target.value) || 90 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPack.active}
                      onChange={(e) => setNewPack({ ...newPack, active: e.target.checked })}
                      className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active (available for purchase)</span>
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
                  onClick={handleCreatePack}
                  disabled={creating || !newPack.name}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Pack"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

