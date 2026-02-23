// Organisation Service - Handles organisation-related operations
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./config";

export interface Organisation {
  organisationId: string;
  type: "gym" | "yoga" | "pilates" | "hiit" | "sauna" | "company";
  name: string;
  logoUrl?: string;
  brandColours: {
    primary: string;
    secondary: string;
  };
  featureFlags: {
    bookings: boolean;
    memberships: boolean;
    packs: boolean;
    qrCheckIn: boolean;
    habits: boolean;
    challenges: boolean;
    journaling: boolean;
    nutrition: boolean;
    workouts: boolean;
    analytics: boolean;
  };
  contentPack: string;
  stripeAccountId?: string;
  goCardlessAccountId?: string;
  /** Opening times (free-form text, e.g. "Mon-Fri: 9am-9pm, Sat: 9am-5pm, Sun: Closed") */
  openingTimes?: string;
  /** Announcements shown to members (set by admin) */
  announcements?: string[];
}

/**
 * Get organisation by ID
 */
export const getOrganisation = async (organisationId: string): Promise<Organisation | null> => {
  try {
    const orgDoc = await getDoc(doc(db, "organisations", organisationId));
    
    if (orgDoc.exists()) {
      return { organisationId, ...orgDoc.data() } as Organisation;
    }
    
    return null;
  } catch (error) {
    console.error("Get organisation error:", error);
    throw new Error("Failed to get organisation");
  }
};

/**
 * Join organisation by code
 */
