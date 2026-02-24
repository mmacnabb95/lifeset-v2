"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Check your email
            </h1>
            <p className="mt-4 text-sm text-gray-600 text-center">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                try again
              </button>
            </p>
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark"
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lifeset-primary hover:bg-lifeset-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lifeset-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/" className="font-medium text-lifeset-primary hover:text-lifeset-primary-dark">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
