import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { logOut } from "src/services/firebase/auth";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useSubscription, restorePurchases } from "src/hooks/useSubscription";

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, userId } = useFirebaseUser();
  const { isSubscribed, isInTrial, expirationDate, loading: subLoading } = useSubscription();
  const [restoring, setRestoring] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
              console.log('User logged out');
              // Navigation will automatically redirect to login via auth listener
            } catch (err: any) {
              console.error('Logout error:', err);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!');
      } else {
        Alert.alert('No Purchases', 'No active subscription found to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (subLoading) return 'Loading...';
    if (!isSubscribed) return 'Free (7-Day Trial Available)';
    if (isInTrial) return '7-Day Free Trial';
    return 'Premium';
  };

  const getSubscriptionDetails = () => {
    if (subLoading) return '';
    if (!isSubscribed) return 'Tap to start your free trial';
    if (expirationDate) {
      return `Renews ${expirationDate.toLocaleDateString()}`;
    }
    return 'Active';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.profileInfo}
              onPress={() => navigation.navigate('PersonalDetails')}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profileId}>ID: {userId?.substring(0, 8)}...</Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => !isSubscribed && navigation.navigate('Paywall')}
            >
              <View>
                <Text style={styles.settingLabel}>💎 {getSubscriptionStatus()}</Text>
                <Text style={styles.subscriptionDetail}>{getSubscriptionDetails()}</Text>
              </View>
              {!isSubscribed && <Text style={styles.settingValue}>→</Text>}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleRestorePurchases}
              disabled={restoring}
            >
              <Text style={styles.settingLabel}>♻️ Restore Purchases</Text>
              {restoring && <ActivityIndicator size="small" color="#667eea" />}
              {!restoring && <Text style={styles.settingValue}>→</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>🔔 Notifications</Text>
              <Text style={styles.settingValue}>Coming Soon</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>🌍 Language</Text>
              <Text style={styles.settingValue}>English</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>💾 Export Data</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Text style={styles.settingLabel}>🔐 Privacy Policy</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              <Text style={styles.settingLabel}>📜 Terms of Service</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          type={ButtonTypes.Primary}
          title="Logout"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by LifeSet Team
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 12,
    color: '#999',
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
  subscriptionDetail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});
