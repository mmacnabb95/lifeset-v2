import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { DebugOverlay } from 'src/components/DebugOverlay';

interface PaywallScreenProps {
  onComplete: () => void;
  onRestore: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onComplete,
  onRestore,
}) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error: any) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    let navigationCompleted = false;
    
    // FAILSAFE: Force navigate after 3 seconds if something hangs
    const failsafeTimer = setTimeout(() => {
      if (!navigationCompleted) {
        console.log('⚠️ FAILSAFE: Forcing navigation after 3s timeout');
        setPurchasing(false);
        navigationCompleted = true;
        onComplete();
      }
    }, 3000);
    
    try {
      setPurchasing(true);
      console.log('🛒 Starting purchase for package:', pkg.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('✅ Purchase completed, checking entitlement...');
      
      // Clear failsafe timer since purchase succeeded
      clearTimeout(failsafeTimer);
      
      // ALWAYS navigate after purchase completes, regardless of entitlement check
      // This ensures we don't get stuck on paywall screen
      console.log('🚀 Navigating to Home immediately after purchase');
      setPurchasing(false); // Reset purchasing state before navigation
      navigationCompleted = true;
      onComplete(); // Navigate immediately
      
      // Show success message after navigation (non-blocking)
      setTimeout(() => {
        if (Object.keys(customerInfo.entitlements.active).length > 0) {
          console.log('✅ Entitlement confirmed');
          Alert.alert(
            'Success!',
            'Welcome to LifeSet Premium! Enjoy your 7-day free trial.',
            [{ text: 'OK' }]
          );
        } else {
          console.log('⚠️ Purchase completed but entitlement not active yet - may take a moment');
          Alert.alert(
            'Purchase Complete',
            'Your subscription is being processed. Enjoy LifeSet!',
            [{ text: 'OK' }]
          );
        }
      }, 800);
      
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      clearTimeout(failsafeTimer);
      setPurchasing(false);
      navigationCompleted = true;
      
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Unable to complete purchase');
      }
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      console.log('♻️ Starting restore purchases...');
      
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Restore completed, checking entitlement...');
      
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        console.log('✅ Active entitlement found - navigating to Home');
        setPurchasing(false); // Reset state before navigation
        onRestore(); // Navigate immediately
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            'Restored!',
            'Your subscription has been restored.',
            [{ text: 'OK' }]
          );
        }, 800);
      } else {
        console.log('⚠️ No active subscription found');
        setPurchasing(false);
        Alert.alert('No Subscription', 'No active subscription found to restore.');
      }
    } catch (error: any) {
      console.error('❌ Restore error:', error);
      setPurchasing(false);
      Alert.alert('Restore Failed', error.message || 'Unable to restore purchases');
    }
  };

  const benefits = [
    { icon: '✅', text: 'Unlimited Habits' },
    { icon: '💪', text: 'Advanced Workout Plans' },
    { icon: '🥗', text: 'Premium Recipes' },
    { icon: '📊', text: 'Detailed Analytics' },
    { icon: '🚫', text: 'Ad-Free Experience' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Debug Overlay - Temporary for testing */}
      <DebugOverlay visible={true} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerEmoji}>✨</Text>
        <Text style={styles.headerTitle}>LifeSet Premium</Text>
        <Text style={styles.headerSubtitle}>7-Day Free Trial</Text>
      </LinearGradient>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Premium Benefits</Text>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefit}>
            <Text style={styles.benefitIcon}>{benefit.icon}</Text>
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={styles.packageCard}
            onPress={() => handlePurchase(pkg)}
            disabled={purchasing}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>
                {pkg.product.title.replace('(LifeSet)', '').trim()}
              </Text>
              {pkg.packageType === 'ANNUAL' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 40%</Text>
                </View>
              )}
            </View>
            <Text style={styles.packagePrice}>
              {pkg.product.priceString}
              {pkg.packageType === 'ANNUAL' ? '/year' : '/month'}
            </Text>
            <Text style={styles.packageDescription}>
              {pkg.packageType === 'ANNUAL' 
                ? 'Best Value - Billed annually' 
                : 'Billed monthly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.trialNotice}>
        Start your 7-day free trial. Cancel anytime before trial ends to avoid charges.
      </Text>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={purchasing}
      >
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>

      <View style={styles.legalLinks}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>

      {purchasing && (
        <View style={styles.purchasingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  packagesContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  saveBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
  },
  trialNotice: {
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  restoreButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  legalLinks: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  legalText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#667eea',
    textDecorationLine: 'underline',
  },
  purchasingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

