"use client";

import { useEffect, useState, useRef } from "react";
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

const MAX_VIDEO_DURATION_SECONDS = 20;
const MAX_VIDEO_SIZE_MB = 100;
const EXERCISE_CATEGORIES = ["pilates", "yoga", "stretching", "strength", "cardio", "other"];

function ExerciseModalContent({
  newExercise,
  setNewExercise,
  videoFile,
  videoError,
  videoInputRef,
  handleVideoSelect,
  editingExercise,
  onCancel,
  onSave,
  title,
  saving,
  progress,
}: {
  newExercise: { name: string; description: string; category: string; durationSeconds: number };
  setNewExercise: React.Dispatch<React.SetStateAction<{ name: string; description: string; category: string; durationSeconds: number }>>;
  videoFile: File | null;
  videoError: string | null;
  videoInputRef: React.RefObject<HTMLInputElement>;
  handleVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editingExercise: { videoUrl?: string } | null;
  onCancel: () => void;
  onSave: () => void;
  title: string;
  saving: boolean;
  progress: string | null;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Hundred (Pilates)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newExercise.description}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the exercise"
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newExercise.category}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              >
                {EXERCISE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default duration (seconds)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={newExercise.durationSeconds}
                onChange={(e) =>
                  setNewExercise((prev) => ({ ...prev, durationSeconds: parseInt(e.target.value, 10) || 60 }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
              <p className="mt-1 text-xs text-gray-500">Used when exercise is time-based in a workout plan</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Video (landscape, max {MAX_VIDEO_DURATION_SECONDS}s, max {MAX_VIDEO_SIZE_MB}MB, 1080p or lower)</label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="mt-1 block w-full text-sm text-gray-900"
              />
              {videoFile && (
                <p className="mt-1 text-sm text-green-600">{videoFile.name} selected</p>
              )}
              {videoError && <p className="mt-1 text-sm text-red-600">{videoError}</p>}
              {editingExercise?.videoUrl && !videoFile && (
                <p className="mt-1 text-sm text-gray-500">Existing video will be kept. Upload a new file to replace.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !newExercise.name}
              className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
            >
              {saving ? progress || "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrganisationExercise {
  exerciseId: string;
  organisationId: string;
  name: string;
  description?: string;
  category: string;
  videoUrl?: string;
  durationSeconds?: number;
  createdAt?: any;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<OrganisationExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<OrganisationExercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    category: "pilates",
    durationSeconds: 60,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadError(null);
    try {
      const user = getCurrentUser();
      if (!user) {
        setLoadError("Not signed in");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setLoadError("User profile not found");
        return;
      }

      const userData = userDoc.data();
      const orgId = userData?.organisationId || userData?.activeOrganisationId;

      if (!orgId) {
        setLoadError("No organisation linked. Create an organisation in Settings first.");
        return;
      }

      setOrganisationId(orgId);
      await loadExercises(orgId);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setLoadError(error?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async (orgId: string) => {
    setLoadError(null);
    try {
      const exercisesQuery = query(
        collection(db, "organisationExercises"),
        where("organisationId", "==", orgId)
      );
      const snapshot = await getDocs(exercisesQuery);
      const list: OrganisationExercise[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          exerciseId: docSnap.id,
          ...docSnap.data(),
        } as OrganisationExercise);
      });
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setExercises(list);
    } catch (error: any) {
      console.error("Error loading exercises:", error);
      setLoadError(error?.message || "Failed to load exercises. Check browser console.");
    }
  };

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION_SECONDS) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      video.onerror = () => resolve(false);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoError(null);
    setVideoFile(null);

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setVideoError("Please select a video file (MP4, WebM, etc.)");
      return;
    }

    const maxBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setVideoError(`Video must be ${MAX_VIDEO_SIZE_MB}MB or less (yours is ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    const isValid = await validateVideoDuration(file);
    if (!isValid) {
      setVideoError(`Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or less`);
      return;
    }

    setVideoFile(file);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name || !organisationId) {
      alert("Please enter the exercise name");
      return;
    }

    setCreating(true);
    setUploadProgress(null);
    try {
      const exerciseRef = await addDoc(collection(db, "organisationExercises"), {
        organisationId,
        name: newExercise.name.trim(),
        description: newExercise.description?.trim() || "",
        category: newExercise.category,
        durationSeconds: newExercise.durationSeconds || 60,
        createdAt: new Date(),
      });

      let videoUrl: string | undefined;
      if (videoFile) {
        setUploadProgress("Uploading video...");
        const storageRef = ref(
          storage,
          `organisations/${organisationId}/exercises/${exerciseRef.id}.mp4`
        );
        await uploadBytes(storageRef, videoFile);
        videoUrl = await getDownloadURL(storageRef);
        await updateDoc(exerciseRef, { videoUrl });
      }

      setNewExercise({ name: "", description: "", category: "pilates", durationSeconds: 60 });
      setVideoFile(null);
      setVideoError(null);
      setShowCreateModal(false);
    } catch (error: any) {
      console.error("Error creating exercise:", error);
      alert(error.message || "Failed to create exercise");
      // Exercise may have been created in Firestore before upload failed - refresh list
    } finally {
      if (organisationId) await loadExercises(organisationId);
      setCreating(false);
      setUploadProgress(null);
    }
  };

  const handleEditExercise = (exercise: OrganisationExercise) => {
    setEditingExercise(exercise);
    setNewExercise({
      name: exercise.name,
      description: exercise.description || "",
      category: exercise.category || "pilates",
      durationSeconds: exercise.durationSeconds || 60,
    });
    setVideoFile(null);
    setVideoError(null);
    setShowEditModal(true);
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || !newExercise.name || !organisationId) return;

    setUpdating(true);
    setUploadProgress(null);
    try {
      const updates: Record<string, unknown> = {
        name: newExercise.name.trim(),
        description: newExercise.description?.trim() || "",
        category: newExercise.category,
        durationSeconds: newExercise.durationSeconds || 60,
      };

      if (videoFile) {
        setUploadProgress("Uploading video...");
        const storageRef = ref(
          storage,
          `organisations/${organisationId}/exercises/${editingExercise.exerciseId}.mp4`
        );
        await uploadBytes(storageRef, videoFile);
        updates.videoUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "organisationExercises", editingExercise.exerciseId), updates);

      setNewExercise({ name: "", description: "", category: "pilates", durationSeconds: 60 });
      setVideoFile(null);
      setVideoError(null);
      setShowEditModal(false);
      setEditingExercise(null);
    } catch (error: any) {
      console.error("Error updating exercise:", error);
      alert(error.message || "Failed to update exercise");
    } finally {
      if (organisationId) await loadExercises(organisationId);
      setUpdating(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm("Delete this exercise? Workout plans using it may show a missing exercise.")) return;
    if (!organisationId) return;

    try {
      const exercise = exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise?.videoUrl) {
        try {
          const storageRef = ref(storage, `organisations/${organisationId}/exercises/${exerciseId}.mp4`);
          await deleteObject(storageRef);
        } catch (err) {
          console.warn("Could not delete video file:", err);
        }
      }
      await deleteDoc(doc(db, "organisationExercises", exerciseId));
      await loadExercises(organisationId);
    } catch (error: any) {
      alert(error.message || "Failed to delete exercise");
    }
  };

  const handleCancelModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingExercise(null);
    setVideoFile(null);
    setVideoError(null);
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
        <p className="text-gray-600">
          {loadError || "You need to belong to an organisation to manage exercises."}
        </p>
        <button
          onClick={() => { setLoadError(null); loadData(); }}
          className="mt-4 px-4 py-2 text-lifeset-primary hover:bg-lifeset-primary-light rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600 font-medium">Error loading exercises</p>
        <p className="mt-2 text-gray-600">{loadError}</p>
        <p className="mt-2 text-sm text-gray-500">
          Check Firebase Console → Firestore → organisationExercises to verify exercises exist. Ensure your user has organisationId and role (admin/staff) in the users collection.
        </p>
        <button
          onClick={() => { setLoadError(null); loadData(); }}
          className="mt-4 px-4 py-2 text-lifeset-primary hover:bg-lifeset-primary-light rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
        <button
          onClick={() => {
            setNewExercise({ name: "", description: "", category: "pilates", durationSeconds: 60 });
            setVideoFile(null);
            setVideoError(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
        >
          + Add Exercise
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Add custom exercises (e.g. pilates, yoga) for your studio. Use these when creating recommended workout plans.
        Video requirements: landscape orientation, max {MAX_VIDEO_DURATION_SECONDS} seconds, max {MAX_VIDEO_SIZE_MB}MB. Use 1080p or lower (not 4K).
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {exercises.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No exercises yet.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => organisationId && loadExercises(organisationId)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
              >
                Add your first exercise
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {exercises.map((ex) => (
              <li key={ex.exerciseId} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {ex.videoUrl ? (
                    <video
                      src={ex.videoUrl}
                      className="w-16 h-16 object-cover rounded"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No video
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{ex.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{ex.category}</p>
                    {ex.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ex.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditExercise(ex)}
                    className="px-3 py-1 text-sm text-lifeset-primary hover:bg-lifeset-primary-light rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(ex.exerciseId)}
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
        <ExerciseModalContent
          newExercise={newExercise}
          setNewExercise={setNewExercise}
          videoFile={videoFile}
          videoError={videoError}
          videoInputRef={videoInputRef}
          handleVideoSelect={handleVideoSelect}
          editingExercise={null}
          onCancel={handleCancelModal}
          onSave={handleCreateExercise}
          title="Add Exercise"
          saving={creating}
          progress={uploadProgress}
        />
      )}
      {showEditModal && (
        <ExerciseModalContent
          newExercise={newExercise}
          setNewExercise={setNewExercise}
          videoFile={videoFile}
          videoError={videoError}
          videoInputRef={videoInputRef}
          handleVideoSelect={handleVideoSelect}
          editingExercise={editingExercise}
          onCancel={handleCancelModal}
          onSave={handleUpdateExercise}
          title="Edit Exercise"
          saving={updating}
          progress={uploadProgress}
        />
      )}
    </div>
  );
}
