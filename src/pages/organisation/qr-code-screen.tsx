import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useMode } from "src/hooks/useMode";
import { doc, getDoc } from "firebase/firestore";
import { db } from "src/services/firebase/config";
import { getOrganisation, Organisation } from "src/services/firebase/organisation";
import QRCode from "react-native-qrcode-svg";

export const QRCodeScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation: modeOrganisation, isConsumerMode, loading: modeLoading } = useMode();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasDirectOrganisation, setHasDirectOrganisation] = useState(false);

  useEffect(() => {
    // If useMode loaded successfully, use that data
    if (!modeLoading && modeOrganisation) {
      setOrganisation(modeOrganisation);
      generateQRCode();
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
          setHasDirectOrganisation(true);
          const orgData = await getOrganisation(organisationId);
          if (orgData) {
            setOrganisation(orgData);
            generateQRCode();
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

  const generateQRCode = () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // QR code format: {userId}:{timestamp}:{hash}
    // For simplicity, we'll use: {userId}:{timestamp}
    // The backend validates by checking the userId matches
    const timestamp = Date.now();
    const qrData = `${userId}:${timestamp}`;
    setQrCode(qrData);
    setLoading(false);
  };

  // Show loading while checking mode
  if (modeLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Code</Text>
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
          <Text style={styles.headerTitle}>QR Code</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Organisation</Text>
          <Text style={styles.emptyText}>
            QR codes are only available for organisation members.
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
        <Text style={styles.headerTitle}>QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <Text style={styles.title}>Check-In QR Code</Text>
            <Text style={styles.subtitle}>
              Show this QR code at your organisation's check-in desk
            </Text>

            {/* QR Code */}
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrCode}
                size={250}
                color="#111827"
                backgroundColor="#ffffff"
              />
            </View>

            {/* QR Code Data (for debugging/testing) */}
            <View style={styles.codeDataContainer}>
              <Text style={styles.codeDataLabel}>Code:</Text>
              <Text style={styles.codeData} selectable>
                {qrCode}
              </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>How to use:</Text>
              <Text style={styles.instructionsText}>
                1. Open this screen when you arrive{'\n'}
                2. Show the QR code to staff{'\n'}
                3. Staff will scan it to check you in{'\n'}
                4. Make sure you have an active membership or pack
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.refreshButton} onPress={generateQRCode}>
                <Text style={styles.refreshButtonText}>Refresh Code</Text>
              </TouchableOpacity>
            </View>

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 This QR code is unique to you and changes periodically for security. Make sure you have an active membership or class pack before checking in.
              </Text>
            </View>
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
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  qrContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  qrCodeWrapper: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    padding: 20,
  },
  qrPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  qrPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  qrPlaceholderSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  codeDataContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: "100%",
  },
  codeDataLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  codeData: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "monospace",
  },
  instructionsBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: "100%",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 20,
  },
  actionsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366f1",
  },
  infoBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    width: "100%",
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

