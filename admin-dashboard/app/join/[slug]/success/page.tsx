"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, functions } from "@/lib/firebase-client";
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword } from "firebase/auth";

const FUNCTIONS_BASE = "https://us-central1-lifeset-v2.cloudfunctions.net";

export default function JoinSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugOrId = params.slug as string;

  const [orgName, setOrgName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");
  const purchaseId = searchParams.get("purchaseId");
  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type");

  const isPackPurchase = typeParam === "pack" && purchaseId;
  const [emailInput, setEmailInput] = useState("");
  const email = emailParam || emailInput;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const isOrgId = /^[a-zA-Z0-9]{20}$/.test(slugOrId);
        const query = isOrgId ? `organisationId=${slugOrId}` : `slug=${encodeURIComponent(slugOrId)}`;
        const res = await fetch(`${FUNCTIONS_BASE}/getPublicOrganisation?${query}`);
        const data = await res.json();
        if (data.name) setOrgName(data.name);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slugOrId]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    if (!email || !purchaseId) {
      setSignupError("Missing email or purchase ID");
      return;
    }

    setSigningUp(true);
    try {
      const completeWebSignup = httpsCallable(functions, "completeWebSignup");
      const result = await completeWebSignup({ email, password, purchaseId });
      const data = result.data as { success?: boolean; message?: string };
      if (data.success) {
        setAccountCreated(true);
        await signInWithEmailAndPassword(auth, email, password);
        router.push(`/join/${slugOrId}/schedule`);
      } else {
        setSignupError(data.message || "Something went wrong");
      }
    } catch (err: any) {
      const msg = err?.message || err?.details || "Failed to create account";
      setSignupError(typeof msg === "string" ? msg : "Failed to create account");
    } finally {
      setSigningUp(false);
    }
  };

  if (!sessionId && !purchaseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Payment complete</h1>
          <p className="mt-2 text-gray-600">
            If you just completed a payment, check your email for your invite code and next steps.
          </p>
          {slugOrId && (
            <Link
              href={`/join/${slugOrId}`}
              className="mt-6 inline-block text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
            >
              ← Back to sign up
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Pack purchase: show Set password form
  if (isPackPurchase && !accountCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 text-center">Payment successful!</h1>
          <p className="mt-2 text-gray-600 text-center">
            Create your account to book classes online or in the app.
          </p>
          <form onSubmit={handleSetPassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmailInput(e.target.value)}
                readOnly={!!emailParam}
                placeholder="you@example.com"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                minLength={6}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent"
              />
            </div>
            {signupError && (
              <p className="text-sm text-red-600">{signupError}</p>
            )}
            <button
              type="submit"
              disabled={signingUp}
              className="w-full py-3 px-4 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--lifeset-primary, #6366F1)" }}
            >
              {signingUp ? "Creating account..." : "Create account & book classes"}
            </button>
          </form>
          {slugOrId && (
            <Link
              href={`/join/${slugOrId}`}
              className="mt-6 block text-center text-sm text-lifeset-primary hover:text-lifeset-primary-dark"
            >
              ← Back to sign up
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Membership or no pack: show generic success with app links
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment successful!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for joining {loading ? "..." : orgName || "us"}.
        </p>
        <div className="mt-6 p-4 bg-lifeset-primary-light rounded-lg text-left">
          <h2 className="font-semibold text-gray-900">Next steps</h2>
          <ol className="mt-2 space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Check your email for your invite code</li>
            <li>Download the LifeSet app (iOS or Android)</li>
            <li>Create your account and enter the invite code</li>
            <li>You&apos;re all set!</li>
          </ol>
        </div>
        {slugOrId && (
          <Link
            href={`/join/${slugOrId}/schedule`}
            className="mt-4 inline-flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: "var(--lifeset-primary, #6366F1)" }}
          >
            View class schedule & book
          </Link>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://apps.apple.com/ie/app/lifeset/id6461768606"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            📱 App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.lifeset.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            🤖 Google Play
          </a>
        </div>
        {slugOrId && (
          <Link
            href={`/join/${slugOrId}`}
            className="mt-6 inline-block text-sm text-lifeset-primary hover:text-lifeset-primary-dark"
          >
            ← Back to sign up
          </Link>
        )}
      </div>
    </div>
  );
}
