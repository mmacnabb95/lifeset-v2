"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange, logout } from "@/lib/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import Link from "next/link";

const NAV_ITEMS: { href: string; label: string; roles?: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "staff", "coach"] },
  { href: "/dashboard/members", label: "Members", roles: ["admin", "staff", "coach"] },
  { href: "/dashboard/coaches", label: "Coaches", roles: ["admin", "staff", "coach"] },
  { href: "/dashboard/memberships", label: "Memberships", roles: ["admin", "staff"] },
  { href: "/dashboard/packs", label: "Packs", roles: ["admin", "staff"] },
  { href: "/dashboard/schedule", label: "Schedule", roles: ["admin", "staff"] },
  { href: "/dashboard/bookings", label: "Bookings", roles: ["admin", "staff"] },
  { href: "/dashboard/qr-scanner", label: "QR Scanner", roles: ["admin", "staff"] },
  { href: "/dashboard/attendance", label: "Attendance", roles: ["admin", "staff"] },
  { href: "/dashboard/analytics", label: "Analytics", roles: ["admin", "staff"] },
  { href: "/dashboard/exercises", label: "Exercises", roles: ["admin", "staff", "coach"] },
  { href: "/dashboard/workout-plans", label: "Workout Plans", roles: ["admin", "staff", "coach"] },
  { href: "/dashboard/habits", label: "Habits", roles: ["admin", "staff"] },
  { href: "/dashboard/goals", label: "Goals", roles: ["admin", "staff"] },
  { href: "/dashboard/settings", label: "Settings", roles: ["admin", "staff"] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [organisation, setOrganisation] = useState<any>(null);
  const [showSetupNav, setShowSetupNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const coachRestrictedPaths = ["/dashboard/memberships", "/dashboard/packs", "/dashboard/schedule", "/dashboard/bookings", "/dashboard/qr-scanner", "/dashboard/attendance", "/dashboard/analytics", "/dashboard/habits", "/dashboard/goals", "/dashboard/settings"];

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        const userData = userDoc.data();

        const role = userData?.role;
        if (role !== "admin" && role !== "staff" && role !== "coach") {
          router.push("/");
          return;
        }

        setUser({ ...authUser, ...userData });

        const orgId = userData?.activeOrganisationId || userData?.organisationId || userData?.organisations?.[0];
        if (orgId) {
          const orgDoc = await getDoc(doc(db, "organisations", orgId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganisation(orgData);

            // Show Setup in nav only when incomplete (gym-type orgs)
            const gymTypes = ["gym", "yoga", "pilates", "hiit", "sauna"];
            if (gymTypes.includes(orgData?.type || "")) {
              const hasStripe = !!orgData?.stripeAccountId;
              const membershipsSnap = await getDocs(
                query(collection(db, "memberships"), where("organisationId", "==", orgId))
              );
              const hasTier = membershipsSnap.docs.some((d) => !d.data().userId);
              const classesSnap = await getDocs(
                query(collection(db, "classes"), where("organisationId", "==", orgId))
              );
              setShowSetupNav(!(hasStripe && hasTier && classesSnap.size > 0));
            } else {
              setShowSetupNav(false);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Redirect coaches away from restricted pages
  useEffect(() => {
    if (!loading && user?.role === "coach") {
      const isRestricted = coachRestrictedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (isRestricted) {
        router.replace("/dashboard");
      }
    }
  }, [loading, user?.role, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const NavLink = ({
    href,
    label,
    onClick,
  }: {
    href: string;
    label: string;
    onClick?: () => void;
  }) => {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-lifeset-primary-light text-lifeset-primary"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {label}
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lifeset-bg flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col w-64 bg-lifeset-sidebar border-r border-gray-200 min-h-screen">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-lifeset-primary">LifeSetOS Admin</h1>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.filter((item) => {
              const allowed = item.roles || ["admin", "staff"];
              return allowed.includes(user?.role || "");
            }).map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
            {showSetupNav && (user?.role === "admin" || user?.role === "staff") && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <NavLink href="/dashboard/setup" label="Setup" />
              </div>
            )}
          </nav>
          <div className="p-4 border-t border-gray-200">
            {organisation && (
              <p className="text-sm text-gray-600 truncate mb-2" title={organisation.name}>
                {organisation.name}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Mobile (slide-out) */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-lifeset-primary">LifeSetOS Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.filter((item) => {
              const allowed = item.roles || ["admin", "staff"];
              return allowed.includes(user?.role || "");
            }).map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
            {showSetupNav && (user?.role === "admin" || user?.role === "staff") && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <NavLink
                  href="/dashboard/setup"
                  label="Setup"
                  onClick={() => setSidebarOpen(false)}
                />
              </div>
            )}
          </nav>
          <div className="p-4 border-t border-gray-200">
            {organisation && (
              <p className="text-sm text-gray-600 truncate mb-2">{organisation.name}</p>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-lifeset-primary hover:bg-lifeset-primary-light"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-lifeset-primary">LifeSetOS Admin</span>
          <div className="w-10" />
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

