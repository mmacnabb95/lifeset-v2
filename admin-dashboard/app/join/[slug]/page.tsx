"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const FUNCTIONS_BASE = "https://us-central1-lifeset-v2.cloudfunctions.net";

interface Organisation {
  organisationId: string;
  name: string;
  logoUrl: string;
  brandColours: { primary: string; secondary: string };
  landingPage: {
    enabled: boolean;
    hero?: { title: string; subtitle: string; imageUrl: string };
    aboutSection: { title: string; content: string; imageUrl: string };
    signUpHeadline: string;
    ctaButtonText?: string;
    showMemberships: boolean;
    showPacks: boolean;
    footerText: string;
  };
}

interface Membership {
  membershipId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

interface Pack {
  packId: string;
  name: string;
  description?: string;
  features?: string[];
  price: number;
  currency: string;
  classCount: number;
  validityDays: number;
}

export default function JoinPage() {
  const params = useParams();
  const slugOrId = params.slug as string;

  const [org, setOrg] = useState<Organisation | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;

    const load = async () => {
      try {
        // Support both slug (e.g. "crossfit-dublin") and organisationId (20 char alphanumeric)
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
          const [mems, pks] = await Promise.all([
            fetch(`${FUNCTIONS_BASE}/getPublicMemberships?organisationId=${orgData.organisationId}`).then((r) => r.json()).catch(() => []),
            fetch(`${FUNCTIONS_BASE}/getPublicPacks?organisationId=${orgData.organisationId}`).then((r) => r.json()).catch(() => []),
          ]);
          setMemberships(Array.isArray(mems) ? mems : []);
          setPacks(Array.isArray(pks) ? pks : []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slugOrId]);

  const handleCheckout = async () => {
    if (!org || !email) return;
    if (!selectedMembershipId && !selectedPackId) {
      alert("Please select a membership or pack");
      return;
    }

    setCheckingOut(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/join/${slugOrId}/success`;
      const cancelUrl = `${origin}/join/${slugOrId}`;

      const body: Record<string, string> = {
        organisationId: org.organisationId,
        email,
        successUrl,
        cancelUrl,
      };
      if (selectedMembershipId) body.membershipTierId = selectedMembershipId;
      if (selectedPackId) body.packId = selectedPackId;

      const res = await fetch(`${FUNCTIONS_BASE}/createPublicCheckoutSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout");
      }
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
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
        </div>
      </div>
    );
  }

  const primary = org.brandColours?.primary || "#6366F1";
  const secondary = org.brandColours?.secondary || "#FFFFFF";
  const heroImageUrl = org.landingPage?.hero?.imageUrl;
  const about = org.landingPage?.aboutSection;
  const hasAbout = about && (about.title?.trim() || about.content?.trim());
  const ctaText = org.landingPage?.ctaButtonText || "Continue to payment";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: heroImageUrl
            ? `linear-gradient(135deg, ${primary}cc 0%, ${primary}99 50%, ${primary}dd 100%), url(${heroImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
        }}
      >
        <div className="relative max-w-4xl mx-auto text-center">
          {org.logoUrl && (
            <img
              src={org.logoUrl}
              alt={org.name}
              className="h-20 mx-auto mb-8 object-contain drop-shadow-lg"
            />
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-md">
            {org.landingPage?.hero?.title || `Join ${org.name}`}
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-white/95 max-w-2xl mx-auto">
            {org.landingPage?.hero?.subtitle || "Start your journey today"}
          </p>
        </div>
      </header>

      {/* About section */}
      {hasAbout && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className={`grid gap-10 lg:gap-16 ${about.imageUrl ? "lg:grid-cols-2" : ""} items-center`}>
              {about.imageUrl && (
                <div className="order-2 lg:order-1">
                  <img
                    src={about.imageUrl}
                    alt=""
                    className="w-full rounded-2xl shadow-lg object-cover aspect-video lg:aspect-square"
                  />
                </div>
              )}
              <div className={about.imageUrl ? "order-1 lg:order-2" : ""}>
                {about.title?.trim() && (
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {about.title}
                  </h2>
                )}
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {about.content?.trim()}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Membership & Pack selection */}
      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 text-center">
          {org.landingPage?.signUpHeadline || "Choose your membership"}
        </h2>

        {org.landingPage?.showMemberships !== false && memberships.length > 0 && (
          <div className="mb-14">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Memberships</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {memberships.map((m) => (
                <button
                  key={m.membershipId}
                  onClick={() => {
                    setSelectedMembershipId(m.membershipId);
                    setSelectedPackId(null);
                  }}
                  className={`p-6 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md ${
                    selectedMembershipId === m.membershipId
                      ? "ring-2 ring-offset-2"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={
                    selectedMembershipId === m.membershipId
                      ? { borderColor: primary, backgroundColor: `${primary}12`, ringColor: primary }
                      : {}
                  }
                >
                  <h4 className="font-semibold text-lg text-gray-900">{m.name}</h4>
                  <p className="mt-3 text-2xl font-bold" style={{ color: primary }}>
                    {m.currency === "EUR" ? "€" : m.currency === "GBP" ? "£" : "$"}
                    {m.price}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / {m.duration} days
                    </span>
                  </p>
                  {m.description && m.description.trim() && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{m.description}</p>
                  )}
                  {m.features && m.features.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {m.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: primary }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {org.landingPage?.showPacks !== false && packs.length > 0 && (
          <div className="mb-14">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Class packs</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((p) => (
                <button
                  key={p.packId}
                  onClick={() => {
                    setSelectedPackId(p.packId);
                    setSelectedMembershipId(null);
                  }}
                  className={`p-6 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md ${
                    selectedPackId === p.packId
                      ? "ring-2 ring-offset-2"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={
                    selectedPackId === p.packId
                      ? { borderColor: primary, backgroundColor: `${primary}12`, ringColor: primary }
                      : {}
                  }
                >
                  <h4 className="font-semibold text-lg text-gray-900">{p.name}</h4>
                  <p className="mt-3 text-2xl font-bold" style={{ color: primary }}>
                    {p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$"}
                    {p.price}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {p.classCount} classes · Valid {p.validityDays} days
                  </p>
                  {p.description && p.description.trim() && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{p.description}</p>
                  )}
                  {p.features && p.features.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: primary }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {memberships.length === 0 && packs.length === 0 && (
          <p className="text-gray-500 text-center py-8">No memberships or packs available at this time.</p>
        )}

        {/* Email & Checkout */}
        <div className="mt-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <label className="block text-sm font-medium text-gray-700">Email address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent"
          />
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !email || (!selectedMembershipId && !selectedPackId)}
            className="mt-6 w-full py-4 px-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: primary }}
          >
            {checkingOut ? "Redirecting..." : ctaText}
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/join/${slugOrId}/schedule`}
            className="text-lifeset-primary hover:text-lifeset-primary-dark font-medium"
          >
            View class schedule →
          </Link>
        </div>
        {org.landingPage?.footerText && (
          <p className="mt-4 text-center text-sm text-gray-500">{org.landingPage.footerText}</p>
        )}
      </main>
    </div>
  );
}
