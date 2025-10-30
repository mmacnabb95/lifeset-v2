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
      // Small delay to ensure RevenueCat.logIn() has completed in App.tsx
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 500);
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
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      
      // Check if user has any active entitlements
      const entitlements = customerInfo.entitlements.active;
      const premiumEntitlement: PurchasesEntitlementInfo | undefined = entitlements['premium'];
      
      if (premiumEntitlement) {
        const expirationDate = premiumEntitlement.expirationDate 
          ? new Date(premiumEntitlement.expirationDate) 
          : null;
        
        const isInTrial = premiumEntitlement.periodType === 'TRIAL' || 
                          premiumEntitlement.periodType === 'INTRO';
        
        setStatus({
          isSubscribed: true,
          isInTrial,
          expirationDate,
          loading: false,
          error: null,
        });
      } else {
        setStatus({
          isSubscribed: false,
          isInTrial: false,
          expirationDate: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
      
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

