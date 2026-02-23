// Firebase Promo Codes Service
// Manages promotional codes for gifting free memberships

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import Purchases from 'react-native-purchases';

export interface PromoCode {
  id?: string;
  code: string; // The actual code (e.g., "INFLUENCER2024")
  description?: string; // Internal note (e.g., "For John Smith")
  type: 'lifetime' | '3_months' | '6_months' | '1_year';
  maxUses: number; // Maximum number of redemptions (0 = unlimited)
  currentUses: number; // How many times it's been used
  expiresAt?: Timestamp; // When the code expires (null = never)
  active: boolean; // Can be disabled without deleting
  createdAt?: Timestamp;
  createdBy?: string; // Admin who created it
}

export interface PromoRedemption {
  id?: string;
  codeId: string;
  code: string;
  userId: string;
  userEmail?: string;
  redeemedAt?: Timestamp;
}

/**
 * Validate a promo code
 * Returns the promo code data if valid, throws error if invalid
 */
export const validatePromoCode = async (code: string): Promise<PromoCode> => {
  try {
    const normalizedCode = code.trim().toUpperCase();
    
    // Find the promo code
    const promoCodesRef = collection(db, 'promoCodes');
    const q = query(promoCodesRef, where('code', '==', normalizedCode));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Invalid promo code');
    }
    
    const promoDoc = snapshot.docs[0];
    const promoData = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;
    
    // Check if code is active
    if (!promoData.active) {
      throw new Error('This promo code is no longer active');
    }
    
    // Check if code has expired
    if (promoData.expiresAt && promoData.expiresAt.toDate() < new Date()) {
      throw new Error('This promo code has expired');
    }
    
    // Check if code has reached max uses
    if (promoData.maxUses > 0 && promoData.currentUses >= promoData.maxUses) {
      throw new Error('This promo code has reached its maximum uses');
    }
    
    return promoData;
  } catch (error: any) {
    console.error('Validate promo code error:', error);
    throw error;
  }
};

/**
 * Check if a user has already redeemed a specific code
 */
