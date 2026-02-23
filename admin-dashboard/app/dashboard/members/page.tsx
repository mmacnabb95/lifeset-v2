"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, deleteField, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase-client";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

interface Member {
  uid: string;
  email: string;
  username: string;
  role: string;
  organisationId?: string;
  xp?: number;
  level?: number;
  streak?: number;
  createdAt?: any;
  // CRM fields
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  profilePictureUrl?: string;
  // Pending member fields
  status?: "pending" | "active";
  pendingMemberId?: string;
  inviteCode?: string | null;
  // Stripe subscription info
  hasStripeSubscription?: boolean;
  membershipId?: string | null;
  // Membership status (for past_due alert)
  hasPastDueMembership?: boolean;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [invites, setInvites] = useState<any[]>([]);
  const [showInvitesList, setShowInvitesList] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Member profile/CRM states
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
    membershipTierId: "",
    packId: "",
    membershipStartDate: new Date().toISOString().split('T')[0],
    paymentAmount: "",
    paymentMethod: "",
    paymentReference: "",
  });
  const [creatingMember, setCreatingMember] = useState(false);
  
  // Membership assignment state
  const [showAssignMembershipModal, setShowAssignMembershipModal] = useState(false);
  const [selectedMemberForMembership, setSelectedMemberForMembership] = useState<Member | null>(null);
  const [membershipTiers, setMembershipTiers] = useState<any[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [membershipStartDate, setMembershipStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assigningMembership, setAssigningMembership] = useState(false);
  const [assignPaymentAmount, setAssignPaymentAmount] = useState("");
  const [assignPaymentMethod, setAssignPaymentMethod] = useState("");
  const [assignPaymentReference, setAssignPaymentReference] = useState("");
  
  // Pack purchase state
  const [showPurchasePackModal, setShowPurchasePackModal] = useState(false);
  const [selectedMemberForPack, setSelectedMemberForPack] = useState<Member | null>(null);
  const [packs, setPacks] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>("");
  const [packPurchaseDate, setPackPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchasingPack, setPurchasingPack] = useState(false);
  const [packPaymentAmount, setPackPaymentAmount] = useState("");
  const [packPaymentMethod, setPackPaymentMethod] = useState("");
  const [packPaymentReference, setPackPaymentReference] = useState("");
  
  // Sell Membership state (Stripe checkout)
  const [showSellMembershipModal, setShowSellMembershipModal] = useState(false);
  const [sellMembershipEmail, setSellMembershipEmail] = useState<string>("");
  const [sellMembershipTierId, setSellMembershipTierId] = useState<string>("");
  const [sellPackId, setSellPackId] = useState<string>("");
  const [sellingMembership, setSellingMembership] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [payAtDeskMode, setPayAtDeskMode] = useState(false);

  useEffect(() => {
    loadMembers();
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect to handle payment verification after organisationId is loaded
  useEffect(() => {
    if (!organisationId) return;
    
    // Check if user just returned from Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const sessionId = urlParams.get("session_id");
    const purchaseId = urlParams.get("purchaseId");
    
    if (paymentStatus === "success" && sessionId) {
      console.log("Payment success detected, verifying checkout session...", { sessionId, purchaseId, organisationId });
      // Verify checkout session (fallback when webhook doesn't fire)
      verifyCheckoutSession(sessionId, purchaseId).then(() => {
        // Clean up URL after verification completes
        window.history.replaceState({}, "", window.location.pathname);
      }).catch((error) => {
        console.error("Verification error:", error);
        // Still clean up URL even on error
        window.history.replaceState({}, "", window.location.pathname);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationId]);

  useEffect(() => {
    if (organisationId) {
      loadMembershipTiers();
      loadPacks();
    }
  }, [organisationId]);

  const verifyCheckoutSession = async (sessionId: string, purchaseId: string | null) => {
    if (!organisationId) {
      console.error("Cannot verify checkout: organisationId not set");
      return;
    }
    
    try {
      const user = getCurrentUser();
      if (!user) {
        console.error("Cannot verify checkout: user not authenticated");
        return;
      }
      
      console.log("Calling verifyCheckoutSession with:", { sessionId, organisationId });
      const verifyCheckout = httpsCallable(functions, "verifyCheckoutSession");
      const result = await verifyCheckout({
        sessionId,
        organisationId,
      });
      
      console.log("verifyCheckoutSession result:", result);
      const data = result.data as any;
      console.log("verifyCheckoutSession data:", JSON.stringify(data, null, 2));
      if (data.success) {
        if (data.inviteCode) {
          alert(`✅ Payment verified! Welcome email sent to ${data.email} with invite code: ${data.inviteCode}`);
        } else if (data.alreadyProcessed) {
          alert(`✅ Payment already processed. Welcome email was sent previously.`);
        } else {
          alert(`✅ Payment verified! ${data.message}`);
        }
        // Reload members to show updated list
        loadMembers();
        loadInvites();
      } else {
        console.error("Checkout verification failed:", data);
        alert(`⚠️ Payment verification failed: ${data.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error verifying checkout session:", error);
      const errorMessage = error.message || error.toString();
      alert(`❌ Error verifying payment: ${errorMessage}\n\nCheck the browser console for details. The webhook may still process it.`);
    }
  };

  const loadInvites = async () => {
    if (!organisationId) return;
    
    try {
      const invitesQuery = query(
        collection(db, "organisationInvites"),
        where("organisationId", "==", organisationId)
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      
      const invitesList: any[] = [];
      invitesSnapshot.forEach((doc) => {
        invitesList.push({ inviteId: doc.id, ...doc.data() });
      });
      
      // Sort by creation date (newest first)
      invitesList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setInvites(invitesList);
    } catch (error) {
      console.error("Error loading invites:", error);
    }
  };

  const loadMembershipTiers = async () => {
    if (!organisationId) return;
    
    try {
      // Get all membership tiers (tiers don't have userId)
      const allMembershipsQuery = query(
        collection(db, "memberships"),
        where("organisationId", "==", organisationId)
      );
      const allSnapshot = await getDocs(allMembershipsQuery);
      
      const tiersList: any[] = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        // Tiers don't have userId field (user memberships do)
        if (!data.userId && data.active) {
          tiersList.push({
            membershipId: doc.id,
            ...data,
          });
        }
      });
      
      setMembershipTiers(tiersList);
    } catch (error) {
      console.error("Error loading membership tiers:", error);
    }
  };

  const loadPacks = async () => {
    if (!organisationId) return;
    
    try {
      const packsQuery = query(
        collection(db, "packs"),
        where("organisationId", "==", organisationId),
        where("active", "==", true)
      );
      const packsSnapshot = await getDocs(packsQuery);
      
      const packsList: any[] = [];
      packsSnapshot.forEach((doc) => {
        packsList.push({
          packId: doc.id,
          ...doc.data(),
        });
      });
      
      setPacks(packsList);
    } catch (error) {
      console.error("Error loading packs:", error);
    }
  };

  const handleToggleInvite = async (inviteId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "organisationInvites", inviteId), {
        active: !currentActive,
      });
      await loadInvites();
    } catch (error) {
      console.error("Error toggling invite:", error);
      alert("Failed to update invite");
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to delete this invite code?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "organisationInvites", inviteId));
      await loadInvites();
    } catch (error) {
      console.error("Error deleting invite:", error);
      alert("Failed to delete invite");
    }
  };

  const loadMembers = async () => {
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
      // Support both new multi-org structure and legacy single org
      const orgId = userData?.activeOrganisationId || 
                   (userData?.organisations && userData.organisations.length > 0 ? userData.organisations[0] : null) ||
                   userData?.organisationId;

      if (!orgId) {
        setLoading(false);
        return;
      }

      setOrganisationId(orgId);
      setCurrentUserRole(userData?.role || "");

      // Get all members of this organisation (active users)
      // Check both singular organisationId and organisations array
      const membersQuery = query(
        collection(db, "users"),
        where("organisationId", "==", orgId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      // Also check users in organisations array (multi-org support)
      const membersArrayQuery = query(
        collection(db, "users"),
        where("organisations", "array-contains", orgId)
      );
      const membersArraySnapshot = await getDocs(membersArrayQuery);
      
      // Merge results and deduplicate by uid
      const membersMap = new Map<string, any>();
      membersSnapshot.forEach((doc) => {
        const data = doc.data();
        membersMap.set(doc.id, { uid: doc.id, ...data });
      });
      membersArraySnapshot.forEach((doc) => {
        // Only add if not already in map (deduplicate)
        if (!membersMap.has(doc.id)) {
          const data = doc.data();
          membersMap.set(doc.id, { uid: doc.id, ...data });
        }
      });
      
      const membersList: Member[] = [];
      // Add all members from merged map and load their membership data
      for (const [uid, memberData] of membersMap.entries()) {
        // Load ANY membership for this member that has a Stripe subscription (regardless of status)
        // We need to check all memberships, not just active ones, because past_due or cancelled
        // memberships might still have active Stripe subscriptions that need to be cancelled
        const memberMembershipsQuery = query(
          collection(db, "memberships"),
          where("userId", "==", uid),
          where("organisationId", "==", orgId)
          // Removed status filter - we'll check all memberships and find ones with Stripe subscriptions
        );
        const memberMembershipsSnapshot = await getDocs(memberMembershipsQuery);
        
        let hasStripeSubscription = false;
        let membershipId: string | null = null;
        let hasPastDueMembership = false;
        
        // Look through all memberships to find one with a Stripe subscription
        // Prefer active memberships, but check all statuses
        // IMPORTANT: Only count as Stripe subscription if:
        // 1. stripeSubscriptionId exists and is not null/empty
        // 2. stripeSubscriptionId starts with "sub_" (valid Stripe subscription ID format)
        // This excludes Apple/RevenueCat subscriptions and manual memberships
        for (const membershipDoc of memberMembershipsSnapshot.docs) {
          const membershipData = membershipDoc.data();
          const stripeSubId = membershipData?.stripeSubscriptionId;
          
          // Debug logging
          console.log(`Checking membership ${membershipDoc.id} for user ${uid}:`, {
            stripeSubscriptionId: stripeSubId,
            status: membershipData.status,
            hasStripeSub: !!stripeSubId,
            isString: typeof stripeSubId === "string",
            startsWithSub: stripeSubId?.startsWith?.("sub_"),
          });
          
          // Validate it's a real Stripe subscription ID (starts with "sub_")
          // Test mode subscription IDs also start with "sub_" (e.g., "sub_test_...")
          if (membershipData.status === "past_due") {
            hasPastDueMembership = true;
          }
          if (stripeSubId && typeof stripeSubId === "string" && stripeSubId.startsWith("sub_")) {
            hasStripeSubscription = true;
            console.log(`✅ Found Stripe subscription for user ${uid}: ${stripeSubId}`);
            // Prefer active memberships, but if we find any with Stripe subscription, use it
            if (membershipData.status === "active") {
              membershipId = membershipDoc.id;
              break; // Found active one with Stripe, use this
            } else if (!membershipId) {
              // Store first one we find (might be past_due, cancelled, etc.)
              membershipId = membershipDoc.id;
            }
          } else if (stripeSubId) {
            console.warn(`⚠️ Invalid Stripe subscription ID format for user ${uid}: ${stripeSubId} (expected to start with "sub_")`);
          }
        }
        
        membersList.push({
          ...memberData,
          hasStripeSubscription,
          membershipId,
          hasPastDueMembership,
        } as Member & { hasStripeSubscription?: boolean; membershipId?: string | null; hasPastDueMembership?: boolean });
      }

      // Get pending members (not yet joined)
      const pendingMembersQuery = query(
        collection(db, "pendingMembers"),
        where("organisationId", "==", orgId)
      );
      const pendingMembersSnapshot = await getDocs(pendingMembersQuery);
      
      // Get all invite codes to link them
      const invitesQuery = query(
        collection(db, "organisationInvites"),
        where("organisationId", "==", orgId)
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      
      // Create a map of pendingMemberId -> invite code
      const inviteCodeMap = new Map<string, { code: string; inviteId: string }>();
      invitesSnapshot.forEach((inviteDoc) => {
        const inviteData = inviteDoc.data();
        if (inviteData.pendingMemberId) {
          inviteCodeMap.set(inviteData.pendingMemberId, {
            code: inviteData.code,
            inviteId: inviteDoc.id,
          });
        }
      });
      
      pendingMembersSnapshot.forEach((doc) => {
        const data = doc.data();
        const inviteInfo = inviteCodeMap.get(doc.id);
        membersList.push({ 
          uid: `pending_${doc.id}`, // Prefix to identify pending members
          email: data.email,
          username: data.fullName || data.email?.split("@")[0] || "Pending",
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          notes: data.notes,
          role: "member",
          organisationId: orgId,
          status: "pending", // Mark as pending
          pendingMemberId: doc.id, // Store the pending member document ID
          inviteCode: inviteInfo?.code || null, // Store invite code if linked
        } as Member & { status: string; pendingMemberId: string; inviteCode?: string | null });
      });

      // Sort by role (admin first, then staff, then members, then pending)
      membersList.sort((a, b) => {
        const roleOrder: Record<string, number> = { admin: 0, staff: 1, member: 2, employee: 3 };
        const roleA = roleOrder[a.role] || 99;
        const roleB = roleOrder[b.role] || 99;
        if (roleA !== roleB) return roleA - roleB;
        // If same role, pending members go last
        const aPending = (a as any).status === "pending";
        const bPending = (b as any).status === "pending";
        if (aPending && !bPending) return 1;
        if (!aPending && bPending) return -1;
        return 0;
      });

      // Count members with Stripe subscriptions for debugging
      const membersWithStripe = membersList.filter(m => (m as any).hasStripeSubscription).length;
      console.log(`Loaded ${membersList.length} members for organisation ${orgId} (${membersMap.size} active, ${pendingMembersSnapshot.size} pending, ${membersWithStripe} with Stripe subscriptions)`);
      console.log("Members:", membersList.map(m => ({ 
        uid: m.uid, 
        email: m.email, 
        organisationId: m.organisationId, 
        role: m.role, 
        status: (m as any).status,
        hasStripeSubscription: (m as any).hasStripeSubscription,
        membershipId: (m as any).membershipId
      })));
      
      setMembers(membersList);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveMember = async (memberUid: string) => {
    if (!confirm("Are you sure you want to remove this member from the organisation?\n\nTheir membership will be cancelled immediately. If already expired, they will lose access immediately. Otherwise, they will have a 7-day grace period before being moved to Consumer Mode.")) {
      return;
    }

    if (!organisationId) {
      alert("Organisation not found");
      return;
    }

    try {
      const memberRef = doc(db, "users", memberUid);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        alert("Member not found");
        return;
      }

      const memberData = memberDoc.data();

      // Find all active memberships for this user in this organisation
      const membershipsQuery = query(
        collection(db, "memberships"),
        where("userId", "==", memberUid),
        where("organisationId", "==", organisationId),
        where("status", "==", "active")
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);

      const now = Timestamp.now();
      let hasExpiredMembership = false;
      let hasActiveMembership = false;

      // Cancel Stripe subscriptions and expire all active memberships
      for (const membershipDoc of membershipsSnapshot.docs) {
        const membershipData = membershipDoc.data();
        const membershipId = membershipDoc.id;
        const stripeSubscriptionId = membershipData?.stripeSubscriptionId;
        const expiresAt = membershipData.expiresAt;
        
        // Cancel Stripe subscription if it exists
        if (stripeSubscriptionId) {
          try {
            const cancelSubscription = httpsCallable(functions, "cancelSubscription");
            await cancelSubscription({
              organisationId,
              membershipId,
            });
            console.log(`Cancelled Stripe subscription ${stripeSubscriptionId} for membership ${membershipId}`);
          } catch (cancelError: any) {
            console.error(`Failed to cancel Stripe subscription ${stripeSubscriptionId}:`, cancelError);
            // Continue with membership expiry even if Stripe cancellation fails
          }
        }
        
        if (expiresAt) {
          const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
          if (expiryDate <= new Date()) {
            // Already expired
            hasExpiredMembership = true;
            await updateDoc(membershipDoc.ref, {
              status: "expired",
              updatedAt: now,
            });
          } else {
            // Expire immediately
            hasActiveMembership = true;
            await updateDoc(membershipDoc.ref, {
              status: "expired",
              expiresAt: now, // Set expiry to now
              updatedAt: now,
            });
          }
        } else {
          // No expiry date, expire immediately
          hasActiveMembership = true;
          await updateDoc(membershipDoc.ref, {
            status: "expired",
            expiresAt: now,
            updatedAt: now,
          });
        }
      }

      // If membership is already expired, remove organisation access immediately (no grace period)
      if (hasExpiredMembership && !hasActiveMembership) {
        // Immediately remove organisation access
        const updatedOrganisations = (memberData?.organisations || []).filter((orgId: string) => orgId !== organisationId);
        const newActiveOrgId = updatedOrganisations.length > 0 ? updatedOrganisations[0] : null;
        
        await updateDoc(memberRef, {
          organisations: updatedOrganisations,
          activeOrganisationId: newActiveOrgId,
          organisationId: newActiveOrgId, // Legacy field
          role: newActiveOrgId ? memberData?.role : null,
          removedAt: Timestamp.now(),
          removalType: "admin",
          updatedAt: Timestamp.now(),
        });
        
        alert("Member removed. Their membership was already expired, so they have lost access immediately and will see the paywall.");
      } else {
        // Active membership was cancelled - give 7-day grace period
        const gracePeriodExpiresAt = new Date();
        gracePeriodExpiresAt.setDate(gracePeriodExpiresAt.getDate() + 7);
        
        await updateDoc(memberRef, {
          removedAt: Timestamp.now(),
          gracePeriodExpiresAt: Timestamp.fromDate(gracePeriodExpiresAt),
          removalType: "admin",
          // Keep organisationId, role, mode during grace period
          // They will be cleared automatically after grace period expires
          updatedAt: Timestamp.now(),
        });
        
        alert("Member removed. Their membership has been cancelled. They will have access for 7 more days, then will be moved to Consumer Mode and see the paywall.");
      }
      
      // Reload members
      await loadMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const handleCancelSubscription = async (memberUid: string, membershipId: string) => {
    if (!confirm("Are you sure you want to cancel this member's Stripe subscription?\n\nThis will stop recurring billing but keep them as a member. They will retain access until their current membership period expires.")) {
      return;
    }

    if (!organisationId) {
      alert("Organisation ID not found");
      return;
    }

    try {
      const cancelSubscription = httpsCallable(functions, "cancelSubscription");
      const result = await cancelSubscription({
        organisationId,
        membershipId,
      });
      
      const data = result.data as any;
      if (data.success) {
        alert("Subscription cancelled successfully. The member will retain access until their current membership period expires.");
        await loadMembers(); // Reload to update UI
      } else {
        alert(`Failed to cancel subscription: ${data.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      alert(`Failed to cancel subscription: ${error.message || "Unknown error"}`);
    }
  };

  const handleChangeRole = async (memberUid: string, newRole: string) => {
    try {
      const memberRef = doc(db, "users", memberUid);
      await updateDoc(memberRef, {
        role: newRole,
      });
      
      // Reload members
      await loadMembers();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change role");
    }
  };

  const printReceipt = (params: {
    memberName: string;
    item: string;
    amount?: number;
    method?: string;
    date?: string;
  }) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Receipt</title></head>
        <body style="font-family:sans-serif;padding:24px;max-width:400px;">
          <h2 style="border-bottom:2px solid #333;padding-bottom:8px;">Receipt</h2>
          <p><strong>Date:</strong> ${params.date || new Date().toLocaleDateString()}</p>
          <p><strong>Member:</strong> ${params.memberName}</p>
          <p><strong>Item:</strong> ${params.item}</p>
          ${params.amount ? `<p><strong>Amount:</strong> £${params.amount.toFixed(2)}</p>` : ""}
          ${params.method ? `<p><strong>Payment:</strong> ${params.method}</p>` : ""}
          <p style="margin-top:24px;font-size:12px;color:#666;">Thank you for your payment.</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  };

  const recordPayment = async (params: {
    userId?: string | null;
    email?: string;
    organisationId: string;
    amount: number;
    currency?: string;
    method: string;
    reference?: string;
    membershipId?: string;
    packPurchaseId?: string;
    description?: string;
  }) => {
    if (params.amount <= 0 || !params.method) return;
    const currentUser = getCurrentUser();
    await addDoc(collection(db, "payments"), {
      userId: params.userId ?? null,
      email: params.email || null,
      organisationId: params.organisationId,
      amount: params.amount,
      currency: params.currency || "GBP",
      method: params.method,
      reference: params.reference || "",
      membershipId: params.membershipId || null,
      packPurchaseId: params.packPurchaseId || null,
      description: params.description || "",
      createdBy: currentUser?.uid,
      createdAt: Timestamp.now(),
    });
  };

  const handleAssignMembership = (member: Member) => {
    setSelectedMemberForMembership(member);
    setSelectedTierId("");
    setMembershipStartDate(new Date().toISOString().split('T')[0]);
    setAssignPaymentAmount("");
    setAssignPaymentMethod("");
    setAssignPaymentReference("");
    setShowAssignMembershipModal(true);
  };

  const handleCreateMembership = async () => {
    if (!selectedMemberForMembership || !selectedTierId || !organisationId) {
      alert("Please select a membership tier");
      return;
    }

    setAssigningMembership(true);
    try {
      // Get the selected tier
      const tier = membershipTiers.find(t => t.membershipId === selectedTierId);
      if (!tier) {
        alert("Selected tier not found");
        return;
      }

      // Calculate dates
      const startDate = new Date(membershipStartDate);
      const expiresAt = new Date(startDate);
      expiresAt.setDate(expiresAt.getDate() + (tier.duration || 30));

      // Create membership document
      const membershipRef = await addDoc(collection(db, "memberships"), {
        userId: selectedMemberForMembership.uid,
        organisationId,
        membershipTierId: selectedTierId,
        status: "active",
        startsAt: Timestamp.fromDate(startDate),
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now(),
        // No Stripe fields for manual assignment
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });
      
      // Update with membershipId
      await updateDoc(membershipRef, {
        membershipId: membershipRef.id,
      });

      // Record payment if provided
      const amount = parseFloat(assignPaymentAmount);
      if (amount > 0 && assignPaymentMethod) {
        await recordPayment({
          userId: selectedMemberForMembership.uid,
          organisationId,
          amount,
          currency: tier?.currency || "GBP",
          method: assignPaymentMethod,
          reference: assignPaymentReference,
          membershipId: membershipRef.id,
          description: `Membership: ${tier?.name || "Assigned"}`,
        });
      }

      alert(`Membership assigned successfully! Expires: ${expiresAt.toLocaleDateString()}`);
      if (confirm("Print receipt?")) {
        printReceipt({
          memberName: selectedMemberForMembership.fullName || selectedMemberForMembership.username || selectedMemberForMembership.email || "Member",
          item: tier?.name || "Membership",
          amount: parseFloat(assignPaymentAmount) || tier?.price,
          method: assignPaymentMethod || "Manual",
        });
      }
      
      // Close modal and reset
      setShowAssignMembershipModal(false);
      setSelectedMemberForMembership(null);
      setSelectedTierId("");
      setAssignPaymentAmount("");
      setAssignPaymentMethod("");
      setAssignPaymentReference("");
    } catch (error) {
      console.error("Error assigning membership:", error);
      alert("Failed to assign membership");
    } finally {
      setAssigningMembership(false);
    }
  };

  /**
   * Sell Membership (Stripe Payment Flow)
   * 
   * This creates a Stripe Checkout session for the customer to pay.
   * After successful payment:
   * - Stripe webhook creates pendingMember + organisationInvite (single-use, from Stripe)
   * - Customer receives welcome email with invite code
   * - Customer downloads app and signs up with invite code
   * - Membership is activated with stripeSubscriptionId (for recurring) or one-time payment
   * 
   * Use this for: Credit card payments, online payments, recurring subscriptions
   */
  const handleSellMembership = async () => {
    if (!organisationId) return;
    
    if (!sellMembershipEmail) {
      alert("Please enter customer email");
      return;
    }
    
    if (!sellMembershipTierId && !sellPackId) {
      alert("Please select a membership tier or pack");
      return;
    }
    
    setSellingMembership(true);
    setCheckoutUrl(null);
    
    try {
      // Ensure we have a valid origin
      const origin = window.location.origin || (window.location.protocol + "//" + window.location.host);
      if (!origin || origin === "null" || origin === "undefined") {
        throw new Error("Unable to determine site URL. Please ensure you're accessing the dashboard via a valid URL.");
      }
      
      const successUrl = `${origin}/dashboard/members?payment=success`;
      const cancelUrl = `${origin}/dashboard/members?payment=cancelled`;
      
      // Validate URLs are absolute
      try {
        new URL(successUrl);
        new URL(cancelUrl);
      } catch (urlError) {
        throw new Error(`Invalid URL format: ${urlError}. Please ensure you're accessing the dashboard via a valid URL.`);
      }
      
      if (sellMembershipTierId) {
        // Create membership checkout session
        console.log("Creating membership checkout session with:", {
          organisationId,
          membershipTierId: sellMembershipTierId,
          email: sellMembershipEmail,
          successUrl,
          cancelUrl,
        });
        
        const createCheckout = httpsCallable(functions, "createMembershipCheckoutSession");
        const result = await createCheckout({
          organisationId,
          membershipTierId: sellMembershipTierId,
          email: sellMembershipEmail,
          successUrl,
          cancelUrl,
        });
        
        console.log("Checkout session result:", result);
        const data = result.data as any;
        if (data?.url) {
          setCheckoutUrl(data.url);
          alert(`Payment link created! Share this link with ${sellMembershipEmail}`);
        } else {
          console.error("No URL in result:", data);
          throw new Error("No checkout URL returned. Response: " + JSON.stringify(data));
        }
      } else if (sellPackId) {
        // Create pack checkout session
        console.log("Creating pack checkout session with:", {
          organisationId,
          packId: sellPackId,
          email: sellMembershipEmail,
          successUrl,
          cancelUrl,
        });
        
        const createCheckout = httpsCallable(functions, "createPackCheckoutSession");
        const result = await createCheckout({
          organisationId,
          packId: sellPackId,
          email: sellMembershipEmail,
          successUrl,
          cancelUrl,
        });
        
        console.log("Checkout session result:", result);
        const data = result.data as any;
        if (data?.url) {
          setCheckoutUrl(data.url);
          alert(`Payment link created! Share this link with ${sellMembershipEmail}`);
        } else {
          console.error("No URL in result:", data);
          throw new Error("No checkout URL returned. Response: " + JSON.stringify(data));
        }
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
        fullError: error,
      });
      
      // Extract error message from Firebase callable function error
      let errorMessage = "Unknown error";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = typeof error.details === "string" ? error.details : JSON.stringify(error.details);
      } else if (error.code) {
        errorMessage = `Error code: ${error.code}`;
      }
      
      alert(`Failed to create payment link:\n\n${errorMessage}\n\nCheck the browser console (F12) for more details.`);
    } finally {
      setSellingMembership(false);
    }
  };

  const handlePurchasePack = (member: Member) => {
    setSelectedMemberForPack(member);
    setSelectedPackId("");
    setPackPurchaseDate(new Date().toISOString().split('T')[0]);
    setShowPurchasePackModal(true);
  };

  const handleCreatePackPurchase = async () => {
    if (!selectedMemberForPack || !selectedPackId || !organisationId) {
      alert("Please select a pack");
      return;
    }

    setPurchasingPack(true);
    try {
      // Get the selected pack
      const pack = packs.find(p => p.packId === selectedPackId);
      if (!pack) {
        alert("Selected pack not found");
        return;
      }

      // Calculate expiry date
      const purchaseDate = new Date(packPurchaseDate);
      const expiresAt = new Date(purchaseDate);
      expiresAt.setDate(expiresAt.getDate() + (pack.validityDays || 90));

      // Create pack purchase document
      const purchaseRef = await addDoc(collection(db, "packPurchases"), {
        userId: selectedMemberForPack.uid,
        organisationId,
        packId: selectedPackId,
        classesRemaining: pack.classCount || 0,
        expiresAt: Timestamp.fromDate(expiresAt),
        status: "active",
        purchasedAt: Timestamp.fromDate(purchaseDate),
        createdAt: Timestamp.now(),
        // No Stripe fields for manual purchase
        stripePaymentIntentId: null,
      });
      
      // Update with purchaseId
      await updateDoc(purchaseRef, {
        purchaseId: purchaseRef.id,
      });

      // Record payment if provided
      const amount = parseFloat(packPaymentAmount);
      if (amount > 0 && packPaymentMethod) {
        await recordPayment({
          userId: selectedMemberForPack.uid,
          organisationId,
          amount,
          currency: pack.currency || "GBP",
          method: packPaymentMethod,
          reference: packPaymentReference,
          packPurchaseId: purchaseRef.id,
          description: `Pack: ${pack.name} (${pack.classCount} classes)`,
        });
      }

      alert(`Pack purchased successfully! ${pack.classCount} classes, expires: ${expiresAt.toLocaleDateString()}`);
      if (confirm("Print receipt?")) {
        printReceipt({
          memberName: selectedMemberForPack.fullName || selectedMemberForPack.username || selectedMemberForPack.email || "Member",
          item: `${pack.name} (${pack.classCount} classes)`,
          amount: parseFloat(packPaymentAmount) || pack.price,
          method: packPaymentMethod || "Manual",
        });
      }
      
      // Close modal and reset
      setShowPurchasePackModal(false);
      setSelectedMemberForPack(null);
      setSelectedPackId("");
      setPackPaymentAmount("");
      setPackPaymentMethod("");
      setPackPaymentReference("");
    } catch (error) {
      console.error("Error purchasing pack:", error);
      alert("Failed to purchase pack");
    } finally {
      setPurchasingPack(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.email?.toLowerCase().includes(searchLower) ||
      member.username?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower) ||
      member.fullName?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!organisationId) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organisation members
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            You need to belong to an organisation to manage members. Please create or join an organisation first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentUserRole === "coach"
              ? `View members to assign workouts ({members.length} total). Create workouts in Workout Plans.`
              : `Manage your organisation members (${members.length} total)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Coach role: read-only - no Sell/Add/Invite buttons */}
          {currentUserRole !== "coach" && (
            <>
          {/* Primary POS - encouraged for transaction fees & auto-renewal */}
          <button
            onClick={() => setShowSellMembershipModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            title="Create payment link - recommended for card payments & auto-renewal"
          >
            💳 Sell Membership
          </button>
          {/* Secondary - manual/cash flow */}
          <button
            onClick={() => setShowCreateMemberModal(true)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            title="For cash, corporate, or trial signups - manual renewal"
          >
            + Add Member (Manual)
          </button>
          {/* Tertiary - invite codes in dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="More options"
            >
              More ⋯
            </button>
            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMoreMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <button
                    onClick={() => {
                      setShowInvitesList(!showInvitesList);
                      setShowMoreMenu(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {showInvitesList ? "Hide" : "Show"} Invite Codes ({invites.length})
                  </button>
                </div>
              </>
            )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Past Due Alert Banner - hidden for coaches */}
      {currentUserRole !== "coach" && members.some((m) => (m as any).hasPastDueMembership) && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-amber-800">
                Past due payments
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                {members.filter((m) => (m as any).hasPastDueMembership).length} member
                {members.filter((m) => (m as any).hasPastDueMembership).length !== 1 ? "s" : ""} have
                failed renewal payments. They have 7 days to update their payment method before
                access is suspended. Consider reaching out to them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Codes List - hidden for coaches */}
      {currentUserRole !== "coach" && showInvitesList && (
        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Invite Codes</h2>
          {invites.length === 0 ? (
            <p className="text-gray-500">No invite codes created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Assign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invites.map((invite) => (
                    <tr key={invite.inviteId}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900 font-semibold">
                          {invite.code}
                        </code>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {invite.role || "member"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {invite.membershipTierId ? (
                          <span className="text-green-600">💳 Membership</span>
                        ) : invite.packId ? (
                          <span className="text-blue-600">📦 Pack</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            invite.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invite.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {invite.createdAt?.toDate
                          ? invite.createdAt.toDate().toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleInvite(invite.inviteId, invite.active)}
                          className="text-lifeset-primary hover:text-lifeset-primary-dark"
                        >
                          {invite.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(invite.inviteId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search members by name, email, phone, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-white border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-lifeset-primary focus:border-lifeset-primary placeholder:text-gray-700"
        />
      </div>

      {/* Members Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? "No members found matching your search" : "No members yet"}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-lifeset-primary-light flex items-center justify-center">
                        {member.profilePictureUrl ? (
                          <img
                            src={member.profilePictureUrl}
                            alt=""
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="text-lifeset-primary font-medium">
                            {member.username?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {member.fullName || member.username || "No name"}
                          </div>
                          {member.status === "pending" && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {(member as any).hasPastDueMembership && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800" title="Payment failed - 7 day grace period">
                              Past Due
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.phone && (
                          <div className="text-xs text-gray-400">{member.phone}</div>
                        )}
                        {member.status === "pending" && member.inviteCode && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              🎫 Code: {member.inviteCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {currentUserRole === "coach" ? (
                      <span className="text-sm text-gray-600 capitalize">{member.role || "member"}</span>
                    ) : (
                    <select
                      value={member.role || "member"}
                      onChange={(e) => handleChangeRole(member.uid, e.target.value)}
                      disabled={member.role === "admin"}
                      className={`text-sm rounded-md border-gray-300 ${
                        member.role === "admin" ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="member">Member</option>
                      <option value="employee">Employee</option>
                      <option value="coach">Coach</option>
                    </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.status === "pending" ? (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400 italic">Not yet joined</div>
                        <div className="text-xs text-blue-600 font-medium">Waiting for invite code use</div>
                      </div>
                    ) : (
                      <>
                        <div>Level {member.level || 1}</div>
                        <div className="text-xs">XP: {member.xp || 0} • Streak: {member.streak || 0}</div>
                        {member.hasStripeSubscription && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            🔄 Recurring Subscription
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 whitespace-nowrap"
                        title="View/Edit Member Details"
                      >
                        View Details
                      </button>
                      {member.status === "pending" ? (
                        <span className="text-xs text-gray-400 italic">Waiting for invite</span>
                      ) : currentUserRole === "coach" ? (
                        <span className="text-xs text-gray-500">View details to assign workouts</span>
                      ) : (
                        member.role !== "admin" && (
                          <>
                            <button
                              onClick={() => {
                                setSellMembershipEmail(member.email || "");
                                setSellMembershipTierId("");
                                setSellPackId("");
                                setCheckoutUrl(null);
                                setShowSellMembershipModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 whitespace-nowrap"
                              title="Create payment link for this member"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => handleAssignMembership(member)}
                              className="text-lifeset-primary hover:text-lifeset-primary-dark whitespace-nowrap"
                            >
                              Assign Membership
                            </button>
                            <button
                              onClick={() => handlePurchasePack(member)}
                              className="text-green-600 hover:text-green-900 whitespace-nowrap"
                            >
                              Purchase Pack
                            </button>
                            {member.hasStripeSubscription && member.membershipId && (
                              <button
                                onClick={() => handleCancelSubscription(member.uid, member.membershipId!)}
                                className="px-2 py-1 text-xs text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded border border-orange-300 whitespace-nowrap"
                                title="Cancel Stripe subscription (keeps member, just stops billing)"
                              >
                                Cancel Subscription
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.uid)}
                              className="text-red-600 hover:text-red-900 whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Assign Membership Modal */}
      {showAssignMembershipModal && selectedMemberForMembership && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Membership to {selectedMemberForMembership.username || selectedMemberForMembership.email}
              </h3>
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 <strong>Cash/Manual:</strong> This assigns a membership without payment. Renewal will require manual renewal. Use &quot;Sell Membership&quot; for Stripe and auto-renewal.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membership Tier *</label>
                  {membershipTiers.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-500">
                      No active membership tiers available.{" "}
                      <Link href="/dashboard/memberships" className="text-lifeset-primary hover:text-lifeset-primary-dark">
                        Create one first
                      </Link>
                    </p>
                  ) : (
                    <select
                      value={selectedTierId}
                      onChange={(e) => setSelectedTierId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="">Select a membership tier...</option>
                      {membershipTiers.map((tier) => (
                        <option key={tier.membershipId} value={tier.membershipId}>
                          {tier.name} - ${tier.price} / {tier.duration} days
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {selectedTierId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                      <input
                        type="date"
                        value={membershipStartDate}
                        onChange={(e) => setMembershipStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {selectedTierId && membershipTiers.find(t => t.membershipId === selectedTierId) && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>Duration:</strong> {membershipTiers.find(t => t.membershipId === selectedTierId)?.duration || 30} days
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Expires:</strong> {
                            (() => {
                              const tier = membershipTiers.find(t => t.membershipId === selectedTierId);
                              if (!tier || !membershipStartDate) return "N/A";
                              const start = new Date(membershipStartDate);
                              const expires = new Date(start);
                              expires.setDate(expires.getDate() + (tier.duration || 30));
                              return expires.toLocaleDateString();
                            })()
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Record payment (optional)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={assignPaymentAmount}
                      onChange={(e) => setAssignPaymentAmount(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={assignPaymentMethod}
                      onChange={(e) => setAssignPaymentMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="card_elsewhere">Card (elsewhere)</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Reference"
                      value={assignPaymentReference}
                      onChange={(e) => setAssignPaymentReference(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignMembershipModal(false);
                    setSelectedMemberForMembership(null);
                    setSelectedTierId("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMembership}
                  disabled={assigningMembership || !selectedTierId || membershipTiers.length === 0}
                  className="px-4 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningMembership ? "Assigning..." : "Assign Membership"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Pack Modal */}
      {showPurchasePackModal && selectedMemberForPack && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Purchase Pack for {selectedMemberForPack.username || selectedMemberForPack.email}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pack *</label>
                  {packs.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-500">
                      No active packs available.{" "}
                      <Link href="/dashboard/packs" className="text-lifeset-primary hover:text-lifeset-primary-dark">
                        Create one first
                      </Link>
                    </p>
                  ) : (
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="">Select a pack...</option>
                      {packs.map((pack) => (
                        <option key={pack.packId} value={pack.packId}>
                          {pack.name} - ${pack.price} / {pack.classCount} classes
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {selectedPackId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purchase Date *</label>
                      <input
                        type="date"
                        value={packPurchaseDate}
                        onChange={(e) => setPackPurchaseDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {selectedPackId && packs.find(p => p.packId === selectedPackId) && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>Classes:</strong> {packs.find(p => p.packId === selectedPackId)?.classCount || 0}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Validity:</strong> {packs.find(p => p.packId === selectedPackId)?.validityDays || 90} days
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Expires:</strong> {
                            (() => {
                              const pack = packs.find(p => p.packId === selectedPackId);
                              if (!pack || !packPurchaseDate) return "N/A";
                              const purchase = new Date(packPurchaseDate);
                              const expires = new Date(purchase);
                              expires.setDate(expires.getDate() + (pack.validityDays || 90));
                              return expires.toLocaleDateString();
                            })()
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Record payment (optional)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={packPaymentAmount}
                      onChange={(e) => setPackPaymentAmount(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={packPaymentMethod}
                      onChange={(e) => setPackPaymentMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="card_elsewhere">Card (elsewhere)</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Reference"
                      value={packPaymentReference}
                      onChange={(e) => setPackPaymentReference(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPurchasePackModal(false);
                    setSelectedMemberForPack(null);
                    setSelectedPackId("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePackPurchase}
                  disabled={purchasingPack || !selectedPackId || packs.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPack ? "Purchasing..." : "Purchase Pack"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay at desk - full screen mode */}
      {payAtDeskMode && checkoutUrl && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer pays here</h2>
          <p className="text-gray-600 mb-6">Scan QR code or open link to complete payment</p>
          <div className="bg-white p-6 rounded-xl border-4 border-gray-200 shadow-xl mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkoutUrl)}`}
              alt="Payment QR Code"
              className="w-64 h-64"
            />
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 mb-6"
          >
            Open payment page
          </a>
          <button
            onClick={() => setPayAtDeskMode(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Sell Membership Modal */}
      {showSellMembershipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">💳 Sell Membership</h2>
                <button
                  onClick={() => {
                    setShowSellMembershipModal(false);
                    setSellMembershipEmail("");
                    setSellMembershipTierId("");
                    setSellPackId("");
                    setCheckoutUrl(null);
                    setPayAtDeskMode(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    value={sellMembershipEmail}
                    onChange={(e) => setSellMembershipEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Customer will receive payment link and welcome email after payment
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membership Tier
                    </label>
                    <select
                      value={sellMembershipTierId}
                      onChange={(e) => {
                        setSellMembershipTierId(e.target.value);
                        setSellPackId(""); // Clear pack if membership selected
                      }}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="">Select membership...</option>
                      {membershipTiers.map((tier) => (
                        <option key={tier.membershipId} value={tier.membershipId}>
                          {tier.name} - ${tier.price}/{tier.interval || 'month'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Pack
                    </label>
                    <select
                      value={sellPackId}
                      onChange={(e) => {
                        setSellPackId(e.target.value);
                        setSellMembershipTierId(""); // Clear membership if pack selected
                      }}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    >
                      <option value="">Select pack...</option>
                      {packs.map((pack) => (
                        <option key={pack.packId} value={pack.packId}>
                          {pack.name} - {pack.classCount} classes - ${pack.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {!sellMembershipTierId && !sellPackId && (
                  <p className="text-xs text-red-600">
                    ⚠️ Please select either a membership tier or pack
                  </p>
                )}
                
                {checkoutUrl && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800 mb-3">
                      ✅ Payment link created!
                    </p>
                    
                    {/* QR Code */}
                    <div className="mb-4 flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-300 mb-2">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkoutUrl)}`}
                          alt="Payment Link QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        Customer can scan this QR code with their phone to open the payment link
                      </p>
                    </div>
                    
                    {/* Link sharing options */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={checkoutUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border-2 border-gray-500 rounded-md text-sm placeholder:text-gray-700"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(checkoutUrl);
                            alert("Link copied to clipboard!");
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Copy Link
                        </button>
                        <a
                          href={checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Open
                        </a>
                        <button
                          onClick={() => setPayAtDeskMode(true)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                        >
                          Customer pays here
                        </button>
                      </div>
                      
                      {/* Email/SMS options */}
                      {sellMembershipEmail && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              window.location.href = `mailto:${sellMembershipEmail}?subject=Your ${organisationId ? 'Membership' : 'Payment'} Link&body=Hi,%0D%0A%0D%0APlease use this link to complete your payment:%0D%0A${encodeURIComponent(checkoutUrl)}%0D%0A%0D%0AThank you!`;
                            }}
                            className="flex-1 px-3 py-2 bg-lifeset-primary text-white rounded-md hover:bg-lifeset-primary-dark text-sm"
                          >
                            📧 Email Link
                          </button>
                          <button
                            onClick={() => {
                              window.location.href = `sms:${sellMembershipEmail}?body=Your payment link: ${encodeURIComponent(checkoutUrl)}`;
                            }}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                          >
                            💬 SMS Link
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-3 text-xs text-green-700">
                      Share this link or QR code with {sellMembershipEmail || 'the customer'}. After payment, they&apos;ll receive a welcome email with invite code.
                    </p>
                    <button
                      onClick={() => {
                        const tier = membershipTiers.find(t => t.membershipId === sellMembershipTierId);
                        const pack = packs.find(p => p.packId === sellPackId);
                        printReceipt({
                          memberName: sellMembershipEmail,
                          item: tier ? tier.name : pack ? `${pack.name} (${pack.classCount} classes)` : "Payment link",
                          amount: tier?.price ?? pack?.price,
                          method: "Card (Stripe)",
                          date: new Date().toLocaleDateString(),
                        });
                      }}
                      className="mt-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      🖨️ Print receipt
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                onClick={() => {
                  setShowSellMembershipModal(false);
                  setSellMembershipEmail("");
                  setSellMembershipTierId("");
                  setSellPackId("");
                  setCheckoutUrl(null);
                  setPayAtDeskMode(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {checkoutUrl ? "Close" : "Cancel"}
                </button>
                {!checkoutUrl && (
                  <button
                    onClick={handleSellMembership}
                    disabled={sellingMembership || !sellMembershipEmail || (!sellMembershipTierId && !sellPackId)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sellingMembership ? "Creating..." : "Send Payment Link"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Member (Manual)</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      value={newMember.fullName}
                      onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary placeholder:text-gray-700"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary placeholder:text-gray-700"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={newMember.dateOfBirth}
                      onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary placeholder:text-gray-700"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={newMember.emergencyContactName}
                      onChange={(e) => setNewMember({ ...newMember, emergencyContactName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary placeholder:text-gray-700"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={newMember.emergencyContactPhone}
                      onChange={(e) => setNewMember({ ...newMember, emergencyContactPhone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newMember.notes}
                    onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary"
                    rows={3}
                    placeholder="Any additional notes about this member..."
                  />
                </div>
                
                {/* Membership/Pack Selection - Required for invite code */}
                <div className="border-t pt-4 mt-4">
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Cash/Manual:</strong> Memberships created here require manual renewal. Use &quot;Sell Membership&quot; for Stripe payments and auto-renewal.
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership or Pack * <span className="text-xs text-gray-500">(Required - member must have access when joining)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Membership Tier</label>
                      <select
                        value={newMember.membershipTierId}
                        onChange={(e) => {
                          setNewMember({ 
                            ...newMember, 
                            membershipTierId: e.target.value,
                            packId: "" // Clear pack if membership selected
                          });
                        }}
                        className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary text-sm"
                      >
                        <option value="">Select membership...</option>
                        {membershipTiers.map((tier) => (
                          <option key={tier.membershipId} value={tier.membershipId}>
                            {tier.name} - ${tier.price}/{tier.interval || 'month'}
                          </option>
                        ))}
                      </select>
                      {newMember.membershipTierId && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={newMember.membershipStartDate}
                            onChange={(e) => setNewMember({ ...newMember, membershipStartDate: e.target.value })}
                            className="block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary text-sm"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Class Pack</label>
                      <select
                        value={newMember.packId}
                        onChange={(e) => {
                          setNewMember({ 
                            ...newMember, 
                            packId: e.target.value,
                            membershipTierId: "" // Clear membership if pack selected
                          });
                        }}
                        className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary text-sm"
                      >
                        <option value="">Select pack...</option>
                        {packs.map((pack) => (
                          <option key={pack.packId} value={pack.packId}>
                            {pack.name} - {pack.classCount} classes - ${pack.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {!newMember.membershipTierId && !newMember.packId && (
                    <p className="mt-2 text-xs text-red-600">
                      ⚠️ You must select either a membership tier or pack. The invite code will automatically assign this when the member joins.
                    </p>
                  )}
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Record payment (optional)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={newMember.paymentAmount}
                      onChange={(e) => setNewMember({ ...newMember, paymentAmount: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={newMember.paymentMethod}
                      onChange={(e) => setNewMember({ ...newMember, paymentMethod: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="card_elsewhere">Card (elsewhere)</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Reference"
                      value={newMember.paymentReference}
                      onChange={(e) => setNewMember({ ...newMember, paymentReference: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateMemberModal(false);
                    setNewMember({
                      fullName: "",
                      email: "",
                      phone: "",
                      address: "",
                      dateOfBirth: "",
                      emergencyContactName: "",
                      emergencyContactPhone: "",
                      notes: "",
                      membershipTierId: "",
                      packId: "",
                      membershipStartDate: new Date().toISOString().split('T')[0],
                      paymentAmount: "",
                      paymentMethod: "",
                      paymentReference: "",
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newMember.fullName || !newMember.email || !organisationId) {
                      alert("Please fill in full name and email");
                      return;
                    }
                    
                    // Validate that either membership or pack is selected
                    if (!newMember.membershipTierId && !newMember.packId) {
                      alert("Please select a membership tier or pack. Members must have active access when they join.");
                      return;
                    }
                    
                    /**
                     * Create New Member (Cash/Manual Payment Flow)
                     * 
                     * This creates a member record for cash payments, corporate memberships, trials, or legacy members.
                     * It creates:
                     * - pendingMember record (with CRM data)
                     * - organisationInvite (reusable: true, createdFrom: "manual")
                     * - Membership/pack document (with stripeSubscriptionId: null)
                     * 
                     * Use this for: Cash payments, corporate memberships, trials, legacy members
                     * 
                     * Note: For Stripe payments, use "Sell Membership" instead.
                     */
                    setCreatingMember(true);
                    try {
                      // Step 1: Generate unique invite code
                      const generateCode = () => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                        let code = "";
                        for (let i = 0; i < 6; i++) {
                          code += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return code;
                      };

                      let inviteCode = generateCode();
                      let codeExists = true;
                      let attempts = 0;
                      while (codeExists && attempts < 10) {
                        const existingInvites = await getDocs(
                          query(collection(db, "organisationInvites"), where("code", "==", inviteCode))
                        );
                        if (existingInvites.empty) {
                          codeExists = false;
                        } else {
                          inviteCode = generateCode();
                          attempts++;
                        }
                      }

                      // Step 2: Create pending member document
                      const memberData = {
                        fullName: newMember.fullName,
                        email: newMember.email,
                        phone: newMember.phone || null,
                        address: newMember.address || null,
                        dateOfBirth: newMember.dateOfBirth || null,
                        emergencyContactName: newMember.emergencyContactName || null,
                        emergencyContactPhone: newMember.emergencyContactPhone || null,
                        notes: newMember.notes || null,
                        organisationId,
                        role: "member",
                        status: "pending",
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                      };
                      
                      const pendingMemberRef = await addDoc(collection(db, "pendingMembers"), memberData);
                      
                      // Step 3: Create invite code linked to pending member
                      const inviteData = {
                        organisationId,
                        code: inviteCode,
                        role: "member",
                        active: true,
                        reusable: true, // Manual invites are reusable
                        createdFrom: "manual", // Mark as manual creation
                        email: newMember.email,
                        pendingMemberId: pendingMemberRef.id, // Link to pending member
                        membershipTierId: newMember.membershipTierId || null,
                        packId: newMember.packId || null,
                        startDate: newMember.membershipTierId ? newMember.membershipStartDate : null,
                        createdBy: getCurrentUser()?.uid,
                        createdAt: Timestamp.now(),
                      };
                      
                      const inviteRef = await addDoc(collection(db, "organisationInvites"), inviteData);
                      
                      // Step 4: Update pending member with invite code ID (bidirectional link)
                      await updateDoc(pendingMemberRef, {
                        inviteCodeId: inviteRef.id,
                      });
                      
                      const tier = membershipTiers.find(t => t.membershipId === newMember.membershipTierId);
                      const pack = packs.find(p => p.packId === newMember.packId);
                      // Record payment if provided
                      const amount = parseFloat(newMember.paymentAmount);
                      if (amount > 0 && newMember.paymentMethod) {
                        const desc = tier ? `Membership: ${tier.name}` : pack ? `Pack: ${pack.name}` : "Manual add";
                        await recordPayment({
                          email: newMember.email,
                          organisationId,
                          amount,
                          currency: tier?.currency || pack?.currency || "GBP",
                          method: newMember.paymentMethod,
                          reference: newMember.paymentReference,
                          description: desc,
                        });
                      }
                      
                      // Reload members and invites to show the new records
                      await Promise.all([loadMembers(), loadInvites()]);
                      
                      // Build success message
                      let successMessage = `✅ Member "${newMember.fullName}" created!\n\n`;
                      successMessage += `📧 Email: ${newMember.email}\n`;
                      successMessage += `🎫 Invite Code: ${inviteCode}\n\n`;
                      if (tier) {
                        successMessage += `💳 Membership: ${tier.name}\n`;
                        successMessage += `📅 Start Date: ${newMember.membershipStartDate}\n\n`;
                      } else if (pack) {
                        successMessage += `📦 Pack: ${pack.name} (${pack.classCount} classes)\n\n`;
                      }
                      successMessage += `Share code "${inviteCode}" with ${newMember.fullName} to download the LifeSet app and join.`;
                      
                      alert(successMessage);
                      if ((parseFloat(newMember.paymentAmount) > 0 || newMember.membershipTierId || newMember.packId) && confirm("Print receipt?")) {
                        const desc = tier ? tier.name : pack ? `${pack.name} (${pack.classCount} classes)` : "Membership/Pack";
                        printReceipt({
                          memberName: newMember.fullName,
                          item: desc,
                          amount: parseFloat(newMember.paymentAmount) || (tier?.price ?? pack?.price),
                          method: newMember.paymentMethod || "Manual",
                        });
                      }
                      
                      // Reset form and close modal
                      setNewMember({
                        fullName: "",
                        email: "",
                        phone: "",
                        address: "",
                        dateOfBirth: "",
                        emergencyContactName: "",
                        emergencyContactPhone: "",
                        notes: "",
                        membershipTierId: "",
                        packId: "",
                        membershipStartDate: new Date().toISOString().split('T')[0],
                        paymentAmount: "",
                        paymentMethod: "",
                        paymentReference: "",
                      });
                      setShowCreateMemberModal(false);
                    } catch (error) {
                      console.error("Error creating member:", error);
                      alert("Failed to create member: " + (error as any).message);
                    } finally {
                      setCreatingMember(false);
                    }
                  }}
                  disabled={creatingMember || !newMember.fullName || !newMember.email || (!newMember.membershipTierId && !newMember.packId)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingMember ? "Creating..." : "Create Member & Invite Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden bg-lifeset-primary-light flex items-center justify-center">
                  {selectedMember.profilePictureUrl ? (
                    <img
                      src={selectedMember.profilePictureUrl}
                      alt=""
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <span className="text-xl text-lifeset-primary font-medium">
                      {selectedMember.username?.charAt(0).toUpperCase() || selectedMember.email?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Member Details: {selectedMember.fullName || selectedMember.username || selectedMember.email}
                </h3>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={selectedMember.fullName || ""}
                      onChange={async (e) => {
                        if (currentUserRole === "coach") return;
                        try {
                          await updateDoc(doc(db, "users", selectedMember.uid), {
                            fullName: e.target.value,
                            updatedAt: Timestamp.now(),
                          });
                          setSelectedMember({ ...selectedMember, fullName: e.target.value });
                          await loadMembers();
                        } catch (error) {
                          console.error("Error updating name:", error);
                        }
                      }}
                      disabled={currentUserRole === "coach"}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={selectedMember.email || ""}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border-2 border-gray-500 rounded-md shadow-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={selectedMember.phone || ""}
                      onChange={async (e) => {
                        if (currentUserRole === "coach") return;
                        try {
                          await updateDoc(doc(db, "users", selectedMember.uid), {
                            phone: e.target.value,
                            updatedAt: Timestamp.now(),
                          });
                          setSelectedMember({ ...selectedMember, phone: e.target.value });
                          await loadMembers();
                        } catch (error) {
                          console.error("Error updating phone:", error);
                        }
                      }}
                      disabled={currentUserRole === "coach"}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={selectedMember.dateOfBirth || ""}
                      onChange={async (e) => {
                        if (currentUserRole === "coach") return;
                        try {
                          await updateDoc(doc(db, "users", selectedMember.uid), {
                            dateOfBirth: e.target.value,
                            updatedAt: Timestamp.now(),
                          });
                          setSelectedMember({ ...selectedMember, dateOfBirth: e.target.value });
                          await loadMembers();
                        } catch (error) {
                          console.error("Error updating DOB:", error);
                        }
                      }}
                      disabled={currentUserRole === "coach"}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={selectedMember.address || ""}
                    onChange={async (e) => {
                      if (currentUserRole === "coach") return;
                      try {
                        await updateDoc(doc(db, "users", selectedMember.uid), {
                          address: e.target.value,
                          updatedAt: Timestamp.now(),
                        });
                        setSelectedMember({ ...selectedMember, address: e.target.value });
                        await loadMembers();
                      } catch (error) {
                        console.error("Error updating address:", error);
                      }
                    }}
                    disabled={currentUserRole === "coach"}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={selectedMember.emergencyContactName || ""}
                      onChange={async (e) => {
                        if (currentUserRole === "coach") return;
                        try {
                          await updateDoc(doc(db, "users", selectedMember.uid), {
                            emergencyContactName: e.target.value,
                            updatedAt: Timestamp.now(),
                          });
                          setSelectedMember({ ...selectedMember, emergencyContactName: e.target.value });
                          await loadMembers();
                        } catch (error) {
                          console.error("Error updating emergency contact:", error);
                        }
                      }}
                      disabled={currentUserRole === "coach"}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={selectedMember.emergencyContactPhone || ""}
                      onChange={async (e) => {
                        if (currentUserRole === "coach") return;
                        try {
                          await updateDoc(doc(db, "users", selectedMember.uid), {
                            emergencyContactPhone: e.target.value,
                            updatedAt: Timestamp.now(),
                          });
                          setSelectedMember({ ...selectedMember, emergencyContactPhone: e.target.value });
                          await loadMembers();
                        } catch (error) {
                          console.error("Error updating emergency phone:", error);
                        }
                      }}
                      disabled={currentUserRole === "coach"}
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={selectedMember.notes || ""}
                    onChange={async (e) => {
                      if (currentUserRole === "coach") return;
                      try {
                        await updateDoc(doc(db, "users", selectedMember.uid), {
                          notes: e.target.value,
                          updatedAt: Timestamp.now(),
                        });
                        setSelectedMember({ ...selectedMember, notes: e.target.value });
                        await loadMembers();
                      } catch (error) {
                        console.error("Error updating notes:", error);
                      }
                    }}
                    disabled={currentUserRole === "coach"}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-lifeset-primary focus:border-lifeset-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowMemberDetailModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
