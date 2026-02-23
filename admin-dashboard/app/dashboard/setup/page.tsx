"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const FUNCTIONS_BASE = "https://us-central1-lifeset-v2.cloudfunctions.net";

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [organisation, setOrganisation] = useState<{ name: string; stripeAccountId?: string } | null>(null);
  const [hasStripe, setHasStripe] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [hasClass, setHasClass] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [creatingMembership, setCreatingMembership] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [membershipName, setMembershipName] = useState("Monthly Membership");
  const [membershipPrice, setMembershipPrice] = useState(49);
  const [className, setClassName] = useState("Morning Yoga");
  const [classDate, setClassDate] = useState("");
  const [classStartTime, setClassStartTime] = useState("09:00");
  const [classEndTime, setClassEndTime] = useState("10:00");

  useEffect(() => {
    loadSetupStatus();
  }, []);

  const loadSetupStatus = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const orgId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];
      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);

      const orgDoc = await getDoc(doc(db, "organisations", orgId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        setOrganisation({ name: orgData?.name || "Your Gym", stripeAccountId: orgData?.stripeAccountId });
        setHasStripe(!!orgData?.stripeAccountId);
      }

      const membershipsSnap = await getDocs(
        query(collection(db, "memberships"), where("organisationId", "==", orgId))
      );
      const hasTier = membershipsSnap.docs.some((d) => !d.data().userId);
      setHasMembership(hasTier);

      const classesSnap = await getDocs(
        query(collection(db, "classes"), where("organisationId", "==", orgId))
      );
      setHasClass(classesSnap.size > 0);
    } catch (error) {
      console.error("Error loading setup status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!organisationId) return;
    setConnectingStripe(true);
    try {
      const user = getCurrentUser();
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(
        `${FUNCTIONS_BASE}/authorizeStripeConnect?organisationId=${organisationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      } else {
        alert("Failed to initiate Stripe connection");
      }
    } catch (error) {
      console.error("Stripe connect error:", error);
      alert("Failed to connect Stripe");
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleCreateMembership = async () => {
    if (!organisationId || !membershipName || membershipPrice < 0) return;
    setCreatingMembership(true);
    try {
      await addDoc(collection(db, "memberships"), {
        organisationId,
        name: membershipName,
        description: "Unlimited classes",
        price: membershipPrice,
        currency: "USD",
        duration: 30,
        features: ["Unlimited class bookings", "Access to all classes"],
        active: true,
        recurring: true,
        createdAt: new Date(),
      });
      await loadSetupStatus();
    } catch (error) {
      console.error("Create membership error:", error);
      alert("Failed to create membership");
    } finally {
      setCreatingMembership(false);
    }
  };

  const handleCreateClass = async () => {
    if (!organisationId || !className || !classDate || !classStartTime || !classEndTime) {
      alert("Please fill in all required fields");
      return;
    }
    setCreatingClass(true);
    try {
      const classDateTime = new Date(`${classDate}T${classStartTime}`);
      await addDoc(collection(db, "classes"), {
        organisationId,
        name: className,
        description: "",
        instructor: "",
        date: classDateTime,
        startTime: classStartTime,
        endTime: classEndTime,
        capacity: 20,
        bookedCount: 0,
        createdAt: new Date(),
      });
      await loadSetupStatus();
    } catch (error) {
      console.error("Create class error:", error);
      alert("Failed to create class");
    } finally {
      setCreatingClass(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lifeset-primary" />
      </div>
    );
  }

  if (!organisationId) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">You need to belong to an organisation to complete setup.</p>
        </div>
      </div>
    );
  }

  const allComplete = hasStripe && hasMembership && hasClass;
  const steps = [
    {
      id: "stripe",
      title: "Connect Stripe",
      description: "Accept payments for memberships and packs",
      done: hasStripe,
      action: (
        <button
          onClick={handleConnectStripe}
          disabled={connectingStripe || hasStripe}
          className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
        >
          {hasStripe ? "Connected ✓" : connectingStripe ? "Redirecting..." : "Connect Stripe"}
        </button>
      ),
    },
    {
      id: "membership",
      title: "Create your first membership",
      description: "Members need a membership or pack to book classes",
      done: hasMembership,
      action: hasMembership ? (
        <span className="text-green-600 font-medium">Done ✓</span>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={membershipName}
            onChange={(e) => setMembershipName(e.target.value)}
            placeholder="e.g. Monthly Membership"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="flex gap-2 items-center">
            <span className="text-gray-600">$</span>
            <input
              type="number"
              value={membershipPrice}
              onChange={(e) => setMembershipPrice(parseInt(e.target.value, 10) || 0)}
              min={0}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
            <span className="text-gray-600">/month</span>
            <button
              onClick={handleCreateMembership}
              disabled={creatingMembership}
              className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
            >
              {creatingMembership ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "class",
      title: "Create your first class",
      description: "Schedule a class so members can book",
      done: hasClass,
      action: hasClass ? (
        <span className="text-green-600 font-medium">Done ✓</span>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Morning Yoga"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="time"
              value={classStartTime}
              onChange={(e) => setClassStartTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <span className="self-center text-gray-500">to</span>
            <input
              type="time"
              value={classEndTime}
              onChange={(e) => setClassEndTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleCreateClass}
              disabled={creatingClass || !classDate}
              className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50"
            >
              {creatingClass ? "Creating..." : "Create Class"}
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Get {organisation?.name || "your gym"} set up</h1>
      <p className="text-gray-600 mb-8">
        Complete these 3 steps to start accepting members and bookings.
      </p>

      {allComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-green-800 mb-2">You&apos;re all set! 🎉</h2>
          <p className="text-green-700 mb-6">
            Your gym is ready. Share your join link with new members.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
          >
            Go to Dashboard
          </Link>
          <p className="mt-4 text-sm text-green-600">
            <Link href="/dashboard/settings" className="underline">
              Settings
            </Link>
            {" "}to get your join link and customise your landing page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`rounded-lg border p-6 ${
                step.done ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                </div>
                {step.done && (
                  <span className="text-green-600 font-medium shrink-0">✓</span>
                )}
              </div>
              {!step.done && <div className="mt-4">{step.action}</div>}
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Need more options? Use{" "}
        <Link href="/dashboard/settings" className="text-lifeset-primary hover:underline">
          Settings
        </Link>
        ,{" "}
        <Link href="/dashboard/memberships" className="text-lifeset-primary hover:underline">
          Memberships
        </Link>
        , and{" "}
        <Link href="/dashboard/schedule" className="text-lifeset-primary hover:underline">
          Schedule
        </Link>
        {" "}for full control.
      </p>
    </div>
  );
}
