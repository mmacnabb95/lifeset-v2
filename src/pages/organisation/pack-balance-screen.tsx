import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "src/services/firebase/config";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useMode } from "src/hooks/useMode";
import { getOrganisation, Organisation } from "src/services/firebase/organisation";

interface PackPurchase {
  purchaseId: string;
  packId: string;
  packName?: string;
  classesRemaining: number;
  expiresAt: Date;
  purchasedAt: Date;
  status: "active" | "expired" | "used";
}

export const PackBalanceScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation: modeOrganisation, isConsumerMode, loading: modeLoading } = useMode();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [packs, setPacks] = useState<PackPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasDirectOrganisation, setHasDirectOrganisation] = useState(false);

  useEffect(() => {
    // If useMode loaded successfully, use that data
    if (!modeLoading && modeOrganisation) {
      setOrganisation(modeOrganisation);
      loadPacksWithOrganisation(modeOrganisation);
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
      console.log("PackBalanceScreen: Checking Firestore directly for organisation...");
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
          console.log("PackBalanceScreen: Found organisation:", {
            organisationId,
            organisations: userData?.organisations,
            activeOrganisationId: userData?.activeOrganisationId
          });
          setHasDirectOrganisation(true);
          const orgData = await getOrganisation(organisationId);
          if (orgData) {
            console.log("PackBalanceScreen: Loaded organisation:", orgData.name);
            setOrganisation(orgData);
            // Pass orgData directly to avoid state timing issues
            loadPacksWithOrganisation(orgData);
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

  const loadPacks = async () => {
    const orgToUse = organisation || modeOrganisation;
    if (!userId || !orgToUse) {
      console.log("PackBalanceScreen: Cannot load packs - missing userId or organisation");
      return;
    }
    loadPacksWithOrganisation(orgToUse);
  };

  const loadPacksWithOrganisation = async (orgData: Organisation) => {
    if (!userId || !orgData) {
      console.log("PackBalanceScreen: Cannot load packs - missing userId or organisation");
      return;
    }

    console.log("PackBalanceScreen: Loading packs for user:", userId, "organisation:", orgData.organisationId);
    try {
      setLoading(true);
      const now = Timestamp.now();

      // Get active pack purchases
      const packsQuery = query(
        collection(db, "packPurchases"),
        where("userId", "==", userId),
        where("organisationId", "==", orgData.organisationId),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(packsQuery);
      
      const packsList: PackPurchase[] = [];
      
      for (const packDoc of snapshot.docs) {
        const data = packDoc.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        
        // Only include packs that haven't expired
        if (expiresAt >= new Date()) {
          // Get pack name
          let packName = "Class Pack";
          if (data.packId) {
            try {
              const packInfoDoc = await getDoc(doc(db, "packs", data.packId));
              if (packInfoDoc.exists()) {
                packName = packInfoDoc.data().name || "Class Pack";
              }
            } catch (error) {
              console.error("Error loading pack info:", error);
            }
          }

          packsList.push({
            purchaseId: packDoc.id,
            packId: data.packId || "",
            packName,
            classesRemaining: data.classesRemaining || 0,
            expiresAt,
            purchasedAt: data.purchasedAt?.toDate ? data.purchasedAt.toDate() : new Date(data.purchasedAt),
            status: data.status || "active",
          });
        }
      }

      // Sort by expiry date (soonest first)
      packsList.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

      console.log("PackBalanceScreen: Loaded", packsList.length, "active packs");
      setPacks(packsList);
    } catch (error) {
      console.error("Error loading packs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPacks();
  };

  // Show loading while checking mode
  if (modeLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Packs</Text>
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
          <Text style={styles.headerTitle}>Class Packs</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Organisation</Text>
          <Text style={styles.emptyText}>
            Class pack balance is only available for organisation members.
          </Text>
        </View>
      </View>
    );
  }

  const totalClassesRemaining = packs.reduce((sum, pack) => sum + pack.classesRemaining, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Packs</Text>
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
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Classes Remaining</Text>
              <Text style={styles.summaryValue}>{totalClassesRemaining}</Text>
              <Text style={styles.summarySubtext}>{packs.length} active pack{packs.length !== 1 ? 's' : ''}</Text>
            </View>

            {/* Pack List */}
            {packs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Active Packs</Text>
                <Text style={styles.emptyText}>
                  You don't have any active class packs. Contact your organisation to purchase a pack.
                </Text>
              </View>
            ) : (
              packs.map((pack) => (
                <View key={pack.purchaseId} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Text style={styles.packName}>{pack.packName}</Text>
                    <View style={[styles.statusBadge, pack.classesRemaining > 0 ? styles.statusActive : styles.statusUsed]}>
                      <Text style={styles.statusText}>
                        {pack.classesRemaining > 0 ? "ACTIVE" : "USED"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.packDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Classes Remaining</Text>
                      <Text style={[styles.detailValue, pack.classesRemaining === 0 && styles.zeroClasses]}>
                        {pack.classesRemaining}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Expires</Text>
                      <Text style={[styles.detailValue, pack.expiresAt < new Date() && styles.expiredText]}>
                        {pack.expiresAt.toLocaleDateString()}
                      </Text>
                    </View>

                    {pack.expiresAt >= new Date() && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Days Remaining</Text>
                        <Text style={styles.detailValue}>
                          {Math.ceil((pack.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchased</Text>
                      <Text style={styles.detailValue}>{pack.purchasedAt.toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 This is a read-only view of your class pack balance. To purchase more classes, please contact your organisation or visit their website.
              </Text>
            </View>
          </>
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
  summaryCard: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 8,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: "#e0e7ff",
  },
  packCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  packHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusUsed: {
    backgroundColor: "#e5e7eb",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  packDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  zeroClasses: {
    color: "#dc2626",
  },
  expiredText: {
    color: "#dc2626",
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

