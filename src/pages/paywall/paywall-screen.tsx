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
  Dimensions,
} from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768; // iPad width threshold

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
        // Sort packages to show annual first (most prominent)
        const sortedPackages = [...offerings.current.availablePackages].sort((a, b) => {
          if (a.packageType === 'ANNUAL') return -1;
          if (b.packageType === 'ANNUAL') return 1;
          return 0;
        });
        setPackages(sortedPackages);
      }
    } catch (error: any) {
      // Expected in Expo Go - RevenueCat requires native build
      if (__DEV__ && error.message?.includes('no singleton instance')) {
        console.log('🔧 Development mode: RevenueCat unavailable in Expo Go (will work in production build)');
        // Don't show error alert in dev mode for this expected error
      } else {
        console.error('Error loading offerings:', error);
        // Only show alert in production or for unexpected errors
        if (!__DEV__) {
          Alert.alert('Error', 'Failed to load subscription options');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate savings percentage for annual vs monthly
  const calculateSavings = (pkg: PurchasesPackage): number | null => {
    if (pkg.packageType !== 'ANNUAL') return null;
    
    const monthlyPkg = packages.find(p => p.packageType === 'MONTHLY');
    if (!monthlyPkg) return null;
    
    try {
      const monthlyPrice = monthlyPkg.product.price;
      const annualPrice = pkg.product.price;
      const monthlyEquivalent = annualPrice / 12;
      const savings = ((monthlyPrice - monthlyEquivalent) / monthlyPrice) * 100;
      
      return Math.round(savings);
    } catch (error) {
      console.error('Error calculating savings:', error);
      return null;
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    let navigationCompleted = false;
    
    // FAILSAFE: Force navigate after 15 seconds if something hangs
    const failsafeTimer = setTimeout(() => {
      if (!navigationCompleted) {
        console.log('⚠️ FAILSAFE: Forcing navigation after 15s timeout');
        setPurchasing(false);
        navigationCompleted = true;
        onComplete();
      }
    }, 15000);
    
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerEmoji} allowFontScaling={false}>✨</Text>
        <Text style={styles.headerTitle} allowFontScaling={false}>LifeSet Premium</Text>
        <Text style={styles.headerSubtitle} allowFontScaling={false}>
          7-Day Free Trial • Auto-renews after trial
        </Text>
      </LinearGradient>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle} allowFontScaling={false}>Premium Benefits</Text>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefit}>
            <Text style={styles.benefitIcon} allowFontScaling={false}>{benefit.icon}</Text>
            <Text style={styles.benefitText} allowFontScaling={false}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => {
          const isAnnual = pkg.packageType === 'ANNUAL';
          const billingPeriod = isAnnual ? 'year' : 'month';
          const savingsPercent = calculateSavings(pkg);
          
          return (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.packageCard,
                isAnnual && styles.packageCardAnnual, // Highlight annual option
              ]}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing}
            >
              <View style={styles.packageHeader}>
                <Text style={styles.packageTitle} allowFontScaling={false}>
                  {pkg.product.title.replace('(LifeSet)', '').trim()}
                </Text>
                {isAnnual && savingsPercent !== null && savingsPercent > 0 && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText} allowFontScaling={false}>SAVE {savingsPercent}%</Text>
                  </View>
                )}
              </View>
              
              {/* FREE TRIAL - Prominent */}
              <View style={styles.trialBadge}>
                <Text style={styles.trialBadgeText} allowFontScaling={false}>
                  🎁 7-Day Free Trial
                </Text>
              </View>
              
              {/* PRICING - Clear and explicit */}
              <View style={styles.pricingContainer}>
                <Text style={styles.pricingLabel} allowFontScaling={false}>Then:</Text>
                <Text style={styles.packagePrice} allowFontScaling={false}>
                  {pkg.product.priceString}
                  <Text style={styles.pricingPeriod} allowFontScaling={false}>/{billingPeriod}</Text>
                </Text>
              </View>
              
              {/* AUTO-RENEWAL NOTICE */}
              <Text style={styles.autoRenewNotice} allowFontScaling={false}>
                Auto-renews at {pkg.product.priceString}/{billingPeriod} unless cancelled
              </Text>
              
              <Text style={styles.packageDescription} allowFontScaling={false}>
                {isAnnual 
                  ? 'Billed annually after trial' 
                  : 'Billed monthly after trial'}
              </Text>
              
              {/* Subscribe Button */}
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
              >
                <Text style={styles.subscribeButtonText} allowFontScaling={false}>
                  {purchasing ? 'Processing...' : 'Start Free Trial'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.trialNoticeContainer}>
        <Text style={styles.trialNoticeText} allowFontScaling={false}>
          <Text style={styles.trialNoticeBold} allowFontScaling={false}>7-day free trial</Text> included. After trial, subscription auto-renews at {packages.find(p => p.packageType !== 'ANNUAL')?.product.priceString || packages[0]?.product.priceString || '$5.99'}/month unless cancelled at least 24 hours before the end of the current period. Cancel anytime in your Apple ID account settings.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={purchasing}
      >
        <Text style={styles.restoreButtonText} allowFontScaling={false}>Restore Purchases</Text>
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
    paddingTop: Platform.OS === 'ios' ? (IS_TABLET ? 100 : 80) : (IS_TABLET ? 80 : 60),
    paddingBottom: IS_TABLET ? 50 : 40,
    paddingHorizontal: IS_TABLET ? 60 : 30,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: IS_TABLET ? 80 : 60,
    marginBottom: IS_TABLET ? 20 : 16,
  },
  headerTitle: {
    fontSize: IS_TABLET ? 40 : 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: IS_TABLET ? 12 : 8,
  },
  headerSubtitle: {
    fontSize: IS_TABLET ? 24 : 20,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: IS_TABLET ? 60 : 20,
    marginTop: -20,
    borderRadius: 16,
    padding: IS_TABLET ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: IS_TABLET ? 600 : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
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
    marginHorizontal: IS_TABLET ? 60 : 20,
    marginTop: 24,
    maxWidth: IS_TABLET ? 600 : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: IS_TABLET ? 28 : 20,
    marginBottom: IS_TABLET ? 16 : 12,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packageCardAnnual: {
    borderColor: '#10b981', // Green border to highlight annual
    borderWidth: 3,
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
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
    flex: 1,
    marginRight: 8,
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
  trialBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
  },
  trialBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 6,
    fontWeight: '500',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
  },
  pricingPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  autoRenewNotice: {
    fontSize: 13,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  subscribeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  trialNoticeContainer: {
    marginHorizontal: IS_TABLET ? 60 : 20,
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: IS_TABLET ? 16 : 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxWidth: IS_TABLET ? 600 : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
  },
  trialNoticeText: {
    fontSize: 11,
    color: '#6c757d',
    lineHeight: 16,
    textAlign: 'center',
  },
  trialNoticeBold: {
    fontWeight: '700',
    color: '#495057',
  },
  restoreButton: {
    marginHorizontal: IS_TABLET ? 60 : 20,
    marginTop: 20,
    paddingVertical: IS_TABLET ? 16 : 14,
    alignItems: 'center',
    maxWidth: IS_TABLET ? 600 : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  legalLinks: {
    marginHorizontal: IS_TABLET ? 60 : 20,
    marginTop: 20,
    maxWidth: IS_TABLET ? 600 : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
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

