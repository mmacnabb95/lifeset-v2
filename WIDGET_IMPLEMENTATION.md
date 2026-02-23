# Widget Data Sync Implementation

## Overview
This document describes the minimal native module approach for syncing widget data from React Native to iOS App Groups.

## Architecture

### 1. Native Module (Swift)
**File:** `native-modules/ios/LifeSet/WidgetDataSync.swift`

- Conforms to `RCTBridgeModule` protocol
- Exposes `syncWidgetData` method that:
  - Writes JSON data to App Groups UserDefaults (`group.com.lifesetwellbeing.lifeset`)
  - Triggers WidgetKit timeline reload
  - Returns success/failure via Promise

### 2. Objective-C Bridge
**File:** `native-modules/ios/LifeSet/WidgetDataSyncBridge.m`

- Uses `RCT_EXTERN_MODULE` to expose Swift class to React Native
- Maps the `syncWidgetData` method signature

### 3. TypeScript Bridge
**File:** `src/native-modules/WidgetDataSync.ts`

- Uses `NativeModules` directly (no Expo module system)
- Provides type-safe wrapper `syncWidgetDataToAppGroups`
- Handles platform checks and error handling

### 4. Data Sync Service
**File:** `src/services/widget-data-sync.ts`

- Fetches habits, completions, streak, and goals from Firebase
- Formats data for widget consumption
- Calls native module to write to App Groups
- Falls back to AsyncStorage if native module unavailable (Expo Go)

### 5. Config Plugin
**File:** `plugins/withWidgetDataSync.js`

- Copies Swift and Objective-C files to `ios/LifeSet/` during prebuild
- Adds files to Xcode project's build phases
- Ensures files are linked correctly

## Data Flow

```
React Native (habits-screen.tsx)
  ↓
widget-data-sync.ts (fetch Firebase data)
  ↓
WidgetDataSync.ts (TypeScript bridge)
  ↓
NativeModules.WidgetDataSync (React Native bridge)
  ↓
WidgetDataSync.swift (native module)
  ↓
App Groups UserDefaults (group.com.lifesetwellbeing.lifeset)
  ↓
Widget Extension (targets/widget/widgets.swift)
  ↓
iOS Home Screen Widget
```

## Testing

1. **Build development build:**
   ```bash
   eas build --profile development --platform ios
   ```

2. **Install on device and add widget to home screen**

3. **Complete a habit in the app** - widget should update within 1-2 seconds

4. **Check console logs:**
   - `✅ Widget data synced:` - Success
   - `⚠️ Native module not available` - Module not linked (check build)
   - `❌ Error syncing widget data` - Firebase or other error

## Troubleshooting

### Widget shows zeros
- Check that native module is linked: Look for `✅ Copied WidgetDataSync.swift` in build logs
- Verify App Groups are configured in Apple Developer Portal for both app and widget extension
- Check Xcode project has files in build phases

### Native module not available
- Run `npx expo prebuild --clean` to regenerate iOS project
- Verify files exist in `ios/LifeSet/` after prebuild
- Check Xcode project includes files in Sources build phase

### Widget not updating
- Verify `WidgetCenter.shared.reloadAllTimelines()` is being called
- Check App Groups UserDefaults has data: Use Xcode debugger to inspect `UserDefaults(suiteName: "group.com.lifesetwellbeing.lifeset")`
- Ensure widget extension has App Groups entitlement

## Files Modified

- ✅ `native-modules/ios/LifeSet/WidgetDataSync.swift` - Added RCTBridgeModule conformance
- ✅ `src/native-modules/WidgetDataSync.ts` - Switched to NativeModules directly
- ✅ `app.json` - Updated plugin path to `./plugins/withWidgetDataSync`
- ✅ `src/pages/habits/habits-screen.tsx` - Widget sync calls already enabled

## Next Steps

1. Run `npx expo prebuild --clean` to regenerate iOS project
2. Build development build with `eas build --profile development --platform ios`
3. Test on device - complete a habit and verify widget updates
4. If successful, build production build and submit to App Store

