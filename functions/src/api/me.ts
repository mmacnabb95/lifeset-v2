import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { getModeConfig } from "../services/mode-loader";
import { getContentPack } from "../services/content-packs";

export const me = onCall(async (request) => {
  try {
    // Verify authentication - onCall automatically provides auth context
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const userId = request.auth.uid;

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    
    // Support both old structure (organisationId) and new structure (organisations[])
    let organisations: string[] = userData?.organisations || [];
    let activeOrganisationId: string | null = userData?.activeOrganisationId || null;
    
    // Backward compatibility: if old structure exists, migrate it
    if (userData?.organisationId && !organisations.includes(userData.organisationId)) {
      organisations = [userData.organisationId];
      activeOrganisationId = userData.organisationId;
      // Update user document to new structure
      await db.collection("users").doc(userId).update({
        organisations: organisations,
        activeOrganisationId: activeOrganisationId
      });
    }

    // If no activeOrganisationId, try to find most recent membership
    if (!activeOrganisationId && organisations.length > 0) {
      // Find most recent active membership (including past_due with grace period)
      const now = new Date();
      const membershipsQuery = await db.collection("memberships")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10) // Get multiple to check status
        .get();
      
      // Filter for active or past_due with valid grace period
      let activeMembership = null;
      for (const doc of membershipsQuery.docs) {
        const membership = doc.data();
        if (membership.organisationId && organisations.includes(membership.organisationId)) {
          if (membership.status === "active") {
            activeMembership = membership;
            break;
          } else if (membership.status === "past_due" && membership.gracePeriodExpiresAt) {
            const graceExpiry = membership.gracePeriodExpiresAt.toDate ? membership.gracePeriodExpiresAt.toDate() : new Date(membership.gracePeriodExpiresAt);
            if (graceExpiry > now) {
              // Still in grace period
              activeMembership = membership;
              break;
            } else {
              // Grace period expired - mark membership as expired
              await doc.ref.update({
                status: "expired",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              // Don't use this membership, continue to next
              continue;
            }
          }
        }
      }
      
      if (activeMembership) {
        activeOrganisationId = activeMembership.organisationId;
        // Update user document
        await db.collection("users").doc(userId).update({
          activeOrganisationId: activeOrganisationId
        });
      }
      
      if (!membershipsQuery.empty) {
        const membership = membershipsQuery.docs[0].data();
        if (membership.organisationId && organisations.includes(membership.organisationId)) {
          activeOrganisationId = membership.organisationId;
          // Update user document
          await db.collection("users").doc(userId).update({
            activeOrganisationId: activeOrganisationId
          });
        }
      }
      
      // If still no active org, use first in array
      if (!activeOrganisationId) {
        activeOrganisationId = organisations[0];
        await db.collection("users").doc(userId).update({
          activeOrganisationId: activeOrganisationId
        });
      }
    }

    // Check if user is in grace period (admin-initiated removal)
    const gracePeriodExpiresAt = userData?.gracePeriodExpiresAt;
    const removalType = userData?.removalType;
    
    if (activeOrganisationId && gracePeriodExpiresAt && removalType === "admin") {
      const now = new Date();
      const expiresAt = gracePeriodExpiresAt.toDate ? gracePeriodExpiresAt.toDate() : new Date(gracePeriodExpiresAt);
      
      // If grace period has expired, remove organisation from array
      if (now >= expiresAt) {
        const updatedOrganisations = organisations.filter(orgId => orgId !== activeOrganisationId);
        const newActiveOrgId = updatedOrganisations.length > 0 ? updatedOrganisations[0] : null;
        
        await db.collection("users").doc(userId).update({
          organisations: updatedOrganisations,
          activeOrganisationId: newActiveOrgId,
          role: newActiveOrgId ? userData?.role : null,
          removedAt: null,
          gracePeriodExpiresAt: null,
          removalType: null
        });
        
        activeOrganisationId = newActiveOrgId;
        organisations = updatedOrganisations;
      }
    }

    // If no activeOrganisationId → Consumer Mode
    if (!activeOrganisationId) {
      const consumerModeConfig = getModeConfig("consumer");
      const consumerContentPack = await getContentPack("consumerPack");

      return {
        mode: "consumer",
        user: {
          uid: userId,
          email: userData?.email || "",
          username: userData?.username || "",
          organisationId: null,
          role: null
        },
        organisation: null,
        modeConfig: consumerModeConfig,
        contentPack: consumerContentPack,
        navigation: consumerModeConfig.navigation
      };
    }

    // Get active organisation
    const orgDoc = await db.collection("organisations").doc(activeOrganisationId).get();
    if (!orgDoc.exists) {
      // Organisation deleted but user still linked → remove from array
      const updatedOrganisations = organisations.filter(orgId => orgId !== activeOrganisationId);
      const newActiveOrgId = updatedOrganisations.length > 0 ? updatedOrganisations[0] : null;
      
      await db.collection("users").doc(userId).update({
        organisations: updatedOrganisations,
        activeOrganisationId: newActiveOrgId,
        role: newActiveOrgId ? userData?.role : null
      });

      // If no organisations left, return consumer mode
      if (!newActiveOrgId) {
        const consumerModeConfig = getModeConfig("consumer");
        const consumerContentPack = await getContentPack("consumerPack");

        return {
          mode: "consumer",
          user: {
            uid: userId,
            email: userData?.email || "",
            username: userData?.username || "",
            organisationId: null,
            role: null
          },
          organisation: null,
          modeConfig: consumerModeConfig,
          contentPack: consumerContentPack,
          navigation: consumerModeConfig.navigation
        };
      }
      
      // Try next organisation
      activeOrganisationId = newActiveOrgId;
      const nextOrgDoc = await db.collection("organisations").doc(activeOrganisationId).get();
      if (!nextOrgDoc.exists) {
        // All organisations invalid, return consumer mode
        const consumerModeConfig = getModeConfig("consumer");
        const consumerContentPack = await getContentPack("consumerPack");
        return {
          mode: "consumer",
          user: {
            uid: userId,
            email: userData?.email || "",
            username: userData?.username || "",
            organisationId: null,
            role: null
          },
          organisation: null,
          modeConfig: consumerModeConfig,
          contentPack: consumerContentPack,
          navigation: consumerModeConfig.navigation
        };
      }
    }

    const organisation = orgDoc.data();
    const modeConfig = getModeConfig(organisation?.type || "consumer");
    const contentPack = await getContentPack(organisation?.contentPack || "consumerPack");

    return {
      mode: organisation?.type || "consumer",
      user: {
        uid: userId,
        email: userData?.email || "",
        username: userData?.username || "",
        organisationId: activeOrganisationId, // Return active org for backward compatibility
        role: userData?.role || "member"
      },
      organisation: {
        organisationId: activeOrganisationId,
        name: organisation?.name || "",
        type: organisation?.type || "gym",
        logoUrl: organisation?.logoUrl || organisation?.landingPage?.logoUrl,
        brandColours: organisation?.brandColours || { primary: "#000000", secondary: "#FFFFFF" },
        featureFlags: organisation?.featureFlags || {}
      },
      modeConfig,
      contentPack,
      navigation: modeConfig.navigation,
      // Include all organisations for multi-org support
      allOrganisations: organisations
    };
  } catch (error: any) {
    console.error("Error in /me:", error);
    throw new Error(error.message || "Internal server error");
  }
});