export const joinOrganisationByCode = async (userId: string, code: string): Promise<Organisation | null> => {
  try {
    // Find organisation by invite code
    const invitesRef = collection(db, "organisationInvites");
    const q = query(invitesRef, where("code", "==", code), where("active", "==", true));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid organisation code");
    }

    const inviteDoc = querySnapshot.docs[0];
    const inviteData = inviteDoc.data();
    const organisationId = inviteData.organisationId;

    // Get organisation
    const organisation = await getOrganisation(organisationId);
    if (!organisation) {
      throw new Error("Organisation not found");
    }

    // Check for pending member linked to this invite code (bidirectional link)
    let crmData: any = {};
    if (inviteData.pendingMemberId) {
      try {
        const pendingMemberDoc = await getDoc(doc(db, "pendingMembers", inviteData.pendingMemberId));
        
        if (pendingMemberDoc.exists()) {
          const pendingData = pendingMemberDoc.data();
          
          // Verify this pending member belongs to the same organisation
          if (pendingData.organisationId === organisationId) {
            // Merge CRM fields from pending member
            crmData = {
              fullName: pendingData.fullName || null,
              phone: pendingData.phone || null,
              address: pendingData.address || null,
              dateOfBirth: pendingData.dateOfBirth || null,
              emergencyContactName: pendingData.emergencyContactName || null,
              emergencyContactPhone: pendingData.emergencyContactPhone || null,
              notes: pendingData.notes || null,
            };
            
            // Delete pending member document (they're now active)
            await deleteDoc(pendingMemberDoc.ref);
            console.log(`Merged CRM data from pending member (linked via invite code) and deleted pending record`);
          } else {
            console.warn(`Pending member ${inviteData.pendingMemberId} belongs to different organisation`);
          }
        }
      } catch (error) {
        console.error("Error loading pending member:", error);
        // Continue without CRM data if pending member not found
      }
    } else {
      // Fallback: try email matching for backwards compatibility with old invite codes
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      const userEmail = userData?.email;

      if (userEmail && inviteData.email) {
        const pendingMembersQuery = query(
          collection(db, "pendingMembers"),
          where("email", "==", userEmail),
          where("organisationId", "==", organisationId)
        );
        const pendingMembersSnapshot = await getDocs(pendingMembersQuery);
        
        if (!pendingMembersSnapshot.empty) {
          const pendingMemberDoc = pendingMembersSnapshot.docs[0];
          const pendingData = pendingMemberDoc.data();
          
          // Merge CRM fields from pending member
          crmData = {
            fullName: pendingData.fullName || null,
            phone: pendingData.phone || null,
            address: pendingData.address || null,
            dateOfBirth: pendingData.dateOfBirth || null,
            emergencyContactName: pendingData.emergencyContactName || null,
            emergencyContactPhone: pendingData.emergencyContactPhone || null,
            notes: pendingData.notes || null,
          };
          
          // Delete pending member document (they're now active)
          await deleteDoc(pendingMemberDoc.ref);
          console.log(`Merged CRM data from pending member (email match fallback) and deleted pending record`);
        }
      }
    }

    // Update user with organisation and CRM data
    // Support multi-organisation: add to organisations array
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const existingOrganisations = userData?.organisations || [];
    
    // Add organisation to array if not already present
    let updatedOrganisations = existingOrganisations;
    if (!existingOrganisations.includes(organisationId)) {
      updatedOrganisations = [...existingOrganisations, organisationId];
    }

    // Set activeOrganisationId if user has none, or use most recent membership
    let activeOrganisationId = userData?.activeOrganisationId;
    if (!activeOrganisationId) {
      activeOrganisationId = organisationId;
    } else {
      // Check if there's a more recent membership for this org
      const membershipsQuery = query(
        collection(db, "memberships"),
        where("userId", "==", userId),
        where("organisationId", "==", organisationId),
        where("status", "==", "active")
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      if (!membershipsSnapshot.empty) {
        // Use this organisation as active (most recent)
        activeOrganisationId = organisationId;
      }
    }

    console.log(`Joining user ${userId} to organisation ${organisationId} with role ${inviteData.role || "member"}`);
    await updateDoc(doc(db, "users", userId), {
      organisations: updatedOrganisations,
      activeOrganisationId,
      organisationId: organisationId, // Legacy field for backwards compatibility
      role: inviteData.role || "member", // Role in active organisation
      ...crmData, // Merge CRM fields
      updatedAt: serverTimestamp()
    });
    console.log(`Successfully updated user ${userId} with organisations: ${updatedOrganisations.join(", ")}`);

    // Auto-assign membership or pack (required - members must have active access when joining)
    // This links the payment they made at the gym to their app access
    if (!inviteData.membershipTierId && !inviteData.packId) {
      throw new Error("This invite code is invalid - no membership or pack assigned. Please contact your organisation.");
    }

    if (inviteData.membershipTierId) {
      // Get membership tier details
      console.log(`Reading membership tier: ${inviteData.membershipTierId}`);
      const tierDoc = await getDoc(doc(db, "memberships", inviteData.membershipTierId));
      if (tierDoc.exists()) {
        const tierData = tierDoc.data();
        console.log(`Membership tier found: ${tierData.name}`);
        const startDate = inviteData.startDate 
          ? new Date(inviteData.startDate) 
          : new Date();
        const expiresAt = new Date(startDate);
        expiresAt.setDate(expiresAt.getDate() + (tierData.duration || 30));

        // Check if there's a pending membership from Stripe payment
        const pendingMembershipsQuery = query(
          collection(db, "memberships"),
          where("pendingMemberId", "==", inviteData.pendingMemberId),
          where("status", "==", "pending_activation")
        );
        const pendingMembershipsSnapshot = await getDocs(pendingMembershipsQuery);

        if (!pendingMembershipsSnapshot.empty && inviteData.pendingMemberId) {
          // Activate existing membership from Stripe payment
          const pendingMembershipDoc = pendingMembershipsSnapshot.docs[0];
          await updateDoc(pendingMembershipDoc.ref, {
            userId,
            status: "active",
            inviteCode: code,
          });
          console.log(`Activated pending membership ${pendingMembershipDoc.id} from Stripe payment`);
        } else {
          // Create new membership (manual invite)
          console.log(`Creating membership for user ${userId}`);
          const membershipRef = await addDoc(collection(db, "memberships"), {
            userId,
            organisationId,
            membershipTierId: inviteData.membershipTierId,
            status: "active",
            startsAt: Timestamp.fromDate(startDate),
            expiresAt: Timestamp.fromDate(expiresAt),
            createdAt: serverTimestamp(),
            stripeSubscriptionId: null,
            stripeCustomerId: null,
            inviteCode: code, // Store the invite code used to join
          });
          console.log(`Membership created with ID: ${membershipRef.id}`);
          console.log(`Updating membership to set membershipId field`);
          await updateDoc(membershipRef, { membershipId: membershipRef.id });
          console.log("Auto-assigned membership from invite code");
        }
      } else {
        console.error(`Membership tier ${inviteData.membershipTierId} not found`);
        throw new Error("Membership tier not found");
      }
    } else if (inviteData.packId) {
      // Get pack details
      const packDoc = await getDoc(doc(db, "packs", inviteData.packId));
      if (packDoc.exists()) {
        const packData = packDoc.data();
        const purchaseDate = new Date();
        const expiresAt = new Date(purchaseDate);
        expiresAt.setDate(expiresAt.getDate() + (packData.validityDays || 90));

        // Check if there's a pending pack purchase from Stripe payment
        const pendingPacksQuery = query(
          collection(db, "packPurchases"),
          where("pendingMemberId", "==", inviteData.pendingMemberId),
          where("status", "==", "pending_activation")
        );
        const pendingPacksSnapshot = await getDocs(pendingPacksQuery);

        if (!pendingPacksSnapshot.empty && inviteData.pendingMemberId) {
          // Activate existing pack purchase from Stripe payment
          const pendingPackDoc = pendingPacksSnapshot.docs[0];
          await updateDoc(pendingPackDoc.ref, {
            userId,
            status: "active",
            inviteCode: code,
          });
          console.log(`Activated pending pack purchase ${pendingPackDoc.id} from Stripe payment`);
        } else {
          // Create new pack purchase (manual invite)
          const purchaseRef = await addDoc(collection(db, "packPurchases"), {
            userId,
            organisationId,
            packId: inviteData.packId,
            classesRemaining: packData.classCount || 0,
            expiresAt: Timestamp.fromDate(expiresAt),
            status: "active",
            purchasedAt: Timestamp.fromDate(purchaseDate),
            createdAt: serverTimestamp(),
            stripePaymentIntentId: null,
            inviteCode: code, // Store the invite code used to join
          });
          await updateDoc(purchaseRef, { purchaseId: purchaseRef.id });
          console.log("Auto-assigned pack from invite code");
        }
      }
    }

    // Mark Stripe invites as inactive (single-use), keep manual invites active (reusable)
    if (inviteData.reusable === false) {
      // Single-use invite (from Stripe)
      await updateDoc(inviteDoc.ref, { 
        active: false,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      console.log(`Marked single-use invite ${code} as inactive`);
    } else {
      // Reusable invite (manual) - keep active, just log usage
      await updateDoc(inviteDoc.ref, {
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      console.log(`Logged usage of reusable invite ${code}`);
    }

    return organisation;
  } catch (error) {
    console.error("Join organisation error:", error);
    throw error;
  }
};

/**
 * Leave organisation (user-initiated removal)
 * Immediately clears organisationId, role, mode - no grace period
 */
export const leaveOrganisation = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      organisationId: null,
      role: null,
      mode: null,
      removalType: "user",
      removedAt: serverTimestamp(),
      // Clear any existing grace period
      gracePeriodExpiresAt: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Leave organisation error:", error);
    throw new Error("Failed to leave organisation");
  }
};

/**
 * Check if user belongs to an organisation
 */
export const getUserOrganisation = async (userId: string): Promise<Organisation | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const organisationId = userData?.organisationId;

    if (!organisationId) {
      return null;
    }

    return await getOrganisation(organisationId);
  } catch (error) {
    console.error("Get user organisation error:", error);
    return null;
  }
};

