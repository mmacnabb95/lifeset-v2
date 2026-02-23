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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["strength", "cardio", "flexibility", "sports", "custom"];

function PlanModalContent({
  formPlan,
  setFormPlan,
  globalExercises,
  orgExercises,
  members,
  addExerciseToPlan,
  getExerciseName,
  updatePlanExercise,
  removeExerciseFromPlan,
  saving,
  onCancel,
  onSave,
  title,
}: {
  formPlan: {
    name: string;
    description: string;
    difficulty: string;
    durationWeeks: number;
    daysPerWeek: number;
    category: string;
    exercises: PlanExercise[];
    tags: string;
    assignedToUserId: string;
  };
  setFormPlan: React.Dispatch<React.SetStateAction<typeof formPlan>>;
  globalExercises: GlobalExercise[];
  orgExercises: OrganisationExercise[];
  members: { uid: string; fullName?: string; username?: string; email: string }[];
  addExerciseToPlan: (value: string, dayIndex: number) => void;
  getExerciseName: (pe: PlanExercise) => string;
  updatePlanExercise: (index: number, updates: Partial<PlanExercise>) => void;
  removeExerciseFromPlan: (index: number) => void;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={formPlan.name}
                onChange={(e) => setFormPlan((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. 8-Week Reformer Pilates"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formPlan.description}
                onChange={(e) => setFormPlan((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  value={formPlan.difficulty}
                  onChange={(e) => setFormPlan((prev) => ({ ...prev, difficulty: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formPlan.category}
                  onChange={(e) => setFormPlan((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={formPlan.durationWeeks}
                  onChange={(e) => setFormPlan((prev) => ({ ...prev, durationWeeks: parseInt(e.target.value, 10) || 8 }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Days per week</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={formPlan.daysPerWeek}
                  onChange={(e) => setFormPlan((prev) => ({ ...prev, daysPerWeek: parseInt(e.target.value, 10) || 3 }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                type="text"
                value={formPlan.tags}
                onChange={(e) => setFormPlan((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="pilates, reformer, beginner"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to member (optional)</label>
              <p className="text-xs text-gray-500 mb-1">Leave empty for org-wide plan. Select a member to assign this workout to them.</p>
              <select
                value={formPlan.assignedToUserId || ""}
                onChange={(e) => setFormPlan((prev) => ({ ...prev, assignedToUserId: e.target.value || "" }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">— All members (org-wide) —</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.fullName || m.username || m.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exercises</label>
              <p className="text-xs text-gray-500 mb-2">
                Add from the LifeSet library or your <a href="/dashboard/exercises" className="text-lifeset-primary hover:underline">studio exercises</a>. Organise by workout day.
              </p>
              <div className="flex gap-2 mb-3">
                <select
                  id="add-exercise-day"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({ length: Math.max(1, formPlan.daysPerWeek) }, (_, i) => (
                    <option key={i} value={i}>Day {i + 1}</option>
                  ))}
                </select>
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) {
                      const daySelect = document.getElementById("add-exercise-day") as HTMLSelectElement;
                      const dayIndex = daySelect ? parseInt(daySelect.value, 10) : 0;
                      addExerciseToPlan(v, dayIndex);
                    }
                    e.target.value = "";
                  }}
                  className="flex-[2] px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">+ Add exercise...</option>
                  {orgExercises.length > 0 && (
                    <optgroup label="🏢 Your studio exercises">
                      {orgExercises.map((ex) => (
                        <option key={`o-${ex.exerciseId}`} value={`org_${ex.exerciseId}`}>{ex.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {globalExercises.length > 0 && (
                    <optgroup label="📚 LifeSet library">
                      {globalExercises.map((ex) => (
                        <option key={`g-${ex.id}`} value={`global_${ex.id}`}>{ex.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {globalExercises.length === 0 && orgExercises.length === 0 && (
                    <option value="" disabled>No exercises available</option>
                  )}
                </select>
              </div>
              {Array.from({ length: (() => {
                const maxDayFromExercises = formPlan.exercises.length
                  ? Math.max(...formPlan.exercises.map((pe) => (pe.dayIndex ?? 0) + 1))
                  : 0;
                return Math.max(1, formPlan.daysPerWeek, maxDayFromExercises);
              })() }, (_, dayIdx) => {
                const dayExercises = formPlan.exercises
                  .filter((pe) => (pe.dayIndex ?? 0) === dayIdx)
                  .sort((a, b) => a.order - b.order);
                return (
                  <div key={dayIdx} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-lifeset-primary/20 text-lifeset-primary text-xs">
                        {dayIdx + 1}
                      </span>
                      Day {dayIdx + 1}
                    </h3>
                    {dayExercises.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2 pl-8">No exercises yet</p>
                    ) : (
                      <ul className="space-y-2 pl-2 border-l-2 border-gray-200">
                        {dayExercises.map((pe, idx) => {
                          const globalIdx = formPlan.exercises.indexOf(pe);
                          return (
                            <li key={globalIdx} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-2 bg-gray-50 rounded">
                              <span className="flex-1 min-w-[140px] font-medium text-gray-900">{getExerciseName(pe)}</span>
                              <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-500 whitespace-nowrap">Sets</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={pe.sets ?? ""}
                                  onChange={(e) => updatePlanExercise(globalIdx, { sets: parseInt(e.target.value, 10) || undefined })}
                                  className="w-14 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-500 whitespace-nowrap">Reps</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={pe.reps ?? ""}
                                  onChange={(e) => updatePlanExercise(globalIdx, { reps: parseInt(e.target.value, 10) || undefined })}
                                  className="w-14 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-500 whitespace-nowrap">Duration (sec)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={pe.durationSeconds ?? ""}
                                  onChange={(e) => updatePlanExercise(globalIdx, { durationSeconds: parseInt(e.target.value, 10) || undefined })}
                                  className="w-14 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-500 whitespace-nowrap">Rest (sec)</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={pe.restSeconds ?? ""}
                                  onChange={(e) => updatePlanExercise(globalIdx, { restSeconds: parseInt(e.target.value, 10) || 60 })}
                                  className="w-14 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExerciseFromPlan(globalIdx)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !formPlan.name}
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

interface GlobalExercise {
  id: number;
  name: string;
  category: string;
  description?: string;
  videoUrl?: string;
  duration?: number | null;
}

interface OrganisationExercise {
  exerciseId: string;
  name: string;
  description?: string;
  category: string;
  videoUrl?: string;
  durationSeconds?: number;
}

interface PlanExercise {
  exerciseId?: number | null;
  organisationExerciseId?: string;
  dayIndex?: number;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  order: number;
  note?: string;
}

interface OrgWorkoutPlan {
  planId: string;
  organisationId: string;
  name: string;
  description: string;
  difficulty: string;
  durationWeeks: number;
  daysPerWeek: number;
  category: string;
  exercises: PlanExercise[];
  tags: string[];
  assignedToUserId?: string;
  assignedBy?: string;
}

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<OrgWorkoutPlan[]>([]);
  const [globalExercises, setGlobalExercises] = useState<GlobalExercise[]>([]);
  const [orgExercises, setOrgExercises] = useState<OrganisationExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<OrgWorkoutPlan | null>(null);
  const [members, setMembers] = useState<{ uid: string; fullName?: string; username?: string; email: string }[]>([]);
  const [formPlan, setFormPlan] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    durationWeeks: 8,
    daysPerWeek: 3,
    category: "flexibility",
    exercises: [] as PlanExercise[],
    tags: "",
    assignedToUserId: "",
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

      const userData = userDoc.data();
      const orgId = userData?.activeOrganisationId || userData?.organisationId || (userData?.organisations && userData.organisations[0]);
      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
      await Promise.all([loadPlans(orgId), loadOrgExercises(orgId), loadGlobalExercises(), loadMembers(orgId)]);
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async (orgId: string) => {
    const q = query(
      collection(db, "workoutPlans"),
      where("organisationId", "==", orgId)
    );
    const snapshot = await getDocs(q);
    const list: OrgWorkoutPlan[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        planId: d.id,
        organisationId: data.organisationId,
        name: data.name,
        description: data.description || "",
        difficulty: data.difficulty || "beginner",
        durationWeeks: data.durationWeeks || 8,
        daysPerWeek: data.daysPerWeek || 3,
        category: data.category || "flexibility",
        exercises: data.exercises || [],
        tags: data.tags || [],
        assignedToUserId: data.assignedToUserId,
        assignedBy: data.assignedBy,
      });
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    setPlans(list);
  };

  const loadGlobalExercises = async () => {
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      const list = (Array.isArray(data) ? data : []).map((e: any) => ({
        id: e.id,
        name: e.name,
        category: e.category || "other",
        description: e.description,
        videoUrl: e.videoUrl,
        duration: e.duration,
      }));
      list.sort((a: GlobalExercise, b: GlobalExercise) => a.name.localeCompare(b.name));
      setGlobalExercises(list);
    } catch (err) {
      console.error("Error loading global exercises:", err);
      setGlobalExercises([]);
    }
  };

  const loadMembers = async (orgId: string) => {
    try {
      const membersQuery = query(
        collection(db, "users"),
        where("organisationId", "==", orgId)
      );
      const membersArrayQuery = query(
        collection(db, "users"),
        where("organisations", "array-contains", orgId)
      );
      const [membersSnap, membersArraySnap] = await Promise.all([getDocs(membersQuery), getDocs(membersArrayQuery)]);
      const membersMap = new Map<string, { uid: string; fullName?: string; username?: string; email: string }>();
      membersSnap.forEach((d) => {
        const data = d.data();
        if ((data as any).status !== "pending") {
          membersMap.set(d.id, {
            uid: d.id,
            fullName: data.fullName,
            username: data.username,
            email: data.email || "",
          });
        }
      });
      membersArraySnap.forEach((d) => {
        if (!membersMap.has(d.id)) {
          const data = d.data();
          if ((data as any).status !== "pending") {
            membersMap.set(d.id, {
              uid: d.id,
              fullName: data.fullName,
              username: data.username,
              email: data.email || "",
            });
          }
        }
      });
      setMembers(Array.from(membersMap.values()).sort((a, b) => (a.fullName || a.username || a.email).localeCompare(b.fullName || b.username || b.email)));
    } catch (err) {
      console.error("Error loading members:", err);
      setMembers([]);
    }
  };

  const loadOrgExercises = async (orgId: string) => {
    try {
      const q = query(
        collection(db, "organisationExercises"),
        where("organisationId", "==", orgId)
      );
      const snapshot = await getDocs(q);
      const list: OrganisationExercise[] = [];
      snapshot.forEach((d) => {
        list.push({ exerciseId: d.id, ...d.data() } as OrganisationExercise);
      });
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setOrgExercises(list);
    } catch (err) {
      console.error("Error loading org exercises:", err);
      setOrgExercises([]);
    }
  };

  const sanitizeExercises = (exercises: PlanExercise[]) =>
    exercises.map((ex) => {
      const clean: Record<string, unknown> = {};
      if (ex.exerciseId != null) clean.exerciseId = ex.exerciseId;
      if (ex.organisationExerciseId != null) clean.organisationExerciseId = ex.organisationExerciseId;
      if (ex.dayIndex != null) clean.dayIndex = ex.dayIndex;
      if (ex.sets != null) clean.sets = ex.sets;
      if (ex.reps != null) clean.reps = ex.reps;
      if (ex.durationSeconds != null) clean.durationSeconds = ex.durationSeconds;
      clean.restSeconds = ex.restSeconds ?? 60;
      clean.order = ex.order ?? 0;
      if (ex.note != null) clean.note = ex.note;
      return clean;
    });

  const handleCreatePlan = async () => {
    if (!formPlan.name || !organisationId) {
      alert("Please enter plan name");
      return;
    }

    setSaving(true);
    try {
      const currentUser = getCurrentUser();
      await addDoc(collection(db, "workoutPlans"), {
        organisationId,
        name: formPlan.name.trim(),
        description: formPlan.description.trim() || "",
        difficulty: formPlan.difficulty,
        durationWeeks: formPlan.durationWeeks,
        daysPerWeek: formPlan.daysPerWeek,
        category: formPlan.category,
        isTemplate: false,
        createdBy: "organisation",
        exercises: sanitizeExercises(formPlan.exercises),
        tags: formPlan.tags.split(",").map((t) => t.trim()).filter(Boolean),
        assignedToUserId: formPlan.assignedToUserId?.trim() || null,
        assignedBy: formPlan.assignedToUserId?.trim() && currentUser ? currentUser.uid : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      resetForm();
      setShowCreateModal(false);
      await loadPlans(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to create plan");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !formPlan.name || !organisationId) return;

    setSaving(true);
    try {
      const currentUser = getCurrentUser();
      await updateDoc(doc(db, "workoutPlans", editingPlan.planId), {
        name: formPlan.name.trim(),
        description: formPlan.description.trim() || "",
        difficulty: formPlan.difficulty,
        durationWeeks: formPlan.durationWeeks,
        daysPerWeek: formPlan.daysPerWeek,
        category: formPlan.category,
        exercises: sanitizeExercises(formPlan.exercises),
        tags: formPlan.tags.split(",").map((t) => t.trim()).filter(Boolean),
        assignedToUserId: formPlan.assignedToUserId?.trim() || null,
        assignedBy: formPlan.assignedToUserId?.trim() && currentUser ? currentUser.uid : null,
        updatedAt: Timestamp.now(),
      });

      resetForm();
      setShowEditModal(false);
      setEditingPlan(null);
      await loadPlans(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Delete this workout plan?")) return;
    if (!organisationId) return;
    try {
      await deleteDoc(doc(db, "workoutPlans", planId));
      await loadPlans(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to delete plan");
    }
  };

  const resetForm = () => {
    setFormPlan({
      name: "",
      description: "",
      difficulty: "beginner",
      durationWeeks: 8,
      daysPerWeek: 3,
      category: "flexibility",
      exercises: [],
      tags: "",
      assignedToUserId: "",
    });
  };

  const addExerciseToPlan = (value: string, dayIndex: number) => {
    if (!value) return;
    const order = formPlan.exercises.length + 1;
    if (value.startsWith("global_")) {
      const id = parseInt(value.replace("global_", ""), 10);
      const ex = globalExercises.find((e) => e.id === id);
      if (!ex) return;
      const newEx: PlanExercise = {
        exerciseId: id,
        dayIndex,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        order,
        note: ex.name,
        durationSeconds: ex.duration ?? 60,
      };
      setFormPlan({ ...formPlan, exercises: [...formPlan.exercises, newEx] });
    } else if (value.startsWith("org_")) {
      const orgExId = value.replace("org_", "");
      const ex = orgExercises.find((e) => e.exerciseId === orgExId);
      if (!ex) return;
      const newEx: PlanExercise = {
        organisationExerciseId: orgExId,
        dayIndex,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        order,
        note: ex.name,
        durationSeconds: ex.durationSeconds || 60,
      };
      setFormPlan({ ...formPlan, exercises: [...formPlan.exercises, newEx] });
    }
  };

  const removeExerciseFromPlan = (index: number) => {
    const next = formPlan.exercises.filter((_, i) => i !== index);
    next.forEach((e, i) => {
      e.order = i + 1;
    });
    setFormPlan({ ...formPlan, exercises: next });
  };

  const updatePlanExercise = (index: number, updates: Partial<PlanExercise>) => {
    const next = [...formPlan.exercises];
    next[index] = { ...next[index], ...updates };
    setFormPlan({ ...formPlan, exercises: next });
  };

  const getExerciseName = (pe: PlanExercise) => {
    if (pe.exerciseId != null) {
      return globalExercises.find((e) => e.id === pe.exerciseId)?.name || `Exercise #${pe.exerciseId}`;
    }
    if (pe.organisationExerciseId) {
      return orgExercises.find((e) => e.exerciseId === pe.organisationExerciseId)?.name || "Unknown";
    }
    return "Unknown";
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingPlan(null);
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
        <p className="text-gray-600">You need to belong to an organisation to manage workout plans.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workout Plans</h1>
        <div className="flex gap-2">
          <button
            onClick={() => organisationId && loadData()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
          >
            + Add Plan
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Create recommended workout plans for your members. Use your custom exercises from the Exercises page. If you don&apos;t see your studio exercises in the dropdown, click Refresh.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {plans.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No workout plans yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
            >
              Create your first plan
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <li key={plan.planId} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">
                    {plan.durationWeeks} weeks · {plan.daysPerWeek}x/week · {plan.exercises.length} exercises
                    {plan.assignedToUserId && (
                      <span className="ml-2 text-lifeset-primary font-medium">
                        · Assigned to {members.find((m) => m.uid === plan.assignedToUserId)?.fullName || members.find((m) => m.uid === plan.assignedToUserId)?.username || "member"}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setFormPlan({
                        name: plan.name,
                        description: plan.description,
                        difficulty: plan.difficulty,
                        durationWeeks: plan.durationWeeks,
                        daysPerWeek: plan.daysPerWeek,
                        category: plan.category,
                        exercises: plan.exercises,
                        tags: plan.tags.join(", "),
                        assignedToUserId: plan.assignedToUserId || "",
                      });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1 text-sm text-lifeset-primary hover:bg-lifeset-primary-light rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.planId)}
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
        <PlanModalContent
          formPlan={formPlan}
          setFormPlan={setFormPlan}
          globalExercises={globalExercises}
          orgExercises={orgExercises}
          members={members}
          addExerciseToPlan={addExerciseToPlan}
          getExerciseName={getExerciseName}
          updatePlanExercise={updatePlanExercise}
          removeExerciseFromPlan={removeExerciseFromPlan}
          saving={saving}
          onCancel={handleCancel}
          onSave={handleCreatePlan}
          title="Add Workout Plan"
        />
      )}
      {showEditModal && (
        <PlanModalContent
          formPlan={formPlan}
          setFormPlan={setFormPlan}
          globalExercises={globalExercises}
          orgExercises={orgExercises}
          members={members}
          addExerciseToPlan={addExerciseToPlan}
          getExerciseName={getExerciseName}
          updatePlanExercise={updatePlanExercise}
          removeExerciseFromPlan={removeExerciseFromPlan}
          saving={saving}
          onCancel={handleCancel}
          onSave={handleUpdatePlan}
          title="Edit Workout Plan"
        />
      )}
    </div>
  );
}
