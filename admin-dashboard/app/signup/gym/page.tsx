"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/auth";
import { db } from "@/lib/firebase-client";
import { doc, setDoc } from "firebase/firestore";

const FUNCTIONS_BASE = "https://us-central1-lifeset-v2.cloudfunctions.net";

const GYM_TYPES = [
  { value: "gym", label: "Gym" },
  { value: "yoga", label: "Yoga Studio" },
  { value: "pilates", label: "Pilates Studio" },
  { value: "hiit", label: "HIIT Studio" },
  { value: "sauna", label: "Sauna" },
];

export default function GymSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymType, setGymType] = useState("gym");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password || !gymName) {
        throw new Error("Please fill in all required fields");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // 1. Create Firebase Auth user
      const user = await signup(email, password);

      // 2. Create user document in Firestore (required before createOrganisation)
      await setDoc(doc(db, "users", user.uid), {
        email,
        username: email.split("@")[0],
        role: null,
        xp: 0,
        level: 1,
        streak: 0,
        hasCompletedOnboarding: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. Call createOrganisation to create org and link user as admin
      const token = await user.getIdToken();
      const res = await fetch(`${FUNCTIONS_BASE}/createOrganisation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: gymName,
          type: gymType,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.message || data.error || "Failed to create organisation");
      }

      // 4. Redirect to dashboard (setup wizard will guide them)
      router.push("/dashboard/setup");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Create your gym account
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Set up your studio on LifeSet. You&apos;ll complete setup after signing up.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="gymName" className="block text-sm font-medium text-gray-700">
                Gym / Studio name *
              </label>
              <input
                id="gymName"
                type="text"
                required
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                placeholder="e.g. CrossFit Dublin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>

            <div>
              <label htmlFor="gymType" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="gymType"
                value={gymType}
                onChange={(e) => setGymType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              >
                {GYM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourgym.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lifeset-primary hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lifeset-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
