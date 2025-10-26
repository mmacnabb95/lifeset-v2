# TestFlight Setup Guide for LifeSet v2

This guide will help you complete the TestFlight setup for your app.

## ✅ Completed Implementation

### Phase 1: Codebase Cleanup
- [x] Created `/legacy/` directory
- [x] Moved old AWS/axios files to legacy folder
- [x] Updated imports to use stub implementations
- [x] Added `/legacy/` to `.gitignore`

### Phase 2: Onboarding
- [x] Created 5 onboarding slides (Welcome, Habits, Workouts, Wellness, Community)
- [x] Implemented swipeable carousel with skip/next functionality
- [x] Added progress indicators
- [x] Added `hasCompletedOnboarding` flag to Firebase UserProfile
- [x] Created `setOnboardingCompleted()` and `getOnboardingStatus()` functions

### Phase 3: RevenueCat Integration
- [x] Initialized RevenueCat SDK in `App.tsx`
- [x] Created custom paywall screen with LifeSet branding
- [x] Implemented `useSubscription` hook
- [x] Added subscription management to Settings
- [x] Created Privacy Policy and Terms of Service screens
- [x] Added restore purchases functionality

### Phase 4: App Configuration
- [x] Updated `app.json` with proper app name, version, and bundle IDs
- [x] Added legal URLs to app config
- [x] Configured iOS and Android permissions
- [x] Set version to 1.0.0, buildNumber/versionCode to 1

### Phase 5: Navigation Flow
- [x] Implemented routing logic: Onboarding → Paywall → Home
- [x] Added loading states while checking subscription status
- [x] Prevented back gestures on onboarding/paywall screens
- [x] Integrated all screens into navigation stack

---

## 🔧 Required Configuration

### 1. RevenueCat API Keys

**Location:** `App.tsx` lines 21-22

Replace the placeholder keys with your actual RevenueCat API keys:

```typescript
const REVENUECAT_IOS_KEY = 'appl_YOUR_IOS_KEY_HERE';
const REVENUECAT_ANDROID_KEY = 'goog_YOUR_ANDROID_KEY_HERE';
```

**To get your keys:**
1. Go to https://app.revenuecat.com
2. Navigate to your project
3. Go to **API Keys** in the left sidebar
4. Copy the **iOS (App Store)** key
5. Copy the **Android (Google Play)** key
6. Paste them into `App.tsx`

### 2. RevenueCat Products Setup

You need to create products in RevenueCat dashboard and configure them:

1. **Create Entitlement:**
   - Name: `premium`
   - This matches the code in `useSubscription.ts` line 27

2. **Create Products:**
   - Monthly subscription with 7-day free trial
   - Annual subscription with 7-day free trial
   - Attach both to the `premium` entitlement

3. **Configure in App Store Connect / Google Play Console:**
   - Set up in-app purchases
   - Configure the same product IDs in RevenueCat

### 3. Update Bundle Identifiers (if needed)

**Location:** `app.json`

Current values:
- iOS: `com.lifesetwellbeing.app`
- Android: `com.lifesetwellbeing.app`

If you need different identifiers, update lines 18 and 32.

---

## 📱 Testing the Complete Flow

### Test Scenario 1: Fresh Install (New User)
1. Install app on device/simulator
2. User sees the test login screen
3. Create new account or login
4. **Expected:** Navigate to Onboarding carousel
5. Go through 5 slides or tap "Skip"
6. **Expected:** Navigate to Paywall
7. See subscription options with 7-day trial
8. Either:
   - Purchase subscription → Navigate to Home
   - Or skip for testing → Force navigate to Home

### Test Scenario 2: Existing User (Completed Onboarding, No Subscription)
1. Login with existing account
2. **Expected:** Skip onboarding, go directly to Paywall
3. Start free trial or purchase
4. **Expected:** Navigate to Home

### Test Scenario 3: Existing User (Completed Onboarding, Has Subscription)
1. Login with existing account that has active subscription
2. **Expected:** Go directly to Home dashboard
3. All features unlocked

### Test Scenario 4: Restore Purchases
1. Go to Settings
2. Tap "Restore Purchases"
3. **Expected:** If user had previous subscription, it's restored
4. Navigate back to Home with full access

---

## 🚀 Building for TestFlight

### iOS

1. **Install EAS CLI (if not installed):**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```

4. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```

5. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios
   ```

### Android

1. **Build for Google Play:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play Internal Testing:**
   ```bash
   eas submit --platform android
   ```

---

## ⚠️ Important Notes

### 1. Testing Subscriptions

- **Sandbox Testing:** Use sandbox accounts for testing subscriptions
- **RevenueCat Test Mode:** Make sure you're testing in the correct environment
- **iOS:** Configure sandbox testers in App Store Connect
- **Android:** Use test accounts in Google Play Console

### 2. 7-Day Free Trial

- The free trial is configured in App Store Connect / Google Play Console
- Make sure the trial period is set to 7 days in your product configuration
- RevenueCat will automatically detect and show trial status

### 3. Legal Requirements

- Update Privacy Policy and Terms of Service with your actual legal text
- Current files are in:
  - `src/pages/legal/privacy-policy.tsx`
  - `src/pages/legal/terms-of-service.tsx`
- Update the URLs in `app.json` to point to your hosted legal pages

### 4. Subscription Prices

Current placeholder text in paywall shows pricing from RevenueCat
- Make sure your products are configured with appropriate prices
- Prices are automatically localized by the stores

---

## 🐛 Troubleshooting

### RevenueCat not initializing
- Check that API keys are correct
- Verify bundle ID matches what's configured in RevenueCat
- Check console logs for initialization errors

### Onboarding shows every time
- Check that `setOnboardingCompleted()` is being called
- Verify Firebase write permissions for user profiles
- Check console logs for Firestore errors

### Paywall not showing packages
- Verify offerings are configured in RevenueCat
- Check that entitlement name is `premium`
- Test with sandbox account

### Navigation stuck on loading screen
- Check Firebase authentication is working
- Verify `useSubscription` hook is returning data
- Check network connectivity

---

## 📝 Next Steps

1. **Configure RevenueCat:**
   - Add API keys to `App.tsx`
   - Set up products and entitlements
   - Configure offerings

2. **Test Locally:**
   - Test onboarding flow
   - Test paywall with sandbox account
   - Test subscription status detection

3. **Update Legal Text:**
   - Write actual Privacy Policy
   - Write actual Terms of Service
   - Host on your website
   - Update URLs in `app.json`

4. **Build & Submit:**
   - Run `eas build` for iOS/Android
   - Submit to TestFlight/Internal Testing
   - Invite beta testers

5. **Monitor:**
   - Check RevenueCat dashboard for subscription events
   - Monitor Firebase for user data
   - Check console logs for any errors

---

## 📚 Additional Resources

- **RevenueCat Docs:** https://docs.revenuecat.com
- **Expo TestFlight:** https://docs.expo.dev/submit/ios/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/

---

## 🎉 Success Checklist

Before submitting to TestFlight:

- [ ] RevenueCat API keys added and working
- [ ] Products configured in RevenueCat dashboard
- [ ] In-app purchases set up in App Store Connect
- [ ] Bundle IDs match across all platforms
- [ ] Privacy Policy and Terms updated with real content
- [ ] Tested complete onboarding → paywall → home flow
- [ ] Tested subscription purchase with sandbox account
- [ ] Tested restore purchases
- [ ] All Firebase features working correctly
- [ ] App icon and splash screen looking good
- [ ] Version number set to 1.0.0

Good luck with your TestFlight launch! 🚀

