"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { db, functions, storage } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";

interface Organisation {
  organisationId: string;
  name: string;
  type: string;
  logoUrl?: string;
  stripeAccountId?: string;
  introOfferFirstClassFree?: boolean;
  cancellationPolicyHours?: number;
  brandColours: {
    primary: string;
    secondary: string;
  };
  openingTimes?: string;
  announcements?: string[];
  landingPage?: {
    enabled: boolean;
    slug?: string;
    logoUrl?: string;
    hero?: { title: string; subtitle: string; imageUrl: string };
    aboutSection?: { title: string; content: string; imageUrl: string };
    signUpHeadline?: string;
    ctaButtonText?: string;
    showMemberships?: boolean;
    showPacks?: boolean;
    footerText?: string;
  };
}

export default function SettingsPage() {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [disconnectingStripe, setDisconnectingStripe] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "gym",
    primaryColor: "#6366F1",
    secondaryColor: "#FFFFFF",
  });
  const [openingTimes, setOpeningTimes] = useState("");
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [introOfferFirstClassFree, setIntroOfferFirstClassFree] = useState(false);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState<number>(0);
  const [landingPageData, setLandingPageData] = useState({
    enabled: true,
    slug: "",
    logoUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    aboutTitle: "",
    aboutContent: "",
    aboutImageUrl: "",
    signUpHeadline: "Choose your membership",
    ctaButtonText: "Continue to payment",
    showMemberships: true,
    showPacks: true,
    footerText: "",
  });

  useEffect(() => {
    loadOrganisation();
  }, []);

  const loadOrganisation = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // Get user's organisation
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const orgId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];

      if (!orgId) {
        setLoading(false);
        return;
      }

      // Get organisation
      const orgDocRef = doc(db, "organisations", orgId);
      const orgDoc = await getDoc(orgDocRef);
      
      if (orgDoc.exists()) {
        const orgData = orgDoc.data() as Organisation;
        setOrganisation({ ...orgData, organisationId: orgDoc.id });
        setFormData({
          name: orgData.name,
          type: orgData.type,
          primaryColor: orgData.brandColours?.primary || "#6366F1",
          secondaryColor: orgData.brandColours?.secondary || "#FFFFFF",
        });
        setOpeningTimes(orgData.openingTimes || "");
        setAnnouncements(orgData.announcements || []);
        setIntroOfferFirstClassFree(orgData.introOfferFirstClassFree === true);
        setCancellationPolicyHours(typeof orgData.cancellationPolicyHours === "number" ? orgData.cancellationPolicyHours : 0);
        const lp = orgData.landingPage;
        setLandingPageData({
          enabled: lp?.enabled !== false,
          slug: lp?.slug || "",
          logoUrl: orgData.logoUrl || lp?.logoUrl || "",
          heroTitle: lp?.hero?.title || `Join ${orgData.name || "Us"}`,
          heroSubtitle: lp?.hero?.subtitle || "Start your journey today",
          heroImageUrl: lp?.hero?.imageUrl || "",
          aboutTitle: lp?.aboutSection?.title || "",
          aboutContent: lp?.aboutSection?.content || "",
          aboutImageUrl: lp?.aboutSection?.imageUrl || "",
          signUpHeadline: lp?.signUpHeadline || "Choose your membership",
          ctaButtonText: lp?.ctaButtonText || "Continue to payment",
          showMemberships: lp?.showMemberships !== false,
          showPacks: lp?.showPacks !== false,
          footerText: lp?.footerText || "",
        });
      }
    } catch (error) {
      console.error("Error loading organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organisation) return;

    setSaving(true);
    try {
      const slugValue = landingPageData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || null;
      await updateDoc(doc(db, "organisations", organisation.organisationId), {
        name: formData.name,
        type: formData.type,
        logoUrl: landingPageData.logoUrl || "",
        introOfferFirstClassFree,
        cancellationPolicyHours: cancellationPolicyHours > 0 ? cancellationPolicyHours : null,
        brandColours: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
        },
        openingTimes: openingTimes.trim() || null,
        announcements: announcements.filter((a) => a.trim()).length > 0 ? announcements.filter((a) => a.trim()) : [],
        landingPage: {
          enabled: landingPageData.enabled,
          slug: slugValue,
          logoUrl: landingPageData.logoUrl || "",
          hero: {
            title: landingPageData.heroTitle || `Join ${formData.name || "Us"}`,
            subtitle: landingPageData.heroSubtitle || "Start your journey today",
            imageUrl: landingPageData.heroImageUrl || "",
          },
          aboutSection: {
            title: landingPageData.aboutTitle || "",
            content: landingPageData.aboutContent || "",
            imageUrl: landingPageData.aboutImageUrl || "",
          },
          signUpHeadline: landingPageData.signUpHeadline || "Choose your membership",
          ctaButtonText: landingPageData.ctaButtonText || "Continue to payment",
          showMemberships: landingPageData.showMemberships,
          showPacks: landingPageData.showPacks,
          footerText: landingPageData.footerText || "",
        },
        updatedAt: new Date(),
      });

      alert("Settings saved successfully!");
      await loadOrganisation();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organisation) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG, JPEG, or WebP image (max 2MB)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }

    setLogoUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const storageRef = ref(
        storage,
        `organisations/${organisation.organisationId}/logo.${ext}`
      );
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      setLandingPageData((prev) => ({ ...prev, logoUrl: downloadUrl }));
      // Save immediately so logo persists
      await updateDoc(doc(db, "organisations", organisation.organisationId), {
        logoUrl: downloadUrl,
        "landingPage.logoUrl": downloadUrl,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      console.error("Logo upload failed:", error);
      alert(error.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    if (!organisation) return;
    if (!confirm("Remove the organisation logo?")) return;

    setLogoUploading(true);
    try {
      setLandingPageData((prev) => ({ ...prev, logoUrl: "" }));
      await updateDoc(doc(db, "organisations", organisation.organisationId), {
        logoUrl: "",
        "landingPage.logoUrl": "",
        updatedAt: new Date(),
      });
      // Optionally delete from Storage if we know the path - skip for now as URL may be external
    } catch (error: any) {
      alert(error.message || "Failed to remove logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!organisation) return;

    setConnectingStripe(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        alert("Please log in");
        return;
      }

      const token = await user.getIdToken();
      // Firebase Functions URL - Update with your actual region if different
      const functionsBaseUrl = 'https://us-central1-lifeset-v2.cloudfunctions.net';
      const response = await fetch(
        `${functionsBaseUrl}/authorizeStripeConnect?organisationId=${organisation.organisationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      } else {
        alert("Failed to initiate Stripe connection");
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      alert("Failed to connect Stripe");
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!organisation) return;
    if (!confirm("Are you sure you want to disconnect Stripe? This will prevent new payments.")) {
      return;
    }

    setDisconnectingStripe(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        alert("Please log in");
        return;
      }

      const token = await user.getIdToken();
      // Firebase Functions URL - Update with your actual region if different
      const functionsBaseUrl = 'https://us-central1-lifeset-v2.cloudfunctions.net';
      const response = await fetch(
        `${functionsBaseUrl}/disconnectStripe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organisationId: organisation.organisationId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Stripe disconnected successfully");
        await loadOrganisation();
      } else {
        alert("Failed to disconnect Stripe");
      }
    } catch (error) {
      console.error("Error disconnecting Stripe:", error);
      alert("Failed to disconnect Stripe");
    } finally {
      setDisconnectingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!organisation) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organisation settings
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organisation Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure your organisation preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Basic Information</h2>
          <p className="text-sm text-gray-500 mb-4">Your organisation name and type.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organisation Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              >
                <option value="gym">Gym</option>
                <option value="yoga">Yoga Studio</option>
                <option value="pilates">Pilates Studio</option>
                <option value="hiit">HIIT Studio</option>
                <option value="sauna">Sauna</option>
                <option value="company">Corporate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opening Times & Announcements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Opening Times & Announcements</h2>
          <p className="text-sm text-gray-500 mb-4">
            Shown to members at the top of the organisation section in the app.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Times</label>
              <textarea
                value={openingTimes}
                onChange={(e) => setOpeningTimes(e.target.value)}
                placeholder="e.g. Mon-Fri: 9am-9pm&#10;Sat: 9am-5pm&#10;Sun: Closed"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Announcements</label>
              <p className="text-xs text-gray-500 mb-2">Add announcements to display to members. Newest first.</p>
              <div className="space-y-2">
                {announcements.map((ann, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={ann}
                      onChange={(e) => {
                        const next = [...announcements];
                        next[i] = e.target.value;
                        setAnnouncements(next);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      placeholder="Announcement text"
                    />
                    <button
                      type="button"
                      onClick={() => setAnnouncements(announcements.filter((_, j) => j !== i))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newAnnouncement.trim()) {
                          setAnnouncements([...announcements, newAnnouncement.trim()]);
                          setNewAnnouncement("");
                        }
                      }
                    }}
                    placeholder="Add new announcement..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAnnouncement.trim()) {
                        setAnnouncements([...announcements, newAnnouncement.trim()]);
                        setNewAnnouncement("");
                      }
                    }}
                    className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes & Offers */}
        {["gym", "yoga", "pilates", "hiit", "sauna"].includes(formData.type) && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Classes & Offers</h2>
            <p className="text-sm text-gray-500 mb-4">
              Intro offer for new members who haven&apos;t booked a class yet.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={introOfferFirstClassFree}
                onChange={(e) => setIntroOfferFirstClassFree(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">First class free</span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              When enabled, new members can book one class without a membership or pack.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation policy</label>
              <div className="flex items-center gap-2">
                <select
                  value={cancellationPolicyHours}
                  onChange={(e) => setCancellationPolicyHours(parseInt(e.target.value, 10))}
                  className="rounded border-gray-300"
                >
                  <option value={0}>No minimum (cancel anytime)</option>
                  <option value={1}>1 hour before class</option>
                  <option value={2}>2 hours before class</option>
                  <option value={4}>4 hours before class</option>
                  <option value={12}>12 hours before class</option>
                  <option value={24}>24 hours before class</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Members must cancel at least this long before class starts, or the cancellation will be blocked.
              </p>
            </div>
          </div>
        )}

        {/* Branding */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Branding</h2>
          <p className="text-sm text-gray-500 mb-4">Colours used across your sign-up page and app.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Landing Page / Sign-up Website */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign-up Website</h2>
          <p className="text-sm text-gray-500 mb-4">
            Customise your public sign-up page. Customers can join and pay without admin involvement.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-lifeset-primary-light rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Your sign-up page</p>
                <p className="text-xs text-gray-600 mt-1">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/join/${landingPageData.slug || organisation.organisationId}`
                    : `/join/${landingPageData.slug || organisation.organisationId}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/join/${landingPageData.slug || organisation.organisationId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark"
                >
                  View
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/join/${landingPageData.slug || organisation.organisationId}`;
                    navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                  }}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Copy link
                </button>
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={landingPageData.enabled}
                onChange={(e) => setLandingPageData({ ...landingPageData, enabled: e.target.checked })}
                className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Enable sign-up page</span>
            </label>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">General</h3>
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organisation logo</label>
              <p className="text-xs text-gray-500 mb-2">PNG, JPEG or WebP. Max 2MB. Shown on the app home screen and join page.</p>
              <div className="flex items-center gap-4 mt-2">
                {landingPageData.logoUrl ? (
                  <>
                    <img
                      src={landingPageData.logoUrl}
                      alt="Organisation logo"
                      className="h-16 w-16 object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 text-sm bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark cursor-pointer disabled:opacity-50">
                        {logoUploading ? "Uploading..." : "Change"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={logoUploading}
                        className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-lifeset-primary hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-gray-500">📷</span>
                    <span className="text-sm font-medium text-gray-700">
                      {logoUploading ? "Uploading..." : "Upload logo"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">URL slug</label>
              <input
                type="text"
                value={landingPageData.slug}
                onChange={(e) => setLandingPageData({ ...landingPageData, slug: e.target.value })}
                placeholder="e.g. crossfit-dublin (leave empty to use organisation ID)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hero section</h3>
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero title</label>
              <input
                type="text"
                value={landingPageData.heroTitle}
                onChange={(e) => setLandingPageData({ ...landingPageData, heroTitle: e.target.value })}
                placeholder="Join [Your Gym]"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero subtitle</label>
              <input
                type="text"
                value={landingPageData.heroSubtitle}
                onChange={(e) => setLandingPageData({ ...landingPageData, heroSubtitle: e.target.value })}
                placeholder="Start your journey today"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero image URL (optional)</label>
              <input
                type="url"
                value={landingPageData.heroImageUrl}
                onChange={(e) => setLandingPageData({ ...landingPageData, heroImageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">About section (optional)</h3>
              <p className="text-xs text-gray-500 mb-3">Displayed between the hero and membership options.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">About section title</label>
                  <input
                    type="text"
                    value={landingPageData.aboutTitle}
                    onChange={(e) => setLandingPageData({ ...landingPageData, aboutTitle: e.target.value })}
                    placeholder="About us"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">About section content</label>
                  <textarea
                    value={landingPageData.aboutContent}
                    onChange={(e) => setLandingPageData({ ...landingPageData, aboutContent: e.target.value })}
                    placeholder="Tell visitors about your gym, studio, or community..."
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">About section image URL (optional)</label>
                  <input
                    type="url"
                    value={landingPageData.aboutImageUrl}
                    onChange={(e) => setLandingPageData({ ...landingPageData, aboutImageUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sign-up options</h3>
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sign-up section headline</label>
              <input
                type="text"
                value={landingPageData.signUpHeadline}
                onChange={(e) => setLandingPageData({ ...landingPageData, signUpHeadline: e.target.value })}
                placeholder="Choose your membership"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Checkout button text</label>
              <input
                type="text"
                value={landingPageData.ctaButtonText}
                onChange={(e) => setLandingPageData({ ...landingPageData, ctaButtonText: e.target.value })}
                placeholder="Continue to payment"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={landingPageData.showMemberships}
                  onChange={(e) => setLandingPageData({ ...landingPageData, showMemberships: e.target.checked })}
                  className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Show memberships</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={landingPageData.showPacks}
                  onChange={(e) => setLandingPageData({ ...landingPageData, showPacks: e.target.checked })}
                  className="rounded border-gray-300 text-lifeset-primary focus:ring-lifeset-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Show class packs</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Footer text (optional)</label>
              <textarea
                value={landingPageData.footerText}
                onChange={(e) => setLandingPageData({ ...landingPageData, footerText: e.target.value })}
                placeholder="Questions? Contact us at..."
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
              />
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Connect */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Integration</h2>
          <p className="text-sm text-gray-500 mb-4">Connect Stripe to accept online payments for memberships and class packs.</p>
          <div className="bg-gray-50 rounded-lg p-4">
            {organisation.stripeAccountId ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Stripe Connected</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Account ID: {organisation.stripeAccountId.substring(0, 20)}...
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Connected
                  </span>
                </div>
                <button
                  onClick={handleDisconnectStripe}
                  disabled={disconnectingStripe}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {disconnectingStripe ? "Disconnecting..." : "Disconnect Stripe"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-3">
                  Connect your Stripe account to accept card payments for memberships and packs. You&apos;ll receive payouts directly to your bank account.
                </p>
                <ol className="text-sm text-gray-600 mb-4 list-decimal list-inside space-y-2">
                  <li>Click &quot;Connect Stripe&quot; below</li>
                  <li>Sign in to Stripe or create a free account</li>
                  <li>Complete the verification (business details, bank account)</li>
                  <li>You&apos;ll be redirected back here when done</li>
                </ol>
                <button
                  onClick={handleConnectStripe}
                  disabled={connectingStripe}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectingStripe ? "Connecting..." : "Connect Stripe"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white shadow rounded-lg p-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
