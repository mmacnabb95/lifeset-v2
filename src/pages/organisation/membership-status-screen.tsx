import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "src/services/firebase/config";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useMode } from "src/hooks/useMode";
import { getOrganisation, Organisation } from "src/services/firebase/organisation";

interface Membership {
  membershipId: string;
  membershipTierId?: string;
  membershipTierName?: string;
  status: "active" | "expired" | "cancelled" | "past_due";
  startsAt: Date;
  expiresAt: Date;
  createdAt?: Date;
  inviteCode?: string;
}

export const MembershipStatusScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation: modeOrganisation, isConsumerMode, loading: modeLoading } = useMode();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasDirectOrganisation, setHasDirectOrganisation] = useState(false);

  useEffect(() => {
    // If useMode loaded successfully, use that data
    if (!modeLoading && modeOrganisation) {
      setOrganisation(modeOrganisation);
      loadMembershipWithOrganisation(modeOrganisation);
    } else if (!modeLoading && isConsumerMode) {
      // If useMode says consumer mode, check Firestore directly as fallback
      checkDirectOrganisation();
    }
  }, [userId, modeOrganisation, modeLoading, isConsumerMode]);

  // Fallback: Check Firestore directly if useMode fails
  const checkDirectOrganisation = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log("MembershipStatusScreen: Checking Firestore directly for organisation...");
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Check for organisations array (new multi-org support) or legacy organisationId
        const hasOrgArray = userData?.organisations && Array.isArray(userData.organisations) && userData.organisations.length > 0;
        const activeOrgId = userData?.activeOrganisationId;
        const legacyOrgId = userData?.organisationId; // Backwards compatibility
        
        // Use activeOrganisationId if available, otherwise use first in array, otherwise use legacy
        const organisationId = activeOrgId || (hasOrgArray ? userData.organisations[0] : null) || legacyOrgId;
        
        if (organisationId) {
          console.log("MembershipStatusScreen: Found organisation:", {
            organisationId,
            organisations: userData?.organisations,
            activeOrganisationId: userData?.activeOrganisationId
          });
          setHasDirectOrganisation(true);
          const orgData = await getOrganisation(organisationId);
          if (orgData) {
            console.log("MembershipStatusScreen: Loaded organisation:", orgData.name);
            setOrganisation(orgData);
            // Pass orgData directly to avoid state timing issues
            loadMembershipWithOrganisation(orgData);
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error checking direct organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembership = async () => {
    const orgToUse = organisation || modeOrganisation;
    if (!userId || !orgToUse) {
      console.log("MembershipStatusScreen: Cannot load membership - missing userId or organisation");
      return;
    }
    loadMembershipWithOrganisation(orgToUse);
  };

  const loadMembershipWithOrganisation = async (orgData: Organisation) => {
    if (!userId || !orgData) {
      console.log("MembershipStatusScreen: Cannot load membership - missing userId or organisation");
      return;
    }

    console.log("MembershipStatusScreen: Loading membership for user:", userId, "organisation:", orgData.organisationId);
    try {
      setLoading(true);
      const now = Timestamp.now();

      // Get active membership
      const membershipsQuery = query(
        collection(db, "memberships"),
        where("userId", "==", userId),
        where("organisationId", "==", orgData.organisationId),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(membershipsQuery);
      
      if (!snapshot.empty) {
        // Get the first active membership
        const membershipDoc = snapshot.docs[0];
        const data = membershipDoc.data();

        // Get membership tier name if tierId exists
        let tierName = "Membership";
        if (data.membershipTierId) {
          try {
            const tierDoc = await getDoc(doc(db, "memberships", data.membershipTierId));
            if (tierDoc.exists()) {
              tierName = tierDoc.data().name || "Membership";
            }
          } catch (error) {
            console.error("Error loading tier:", error);
          }
        }

        const membershipData: Membership = {
          membershipId: membershipDoc.id,
          membershipTierId: data.membershipTierId || undefined,
          membershipTierName: tierName,
          status: data.status || "active",
          startsAt: data.startsAt?.toDate ? data.startsAt.toDate() : new Date(data.startsAt),
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
          inviteCode: data.inviteCode || undefined,
        };

        console.log("MembershipStatusScreen: Found active membership:", membershipData.membershipTierName);
        setMembership(membershipData);
      } else {
        console.log("MembershipStatusScreen: No active membership found");
        setMembership(null);
      }
    } catch (error) {
      console.error("Error loading membership:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembership();
  };

  // Show loading while checking mode
  if (modeLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </View>
    );
  }

  // Show message if user is in consumer mode AND we don't have direct organisation data
  if ((isConsumerMode && !hasDirectOrganisation) || (!organisation && !modeOrganisation && !hasDirectOrganisation)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Organisation</Text>
          <Text style={styles.emptyText}>
            Membership status is only available for organisation members.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : membership ? (
          <View style={styles.membershipContainer}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, styles[`status${membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}` as keyof typeof styles] || styles.statusActive]}>
              <Text style={styles.statusText}>{membership.status.toUpperCase()}</Text>
            </View>

            {/* Membership Tier */}
            <View style={styles.section}>
              <Text style={styles.label}>Membership Tier</Text>
              <Text style={styles.value}>{membership.membershipTierName || "Standard Membership"}</Text>
            </View>

            {/* Start Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Started</Text>
              <Text style={styles.value}>{membership.startsAt.toLocaleDateString()}</Text>
            </View>

            {/* Expiry Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Expires</Text>
              <Text style={[styles.value, membership.expiresAt < new Date() && styles.expiredText]}>
                {membership.expiresAt.toLocaleDateString()}
              </Text>
              {membership.expiresAt < new Date() && (
                <Text style={styles.expiredNote}>This membership has expired</Text>
              )}
            </View>

            {/* Days Remaining */}
            {membership.expiresAt >= new Date() && (
              <View style={styles.section}>
                <Text style={styles.label}>Days Remaining</Text>
                <Text style={styles.value}>
                  {Math.ceil((membership.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </Text>
              </View>
            )}

            {/* Member Code / Invite Code */}
            {membership.inviteCode && (
              <View style={styles.section}>
                <Text style={styles.label}>Member Code</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{membership.inviteCode}</Text>
                </View>
                <Text style={styles.codeNote}>Your unique member code</Text>
              </View>
            )}

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 This is a read-only view of your membership status. To purchase or renew a membership, please contact your organisation or visit their website.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Active Membership</Text>
            <Text style={styles.emptyText}>
              You don't have an active membership. Contact your organisation to purchase a membership.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  membershipContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusExpired: {
    backgroundColor: "#fee2e2",
  },
  statusCancelled: {
    backgroundColor: "#e5e7eb",
  },
  statusPast_due: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "600",
  },
  expiredText: {
    color: "#dc2626",
  },
  expiredNote: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  codeContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#6366f1",
    borderStyle: "dashed",
    marginTop: 4,
  },
  codeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366f1",
    letterSpacing: 4,
    textAlign: "center",
    fontFamily: "monospace",
  },
  codeNote: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  infoBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

