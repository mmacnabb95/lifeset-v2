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

const HABIT_CATEGORIES = ["Fitness", "Health", "Mental Health", "Nutrition", "Productivity", "Other"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DEFAULT_SCHEDULE = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};

function HabitModalContent({
  formHabit,
  setFormHabit,
  toggleDay,
  saving,
  onCancel,
  onSave,
  title,
}: {
  formHabit: { name: string; description: string; category: string; streakTarget: number; schedule: Record<string, boolean> };
  setFormHabit: React.Dispatch<React.SetStateAction<typeof formHabit>>;
  toggleDay: (day: string) => void;
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
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={formHabit.name}
                onChange={(e) => setFormHabit((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Attend Reformer Class"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formHabit.description}
                onChange={(e) => setFormHabit((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formHabit.category}
                onChange={(e) => setFormHabit((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {HABIT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Streak target (days, 0 = none)</label>
              <input
                type="number"
                min={0}
                value={formHabit.streakTarget || 0}
                onChange={(e) => setFormHabit((prev) => ({ ...prev, streakTarget: parseInt(e.target.value, 10) || 0 }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (days to track)</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      formHabit.schedule[day]
                        ? "bg-lifeset-primary text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md">
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !formHabit.name}
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
  organisationId: string;
  name: string;
  description?: string;
  category?: string;
  streakTarget?: number;
  schedule: Record<string, boolean>;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<OrganisationHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<OrganisationHabit | null>(null);
  const [formHabit, setFormHabit] = useState({
    name: "",
    description: "",
    category: "Fitness",
    streakTarget: 0,
    schedule: { ...DEFAULT_SCHEDULE },
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
      await loadHabits(orgId);
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHabits = async (orgId: string) => {
    const q = query(
      collection(db, "organisationHabits"),
      where("organisationId", "==", orgId)
    );
    const snapshot = await getDocs(q);
    const list: OrganisationHabit[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        habitId: d.id,
        organisationId: data.organisationId,
        name: data.name,
        description: data.description,
        category: data.category,
        streakTarget: data.streakTarget,
        schedule: data.schedule || { ...DEFAULT_SCHEDULE },
      });
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    setHabits(list);
  };

  const handleCreate = async () => {
    if (!formHabit.name || !organisationId) {
      alert("Please enter habit name");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "organisationHabits"), {
        organisationId,
        name: formHabit.name.trim(),
        description: formHabit.description.trim() || "",
        category: formHabit.category,
        streakTarget: formHabit.streakTarget || 0,
        schedule: formHabit.schedule,
      });

      resetForm();
      setShowCreateModal(false);
      await loadHabits(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to create habit");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingHabit || !formHabit.name || !organisationId) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "organisationHabits", editingHabit.habitId), {
        name: formHabit.name.trim(),
        description: formHabit.description.trim() || "",
        category: formHabit.category,
        streakTarget: formHabit.streakTarget || 0,
        schedule: formHabit.schedule,
      });

      resetForm();
      setShowEditModal(false);
      setEditingHabit(null);
      await loadHabits(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to update habit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm("Delete this habit? Goals linking to it may be affected.")) return;
    if (!organisationId) return;
    try {
      await deleteDoc(doc(db, "organisationHabits", habitId));
      await loadHabits(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to delete habit");
    }
  };

  const resetForm = () => {
    setFormHabit({
      name: "",
      description: "",
      category: "Fitness",
      streakTarget: 0,
      schedule: { ...DEFAULT_SCHEDULE },
    });
  };

  const toggleDay = (day: string) => {
    setFormHabit((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: !prev.schedule[day] },
    }));
  };

  const handleCancelModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingHabit(null);
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
        <p className="text-gray-600">You need to belong to an organisation to manage habits.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
        >
          + Add Habit
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Create suggested habits for your members. They can add these when they set up their habit tracker.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {habits.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No habits yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {habits.map((habit) => (
              <li key={habit.habitId} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{habit.name}</p>
                  <p className="text-sm text-gray-500">
                    {habit.category || "—"} • {Object.values(habit.schedule).filter(Boolean).length} days/week
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingHabit(habit);
                      setFormHabit({
                        name: habit.name,
                        description: habit.description || "",
                        category: habit.category || "Fitness",
                        streakTarget: habit.streakTarget || 0,
                        schedule: habit.schedule || { ...DEFAULT_SCHEDULE },
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1 text-sm text-lifeset-primary hover:bg-lifeset-primary-light rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(habit.habitId)}
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
        <HabitModalContent
          formHabit={formHabit}
          setFormHabit={setFormHabit}
          toggleDay={toggleDay}
          saving={saving}
          onCancel={handleCancelModal}
          onSave={handleCreate}
          title="Add Habit"
        />
      )}
      {showEditModal && (
        <HabitModalContent
          formHabit={formHabit}
          setFormHabit={setFormHabit}
          toggleDay={toggleDay}
          saving={saving}
          onCancel={handleCancelModal}
          onSave={handleUpdate}
          title="Edit Habit"
        />
      )}
    </div>
  );
}