export const hasUserRedeemedCode = async (userId: string, codeId: string): Promise<boolean> => {
  try {
    const redemptionsRef = collection(db, 'promoRedemptions');
    const q = query(
      redemptionsRef,
      where('userId', '==', userId),
      where('codeId', '==', codeId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Check redemption error:', error);
    return false;
  }
};

/**
 * Check if a user has ever redeemed any promo code
 */
export const hasUserRedeemedAnyCode = async (userId: string): Promise<boolean> => {
  try {
    const redemptionsRef = collection(db, 'promoRedemptions');
    const q = query(redemptionsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Check any redemption error:', error);
    return false;
  }
};

/**
 * Redeem a promo code for a user
 * This validates the code, records the redemption, and grants the entitlement
 */
export const redeemPromoCode = async (
  code: string,
  userId: string,
  userEmail?: string
): Promise<{ success: boolean; type: string; message: string }> => {
  try {
    // Validate the code
    const promoData = await validatePromoCode(code);
    
    // Check if user already redeemed this code
    const alreadyRedeemed = await hasUserRedeemedCode(userId, promoData.id!);
    if (alreadyRedeemed) {
      throw new Error('You have already redeemed this code');
    }
    
    // Check if user has redeemed any code before (optional - remove if you want multiple codes per user)
    // const hasAnyRedemption = await hasUserRedeemedAnyCode(userId);
    // if (hasAnyRedemption) {
    //   throw new Error('You can only redeem one promo code per account');
    // }
    
    // Record the redemption FIRST (this is the critical step)
    const redemptionsRef = collection(db, 'promoRedemptions');
    await addDoc(redemptionsRef, {
      codeId: promoData.id,
      code: promoData.code,
      userId,
      userEmail: userEmail || null,
      redeemedAt: serverTimestamp(),
    });
    
    // Store the promo subscription in user's subscription subcollection
    // This is what grants the premium access
    const expirationDate = calculateExpirationDate(promoData.type);
    const subscriptionRef = collection(db, 'users', userId, 'subscription');
    await addDoc(subscriptionRef, {
      type: 'promo',
      promoCodeId: promoData.id,
      promoCode: promoData.code,
      promoType: promoData.type,
      grantedAt: serverTimestamp(),
      expiresAt: expirationDate ? Timestamp.fromDate(expirationDate) : null,
      active: true,
    });
    
    // Increment the use count (non-blocking - will fail silently if permissions don't allow)
    // Note: This requires admin permissions or Cloud Function to update promoCodes
    // We do this last so it doesn't block the redemption if it fails
    try {
      const promoRef = doc(db, 'promoCodes', promoData.id!);
      await updateDoc(promoRef, {
        currentUses: increment(1),
      });
    } catch (updateError: any) {
      console.warn('Could not increment promo code use count (requires admin permissions):', updateError?.message);
      // Continue anyway - the redemption record is what matters
    }
    
    // Sync with RevenueCat (non-blocking)
    try {
      await Purchases.syncPurchases();
    } catch (rcError) {
      console.warn('RevenueCat sync error (non-fatal):', rcError);
      // Continue anyway - the Firebase record is the source of truth
    }
    
    const typeMessages: Record<string, string> = {
      'lifetime': 'Lifetime access',
      '3_months': '3 months free',
      '6_months': '6 months free',
      '1_year': '1 year free',
    };
    
    return {
      success: true,
      type: promoData.type,
      message: `🎉 Success! You've unlocked ${typeMessages[promoData.type] || 'premium access'}!`,
    };
  } catch (error: any) {
    console.error('Redeem promo code error:', error);
    throw error;
  }
};

/**
 * Calculate expiration date based on promo type
 */
const calculateExpirationDate = (type: string): Date | null => {
  const now = new Date();
  
  switch (type) {
    case 'lifetime':
      return null; // Never expires
    case '3_months':
      return new Date(now.setMonth(now.getMonth() + 3));
    case '6_months':
      return new Date(now.setMonth(now.getMonth() + 6));
    case '1_year':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return null;
  }
};

/**
 * Check if a user has an active promo subscription
 */
export const checkPromoSubscription = async (userId: string): Promise<{
  hasPromo: boolean;
  type?: string;
  expiresAt?: Date | null;
}> => {
  try {
    const subscriptionRef = collection(db, 'users', userId, 'subscription');
    const q = query(subscriptionRef, where('type', '==', 'promo'), where('active', '==', true));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { hasPromo: false };
    }
    
    const promoSub = snapshot.docs[0].data();
    
    // Check if expired
    if (promoSub.expiresAt) {
      const expiresAt = promoSub.expiresAt.toDate();
      if (expiresAt < new Date()) {
        // Mark as inactive
        await updateDoc(snapshot.docs[0].ref, { active: false });
        return { hasPromo: false };
      }
      return {
        hasPromo: true,
        type: promoSub.promoType,
        expiresAt,
      };
    }
    
    // Lifetime - no expiration
    return {
      hasPromo: true,
      type: promoSub.promoType,
      expiresAt: null,
    };
  } catch (error) {
    console.error('Check promo subscription error:', error);
    return { hasPromo: false };
  }
};

// ============================================
// ADMIN FUNCTIONS (for creating promo codes)
// ============================================

/**
 * Create a new promo code (admin function)
 */
export const createPromoCode = async (
  code: string,
  type: PromoCode['type'],
  options?: {
    description?: string;
    maxUses?: number;
    expiresAt?: Date;
    createdBy?: string;
  }
): Promise<string> => {
  try {
    const normalizedCode = code.trim().toUpperCase();
    
    // Check if code already exists
    const existing = await getDocs(
      query(collection(db, 'promoCodes'), where('code', '==', normalizedCode))
    );
    if (!existing.empty) {
      throw new Error('A promo code with this name already exists');
    }
    
    const promoCodesRef = collection(db, 'promoCodes');
    const docRef = await addDoc(promoCodesRef, {
      code: normalizedCode,
      type,
      description: options?.description || '',
      maxUses: options?.maxUses || 0, // 0 = unlimited
      currentUses: 0,
      expiresAt: options?.expiresAt ? Timestamp.fromDate(options.expiresAt) : null,
      active: true,
      createdAt: serverTimestamp(),
      createdBy: options?.createdBy || null,
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Create promo code error:', error);
    throw error;
  }
};

/**
 * Deactivate a promo code
 */
export const deactivatePromoCode = async (codeId: string): Promise<void> => {
  try {
    const promoRef = doc(db, 'promoCodes', codeId);
    await updateDoc(promoRef, { active: false });
  } catch (error) {
    console.error('Deactivate promo code error:', error);
    throw new Error('Failed to deactivate promo code');
  }
};

