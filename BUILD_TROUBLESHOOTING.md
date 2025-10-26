# Build Troubleshooting Guide

## Issue: Development Build Failing at "Install dependencies"

### Builds That Failed:
1. Build ID: `e74373e4-c868-4f4a-8d12-31abeec58d53`
2. Build ID: `3d887099-b04f-4095-8f99-347a99e7a497`
3. Build ID: `163aed02-a608-4b12-a031-9b3d58f0c27c`

**Error:** "Unknown error. See logs of the Install dependencies build phase for more information."

---

## Fixes Already Applied

✅ **Removed `firebase-admin`** (server-side package, incompatible with React Native)
✅ **Removed `postinstall` script** (symlink creation can fail on build servers)
✅ **Created `.easignore`** (reduces 436 MB archive size)
✅ **Added encryption config** to `app.json`

---

## Next Steps to Try

### Option 1: View Actual Build Logs (Recommended)

You need to see the actual error in the build logs:

1. Open your browser
2. Go to: https://expo.dev/accounts/matthewmacnabb/projects/lifeset-v2/builds
3. Click on the most recent failed build
4. Click on the "Install dependencies" phase
5. Scroll through the logs to find the actual error

**Look for:**
- Package installation failures
- Version conflicts
- Missing peer dependencies
- Platform-specific issues

### Option 2: Try a Clean Build

Clear all caches and try again:

```bash
# Clean local caches
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps

# Try build again
eas build --profile development --platform ios
```

### Option 3: Check for Expo SDK 54 Compatibility

Some packages might not be compatible with Expo 54. Check package.json for:

**Potentially problematic:**
- `react-native-sqlite-storage` - May need Expo SQLite instead
- `react-native-svg-charts` - Old package, may have peer dependency issues
- `react-native-dropdown-picker` - Check Expo 54 compatibility

### Option 4: Try Production Build Instead

Sometimes development builds are more finicky. Try a production build:

```bash
eas build --profile production --platform ios
```

Production builds are often more stable and might succeed where dev builds fail.

### Option 5: Use Expo's Prebuild

Create a local build to identify issues:

```bash
npx expo prebuild
```

This will generate iOS and Android folders locally and show you exactly what's failing.

---

## Alternative Approach: Skip Dev Build

Given the build failures, you could:

### Recommended: Go Straight to Production Build

Since development builds keep failing and you've already tested everything possible in Expo Go, consider:

1. **Build for production/TestFlight directly:**
   ```bash
   eas build --profile production --platform ios
   ```

2. **Why this might work better:**
   - Production builds have fewer dependencies
   - No dev-client complications
   - Same result: installable IPA for testing
   - Can still test with TestFlight sandbox accounts

3. **You can still test subscriptions:**
   - Install TestFlight build on your device
   - Use sandbox account for testing
   - Full RevenueCat functionality

---

## Common Causes of "Install dependencies" Errors

1. **Peer dependency conflicts** - Some packages incompatible
2. **Platform-specific packages** - iOS-only or Android-only packages causing issues
3. **Large dependency tree** - Too many packages timing out
4. **Deprecated packages** - Using old packages no longer maintained
5. **Postinstall scripts** - Scripts that fail on build servers (FIXED)

---

## Recommended Immediate Action

### Open the Build Logs in Browser

**Critical:** You MUST view the actual logs to see the real error:

1. Visit: https://expo.dev/accounts/matthewmacnabb/projects/lifeset-v2/builds/163aed02-a608-4b12-a031-9b3d58f0c27c
2. Login if needed
3. Click "Install dependencies" phase
4. Find the actual error message

**Then:**
- Share the error with me
- Or we can fix based on what you see

---

## If All Else Fails

### Alternative Testing Strategy

1. **Skip development build entirely**
2. **Build production version:**
   ```bash
   eas build --profile production --platform ios
   ```
3. **Submit to TestFlight immediately**
4. **Test with TestFlight build:**
   - Download from TestFlight
   - Test full subscription flow with sandbox account
   - Verify all features work

**Advantages:**
- Production builds are more reliable
- TestFlight provides proper testing environment
- Can test with multiple devices
- Real-world testing scenario

---

## What to Do Right Now

**Priority 1:** Check the actual build logs in your browser  
**Priority 2:** Share the specific error you see  
**Priority 3:** Or, run production build if you want to skip troubleshooting  

Let me know what you find in the logs!

