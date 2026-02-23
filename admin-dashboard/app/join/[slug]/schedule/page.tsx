"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { auth, functions } from "@/lib/firebase-client";
import { getCurrentUser, login, logout } from "@/lib/auth";
import { httpsCallable } from "firebase/functions";

const FUNCTIONS_BASE = "https://us-central1-lifeset-v2.cloudfunctions.net";

interface Organisation {
  organisationId: string;
  name: string;
  logoUrl: string;
  brandColours: { primary: string; secondary: string };
  type?: string;
}

interface ClassItem {
  classId: string;
  name: string;
  description?: string;
  instructor?: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  spotsLeft: number;
}

const GYM_TYPES = ["gym", "yoga", "pilates", "hiit", "sauna"];

export default function SchedulePage() {
  const params = useParams();
  const slugOrId = params.slug as string;

  const [org, setOrg] = useState<Organisation | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const [joinWaitlistClassId, setJoinWaitlistClassId] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;

    const load = async () => {
      try {
        const isOrgId = /^[a-zA-Z0-9]{20}$/.test(slugOrId);
        const query = isOrgId ? `organisationId=${slugOrId}` : `slug=${encodeURIComponent(slugOrId)}`;

        const orgRes = await fetch(`${FUNCTIONS_BASE}/getPublicOrganisation?${query}`);
        const orgData = await orgRes.json();

        if (orgData.error) {
          setError(orgData.error);
          return;
        }

        setOrg(orgData);

        if (orgData.organisationId) {
          const classesRes = await fetch(
            `${FUNCTIONS_BASE}/getPublicClasses?organisationId=${orgData.organisationId}`
          );
          const classesData = await classesRes.json();
          setClasses(Array.isArray(classesData) ? classesData : []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slugOrId]);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  const primary = org?.brandColours?.primary || "#6366F1";
  const isGymType = org?.type && GYM_TYPES.includes(org.type);
  const canBook = isGymType && user;

  const handleBookClick = (classId: string) => {
    if (!user) {
      setShowSignIn(true);
      setBookingClassId(classId);
      return;
    }
    doBook(classId);
  };

  const handleJoinWaitlistClick = (classId: string) => {
    if (!user) {
      setShowSignIn(true);
      setJoinWaitlistClassId(classId);
      return;
    }
    doJoinWaitlist(classId);
  };

  const doJoinWaitlist = async (classId: string) => {
    if (!org?.organisationId) return;
    setJoinWaitlistClassId(classId);
    try {
      const joinWaitlist = httpsCallable(functions, "joinWaitlist");
      await joinWaitlist({ classId, organisationId: org.organisationId });
      setJoinWaitlistClassId(null);
      alert("You've been added to the waitlist. We'll email you if a spot opens up!");
    } catch (err: any) {
      setJoinWaitlistClassId(null);
      alert(err.message || "Failed to join waitlist");
    }
  };

  const doBook = async (classId: string) => {
    if (!org?.organisationId) return;
    setBookingClassId(classId);
    try {
      const bookClass = httpsCallable(functions, "bookClass");
      await bookClass({ classId, organisationId: org.organisationId });
      setClasses((prev) =>
        prev.map((c) =>
          c.classId === classId
            ? { ...c, bookedCount: c.bookedCount + 1, spotsLeft: Math.max(0, c.spotsLeft - 1) }
            : c
        )
      );
      setBookingClassId(null);
      alert("Class booked successfully!");
    } catch (err: any) {
      setBookingClassId(null);
      alert(err.message || "Failed to book class");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSigningIn(true);
    try {
      await login(signInEmail, signInPassword);
      setShowSignIn(false);
      setSignInEmail("");
      setSignInPassword("");
      if (bookingClassId) {
        doBook(bookingClassId);
        setBookingClassId(null);
      } else if (joinWaitlistClassId) {
        doJoinWaitlist(joinWaitlistClassId);
        setJoinWaitlistClassId(null);
      }
    } catch (err: any) {
      setSignInError(err.message || "Sign in failed");
    } finally {
      setSigningIn(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lifeset-primary"></div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="mt-2 text-gray-600">{error || "This organisation could not be found."}</p>
          {slugOrId && (
            <Link href={`/join/${slugOrId}`} className="mt-4 inline-block text-lifeset-primary hover:underline">
              ← Back to sign up
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)` }}
      >
        <div className="max-w-4xl mx-auto">
          {org.logoUrl && (
            <img src={org.logoUrl} alt={org.name} className="h-14 mb-6 object-contain" />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Class Schedule</h1>
          <p className="mt-2 text-white/90">
            View and book classes at {org.name}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/join/${slugOrId}`}
              className="text-sm text-white/90 hover:text-white underline"
            >
              ← Back to sign up
            </Link>
            {user ? (
              <button
                onClick={() => logout()}
                className="text-sm text-white/90 hover:text-white"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="text-sm text-white/90 hover:text-white underline"
              >
                Sign in to book
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Schedule */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No upcoming classes scheduled.</p>
            <p className="mt-2 text-sm text-gray-500">Check back later or contact {org.name} for more info.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((c) => (
              <div
                key={c.classId}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">{c.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(c.date)} · {c.startTime} – {c.endTime}
                    </p>
                    {c.instructor && (
                      <p className="mt-1 text-sm text-gray-500">Instructor: {c.instructor}</p>
                    )}
                    {c.description && (
                      <p className="mt-2 text-sm text-gray-600">{c.description}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {c.spotsLeft} spots left ({c.bookedCount}/{c.capacity} booked)
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {canBook && c.spotsLeft > 0 ? (
                      <button
                        onClick={() => handleBookClick(c.classId)}
                        disabled={!!bookingClassId}
                        className="px-6 py-2.5 rounded-lg font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: primary }}
                      >
                        {bookingClassId === c.classId ? "Booking..." : "Book"}
                      </button>
                    ) : !user && c.spotsLeft > 0 ? (
                      <button
                        onClick={() => handleBookClick(c.classId)}
                        className="px-6 py-2.5 rounded-lg font-medium text-white"
                        style={{ backgroundColor: primary }}
                      >
                        Sign in to book
                      </button>
                    ) : c.spotsLeft === 0 ? (
                      <button
                        onClick={() => handleJoinWaitlistClick(c.classId)}
                        disabled={!!joinWaitlistClassId}
                        className="px-6 py-2.5 rounded-lg font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: primary }}
                      >
                        {joinWaitlistClassId === c.classId ? "Joining..." : "Join Waitlist"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Have a class pack or membership? Sign in above to book. New?{" "}
          <Link href={`/join/${slugOrId}`} className="text-lifeset-primary hover:underline">
            Purchase a pack
          </Link>{" "}
          or download the LifeSet app.
        </p>
      </main>

      {/* Sign-in modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign in to book</h2>
            <p className="text-sm text-gray-600 mb-4">
              Use the email and password you set up in the LifeSet app. New? Download the app and enter your invite code after purchasing.
            </p>
            <form onSubmit={handleSignIn}>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <label className="block text-sm font-medium text-gray-700 mt-3">Password</label>
              <input
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {signInError && (
                <p className="mt-2 text-sm text-red-600">{signInError}</p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignIn(false);
                    setBookingClassId(null);
                    setSignInError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signingIn}
                  className="flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: primary }}
                >
                  {signingIn ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
