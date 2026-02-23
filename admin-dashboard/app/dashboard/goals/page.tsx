"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

function GoalModalContent({
  formGoal,
  setFormGoal,
  habits,
  toggleHabit,
  saving,
  onCancel,
  onSave,
  title,
}: {
  formGoal: { title: string; description: string; targetCompletions: number; linkedOrganisationHabitIds: string[] };
  setFormGoal: React.Dispatch<React.SetStateAction<typeof formGoal>>;
  habits: { habitId: string; name: string }[];
  toggleHabit: (habitId: string) => void;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formGoal.title}
                onChange={(e) => setFormGoal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. 30-Day Pilates Challenge"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formGoal.description}
                onChange={(e) => setFormGoal((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target completions</label>
              <input
                type="number"
                min={1}
                value={formGoal.targetCompletions || 30}
                onChange={(e) =>
                  setFormGoal((prev) => ({ ...prev, targetCompletions: parseInt(e.target.value, 10) || 30 }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Total habit completions needed to reach this goal</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Linked habits</label>
              {habits.length === 0 ? (
                <p className="text-sm text-gray-500">
                  <a href="/dashboard/habits" className="text-lifeset-primary hover:underline">Add habits</a> first.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {habits.map((habit) => (
                    <label key={habit.habitId} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formGoal.linkedOrganisationHabitIds.includes(habit.habitId)}
                        onChange={() => toggleHabit(habit.habitId)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{habit.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md">
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !formGoal.title}
              className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrganisationHabit {
  habitId: string;
  name: string;
}

interface OrganisationGoal {
  goalId: string;
  organisationId: string;
  title: string;
  description?: string;
  targetCompletions?: number;
  linkedOrganisationHabitIds: string[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<OrganisationGoal[]>([]);
  const [habits, setHabits] = useState<OrganisationHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<OrganisationGoal | null>(null);
  const [formGoal, setFormGoal] = useState({
    title: "",
    description: "",
    targetCompletions: 30,
    linkedOrganisationHabitIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

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

      const orgId = userDoc.data()?.organisationId || userDoc.data()?.activeOrganisationId;
      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
      await Promise.all([loadGoals(orgId), loadHabits(orgId)]);
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async (orgId: string) => {
    const q = query(
      collection(db, "organisationGoals"),
      where("organisationId", "==", orgId)
    );
    const snapshot = await getDocs(q);
    const list: OrganisationGoal[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        goalId: d.id,
        organisationId: data.organisationId,
        title: data.title,
        description: data.description,
        targetCompletions: data.targetCompletions,
        linkedOrganisationHabitIds: data.linkedOrganisationHabitIds || [],
      });
    });
    list.sort((a, b) => a.title.localeCompare(b.title));
    setGoals(list);
  };

  const loadHabits = async (orgId: string) => {
    const q = query(
      collection(db, "organisationHabits"),
      where("organisationId", "==", orgId)
    );
    const snapshot = await getDocs(q);
    const list: OrganisationHabit[] = [];
    snapshot.forEach((d) => {
      list.push({ habitId: d.id, name: d.data().name });
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    setHabits(list);
  };

  const handleCreate = async () => {
    if (!formGoal.title || !organisationId) {
      alert("Please enter goal title");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "organisationGoals"), {
        organisationId,
        title: formGoal.title.trim(),
        description: formGoal.description.trim() || "",
        targetCompletions: formGoal.targetCompletions || 30,
        linkedOrganisationHabitIds: formGoal.linkedOrganisationHabitIds,
      });

      resetForm();
      setShowCreateModal(false);
      await loadGoals(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingGoal || !formGoal.title || !organisationId) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "organisationGoals", editingGoal.goalId), {
        title: formGoal.title.trim(),
        description: formGoal.description.trim() || "",
        targetCompletions: formGoal.targetCompletions || 30,
        linkedOrganisationHabitIds: formGoal.linkedOrganisationHabitIds,
      });

      resetForm();
      setShowEditModal(false);
      setEditingGoal(null);
      await loadGoals(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to update goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Delete this goal?")) return;
    if (!organisationId) return;
    try {
      await deleteDoc(doc(db, "organisationGoals", goalId));
      await loadGoals(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to delete goal");
    }
  };

  const resetForm = () => {
    setFormGoal({
      title: "",
      description: "",
      targetCompletions: 30,
      linkedOrganisationHabitIds: [],
    });
  };

  const toggleHabit = (habitId: string) => {
    const current = formGoal.linkedOrganisationHabitIds;
    const next = current.includes(habitId)
      ? current.filter((id) => id !== habitId)
      : [...current, habitId];
    setFormGoal({ ...formGoal, linkedOrganisationHabitIds: next });
  };

  const getHabitName = (habitId: string) => habits.find((h) => h.habitId === habitId)?.name || habitId;

  const handleCancelModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingGoal(null);
    resetForm();
  };

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
        <p className="text-gray-600">You need to belong to an organisation to manage goals.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
        >
          + Add Goal
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Create suggested goals for your members. Link habits that contribute to each goal.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {goals.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No goals yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {goals.map((goal) => (
              <li key={goal.goalId} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{goal.title}</p>
                  <p className="text-sm text-gray-500">
                    {goal.targetCompletions || 0} completions • {goal.linkedOrganisationHabitIds.length} habits
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormGoal({
                        title: goal.title,
                        description: goal.description || "",
                        targetCompletions: goal.targetCompletions || 30,
                        linkedOrganisationHabitIds: goal.linkedOrganisationHabitIds || [],
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1 text-sm text-lifeset-primary hover:bg-lifeset-primary-light rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.goalId)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCreateModal && (
        <GoalModalContent
          formGoal={formGoal}
          setFormGoal={setFormGoal}
          habits={habits}
          toggleHabit={toggleHabit}
          saving={saving}
          onCancel={handleCancelModal}
          onSave={handleCreate}
          title="Add Goal"
        />
      )}
      {showEditModal && (
        <GoalModalContent
          formGoal={formGoal}
          setFormGoal={setFormGoal}
          habits={habits}
          toggleHabit={toggleHabit}
          saving={saving}
          onCancel={handleCancelModal}
          onSave={handleUpdate}
          title="Edit Goal"
        />
      )}
    </div>
  );
}
