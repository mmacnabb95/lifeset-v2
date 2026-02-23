import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { logOut } from "src/services/firebase/auth";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useSubscription, restorePurchases } from "src/hooks/useSubscription";
import { NotificationSettings } from "src/components/NotificationSettings";
import { deleteAccount } from "src/services/firebase/account-deletion";
import { useMode } from "src/hooks/useMode";
import { useBranding } from "src/hooks/useBranding";

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, userId } = useFirebaseUser();
  const { isSubscribed, isInTrial, expirationDate, loading: subLoading } = useSubscription();
  const { organisation, isConsumerMode, loading: modeLoading } = useMode();
  const { primaryColor, isBranded } = useBranding();
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
              console.log('User logged out successfully');
              // Navigate to Welcome screen immediately
              // The auth listener will also clear Redux state
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
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

  const getSubscriptionReminder = () => {
    if (Platform.OS === 'android') {
      return 'If you have an active subscription, cancel it in Google Play (Play Store > Payments & subscriptions > Subscriptions).';
    }
    return 'If you have an active subscription, cancel it in your device settings (Settings > Apple ID > Subscriptions).';
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to permanently delete your account? This action cannot be undone and will delete:\n\n• All your habits and progress\n• All journal entries\n• All workout plans and records\n• All your data\n\n⚠️ IMPORTANT: ${getSubscriptionReminder()}\n\nThis will permanently remove your account and all associated data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              `This is your last chance to cancel. Your account and all data will be permanently deleted. This cannot be undone.\n\nRemember: ${getSubscriptionReminder()}`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    if (!userId) {
                      Alert.alert('Error', 'Unable to identify your account');
                      return;
                    }

                    try {
                      setDeleting(true);
                      await deleteAccount(userId);
                      
                      // Navigate to welcome screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                      
                      Alert.alert(
                        'Account Deleted',
                        'Your account and all data have been permanently deleted.\n\nIf you had an active subscription, please cancel it in your device settings (Settings > Apple ID > Subscriptions) to avoid future charges.',
                        [{ text: 'OK' }]
                      );
                    } catch (error: any) {
                      console.error('Delete account error:', error);
                      Alert.alert(
                        'Deletion Failed',
                        error.message || 'Failed to delete account. Please try again or contact support.',
                        [{ text: 'OK' }]
                      );
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
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
      <View style={[styles.header, isBranded && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}>
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

        {/* Organisation Section - Show for all users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organisation</Text>
          <View style={styles.card}>
            {modeLoading ? (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🏢 Loading...</Text>
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : isConsumerMode ? (
              // Show "Join Organisation" for Consumer Mode users
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('JoinOrganisation')}
              >
                <View>
                  <Text style={styles.settingLabel}>🏢 Join Organisation</Text>
                  <Text style={styles.settingSubtext}>Join a gym, studio, or corporate program</Text>
                </View>
                <Text style={styles.settingValue}>→</Text>
              </TouchableOpacity>
            ) : (
              // Show "My Organisation" for organisation users
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => navigation.navigate('MyOrganisation')}
              >
                <View style={styles.settingItemLeft}>
                  {organisation?.logoUrl ? (
                    <>
                      <Image
                        source={{ uri: organisation.logoUrl }}
                        style={styles.organisationSettingLogo}
                        resizeMode="contain"
                      />
                      <Text style={styles.settingLabel}>My Organisation</Text>
                    </>
                  ) : (
                    <Text style={styles.settingLabel}>🏢 My Organisation</Text>
                  )}
                </View>
                <Text style={styles.settingValue}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <NotificationSettings />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
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

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <Text style={[styles.settingLabel, styles.dangerText]}>
                🗑️ Delete Account
              </Text>
              {deleting && <ActivityIndicator size="small" color="#F44336" />}
              {!deleting && <Text style={[styles.settingValue, styles.dangerText]}>→</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          type={ButtonTypes.Primary}
          title="Logout"
          onPress={handleLogout}
          primaryColor={isBranded ? primaryColor : undefined}
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
  settingSubtext: {
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
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organisationSettingLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
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
  dangerItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  dangerText: {
    color: '#F44336',
  },
});
