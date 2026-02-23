import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, RefreshControl, Alert } from "react-native";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useMode } from "src/hooks/useMode";
import { getUserProfile, UserProfile } from "src/services/firebase/user";
import { getOrganisation, Organisation } from "src/services/firebase/organisation";
import { leaveOrganisation } from "src/services/firebase/organisation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "src/services/firebase/config";

interface QuickLink {
  id: string;
  title: string;
  icon: string;
  screen: string;
  enabled: boolean;
}

export const MyOrganisationScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation: modeOrganisation, isConsumerMode, loading: modeLoading } = useMode();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasDirectOrganisation, setHasDirectOrganisation] = useState(false);

  useEffect(() => {
    // If useMode loaded successfully, use that data
    if (!modeLoading && modeOrganisation) {
      loadData();
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
      console.log("MyOrganisationScreen: Checking Firestore directly for organisation...");
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
          console.log("MyOrganisationScreen: Found organisation in user doc:", {
            organisationId,
            organisations: userData?.organisations,
            activeOrganisationId: userData?.activeOrganisationId
          });
          setHasDirectOrganisation(true);
          // Load organisation data directly
          const orgData = await getOrganisation(organisationId);
          if (orgData) {
            setOrganisation(orgData);
            // Also load user profile
            const profileData = await getUserProfile(userId);
            setUserProfile(profileData);
          }
        } else {
          console.log("MyOrganisationScreen: No organisation found in user doc", {
            organisations: userData?.organisations,
            activeOrganisationId: userData?.activeOrganisationId,
            organisationId: userData?.organisationId
          });
          setHasDirectOrganisation(false);
        }
      }
    } catch (error) {
      console.error("Error checking direct organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!userId || !modeOrganisation?.organisationId) return;

    try {
      setLoading(true);
      const [orgData, profileData] = await Promise.all([
        getOrganisation(modeOrganisation.organisationId),
        getUserProfile(userId),
      ]);

      setOrganisation(orgData);
      setUserProfile(profileData);
    } catch (error) {
      console.error("Error loading organisation data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLeaveOrganisation = async () => {
    Alert.alert(
      "Leave Organisation",
      "Are you sure you want to leave this organisation? You will immediately lose access to all organisation features.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            if (!userId) return;
            try {
              await leaveOrganisation(userId);
              Alert.alert(
                "Left Organisation",
                "You have successfully left the organisation.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate back or refresh
                      navigation.goBack();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to leave organisation");
            }
          },
        },
      ]
    );
  };

  const getQuickLinks = (): QuickLink[] => {
    if (!organisation) return [];

    // Gym-type organisations that support bookings
    const gymTypes = ['gym', 'yoga', 'pilates', 'hiit', 'sauna'];
    const isGymType = gymTypes.includes(organisation.type);

    return [
      {
        id: "membership",
        title: "Membership Status",
        icon: "💳",
        screen: "MembershipStatus",
        enabled: true,
      },
      {
        id: "packs",
        title: "Class Packs",
        icon: "📦",
        screen: "PackBalance",
        enabled: true,
      },
      {
        id: "qr",
        title: "QR Code",
        icon: "📱",
        screen: "QRCode",
        enabled: true,
      },
      {
        id: "bookings",
        title: "Book Classes",
        icon: "📅",
        screen: "Bookings",
        enabled: isGymType, // Only for gym-type organisations
      },
    ].filter(link => link.enabled);
  };

  const getRoleDisplayName = (role?: string): string => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "staff":
        return "Staff Member";
      case "member":
        return "Member";
      case "employee":
        return "Employee";
      default:
        return "Member";
    }
  };

  const getTypeDisplayName = (type?: string): string => {
    switch (type) {
      case "gym":
        return "Gym";
      case "yoga":
        return "Yoga Studio";
      case "pilates":
        return "Pilates Studio";
      case "hiit":
        return "HIIT Studio";
      case "sauna":
        return "Sauna";
      case "company":
        return "Corporate";
      default:
        return "Organisation";
    }
  };

  // Show loading while checking mode
  if (modeLoading || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Organisation</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </View>
    );
  }

  // Show message if user is in consumer mode AND we don't have direct organisation data
  if ((isConsumerMode && !hasDirectOrganisation) || (!organisation && !hasDirectOrganisation)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Organisation</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Organisation</Text>
          <Text style={styles.emptyText}>
            You're not currently part of an organisation. Join one to access organisation features.
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate("JoinOrganisation")}
          >
            <Text style={styles.joinButtonText}>Join Organisation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const primaryColor = organisation.brandColours?.primary || "#6366f1";
  const secondaryColor = organisation.brandColours?.secondary || "#ffffff";
  const quickLinks = getQuickLinks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Organisation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Organisation Header Card */}
        <View style={[styles.orgHeaderCard, { backgroundColor: primaryColor }]}>
          {organisation.logoUrl ? (
            <Image
              source={{ uri: organisation.logoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: secondaryColor }]}>
              <Text style={[styles.logoPlaceholderText, { color: primaryColor }]}>
                {organisation.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={[styles.orgName, { color: secondaryColor }]}>
            {organisation.name}
          </Text>

          <View style={styles.orgMeta}>
            <View style={[styles.badge, { backgroundColor: secondaryColor + "40" }]}>
              <Text style={[styles.badgeText, { color: secondaryColor }]}>
                {getTypeDisplayName(organisation.type)}
              </Text>
            </View>
            {userProfile?.role && (
              <View style={[styles.badge, { backgroundColor: secondaryColor + "40" }]}>
                <Text style={[styles.badgeText, { color: secondaryColor }]}>
                  {getRoleDisplayName(userProfile.role)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Opening Times & Announcements */}
        {(organisation.openingTimes?.trim() || (organisation.announcements && organisation.announcements.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Info</Text>
            <View style={styles.infoCard}>
              {organisation.openingTimes?.trim() && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoBlockLabel}>🕐 Opening Times</Text>
                  <Text style={styles.infoBlockValue}>{organisation.openingTimes}</Text>
                </View>
              )}
              {organisation.announcements && organisation.announcements.filter((a) => a?.trim()).length > 0 && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoBlockLabel}>📢 Announcements</Text>
                  {organisation.announcements.slice().reverse().filter((a) => a?.trim()).map((ann, i) => (
                    <Text key={i} style={[styles.infoBlockValue, i > 0 && styles.announcementSpacing]}>
                      {ann}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={[styles.quickLinkCard, { borderColor: primaryColor + "30" }]}
                onPress={() => {
                  navigation.navigate(link.screen);
                }}
              >
                <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                <Text style={styles.quickLinkTitle}>{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Organisation Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{getTypeDisplayName(organisation.type)}</Text>
            </View>
            {userProfile?.role && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Your Role</Text>
                <Text style={styles.infoValue}>{getRoleDisplayName(userProfile.role)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organisation ID</Text>
              <Text style={[styles.infoValue, styles.orgId]} selectable>
                {organisation.organisationId.substring(0, 8)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Leave Organisation Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveOrganisation}
          >
            <Text style={styles.leaveButtonText}>Leave Organisation</Text>
          </TouchableOpacity>
          <Text style={styles.leaveButtonSubtext}>
            You will immediately lose access to all organisation features
          </Text>
        </View>
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
  orgHeaderCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    fontSize: 32,
    fontWeight: "700",
  },
  orgName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  orgMeta: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickLinkCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLinkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  comingSoon: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
    fontStyle: "italic",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  orgId: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  infoBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoBlockLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  infoBlockValue: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  announcementSpacing: {
    marginTop: 8,
  },
  featuresCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureTag: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureTagText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
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
  joinButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    minWidth: 200,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  leaveButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  leaveButtonSubtext: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
});

