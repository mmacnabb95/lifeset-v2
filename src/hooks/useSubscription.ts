import { useState, useEffect } from 'react';
import Purchases, { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';
import { useFirebaseUser } from './useFirebaseUser';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isInTrial: boolean;
  expirationDate: Date | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check subscription status using RevenueCat
 */
export const useSubscription = (): SubscriptionStatus => {
  const { userId } = useFirebaseUser();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isInTrial: false,
    expirationDate: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Wait for user to be authenticated before checking subscription
    // This ensures RevenueCat is logged in with the correct user ID
    if (userId) {
      console.log('💳 User authenticated, checking subscription for:', userId);
      
      // CRITICAL: Keep loading TRUE during the delay
      setStatus(prev => ({
        ...prev,
        loading: true, // Keep loading while waiting for RevenueCat to sync
      }));
      
      // Delay to ensure RevenueCat.logIn() has completed in App.tsx
      // Give RevenueCat time to sync with server after login
      setTimeout(() => {
        console.log('💳 Delay complete, now checking subscription...');
        checkSubscriptionStatus();
      }, 1500);
    } else {
      console.log('⏳ Waiting for user authentication before checking subscription');
      // User not logged in, set loading false but not subscribed
      setStatus({
        isSubscribed: false,
        isInTrial: false,
        expirationDate: null,
        loading: false,
        error: null,
      });
    }
  }, [userId]); // Re-check when userId changes

  const checkSubscriptionStatus = async () => {
    try {
      console.log('💳 Calling Purchases.getCustomerInfo()...');
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      console.log('💳 CustomerInfo received:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
      });
      
      // Check if user has any active entitlements
      const entitlements = customerInfo.entitlements.active;
      const activeEntitlementKeys = Object.keys(entitlements);
      console.log('💳 Active entitlements found:', activeEntitlementKeys);
      console.log('💳 Full entitlements object:', JSON.stringify(entitlements, null, 2));
      
      // Accept ANY active entitlement (not just 'premium')
      // This makes the code resilient to entitlement name changes
      const hasActiveEntitlement = activeEntitlementKeys.length > 0;
      
      if (hasActiveEntitlement) {
        // Get the first active entitlement (usually 'premium')
        const entitlementKey = activeEntitlementKeys[0];
        const activeEntitlement = entitlements[entitlementKey];
        
        console.log(`✅ Active entitlement found: "${entitlementKey}"!`);
        console.log('💳 Entitlement details:', JSON.stringify(activeEntitlement, null, 2));
        
        const expirationDate = activeEntitlement.expirationDate 
          ? new Date(activeEntitlement.expirationDate) 
          : null;
        
        const isInTrial = activeEntitlement.periodType === 'TRIAL' || 
                          activeEntitlement.periodType === 'INTRO';
        
        console.log('💳 Setting isSubscribed: true, isInTrial:', isInTrial);
        console.log('💳 Expiration:', expirationDate);
        
        setStatus({
          isSubscribed: true,
          isInTrial,
          expirationDate,
          loading: false,
          error: null,
        });
      } else {
        console.log('❌ NO active entitlements found - user is not subscribed');
        console.log('💳 This could mean:');
        console.log('   - User subscription expired');
        console.log('   - RevenueCat hasn\'t synced yet');
        console.log('   - Entitlement not configured in RevenueCat dashboard');
        setStatus({
          isSubscribed: false,
          isInTrial: false,
          expirationDate: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('❌ Error checking subscription status:', error);
      
      // In development (Expo Go), treat as subscribed to allow testing
      // In production builds, RevenueCat will work correctly
      const isDevelopment = __DEV__ && error.message?.includes('no singleton instance');
      
      setStatus({
        isSubscribed: isDevelopment, // True in dev, false in prod
        isInTrial: false,
        expirationDate: null,
        loading: false,
        error: isDevelopment ? null : (error.message || 'Failed to check subscription'),
      });
      
      if (isDevelopment) {
        console.log('🔧 Development mode: Treating user as subscribed for testing');
      }
    }
  };

  return status;
};

/**
 * Restore purchases for the user
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const hasActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
    return hasActiveEntitlement;
  } catch (error: any) {
    console.error('Error restoring purchases:', error);
    throw new Error(error.message || 'Failed to restore purchases');
  }
};

