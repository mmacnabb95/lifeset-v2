# Widget Feature - Temporarily Disabled

The iOS widget feature has been temporarily disabled due to build issues with the native module integration.

## What Was Done

- ✅ Widget SwiftUI views created (`targets/widget/widgets.swift`)
- ✅ Widget extension configured in `app.json` 
- ✅ App Groups configured (`group.com.lifesetwellbeing.lifeset`)
- ✅ Data sync service created (`src/services/widget-data-sync.ts`)
- ✅ Native module files created (`native-modules/ios/LifeSet/WidgetDataSync.swift` and `WidgetDataSyncBridge.m`)
- ❌ Native module not properly integrated (build fails on EAS)

## Current Status

- Widget sync calls are commented out in `src/pages/habits/habits-screen.tsx`
- Widget plugin removed from `app.json` plugins array
- App works fine without widget - this is a nice-to-have feature

## To Re-enable Later

1. Fix the native module integration (files need to be properly added to Xcode project during EAS Build)
2. Uncomment widget sync calls in `habits-screen.tsx`
3. Re-add `"./plugins/withWidgetDataSync"` to `app.json` plugins
4. Rebuild and test

## Files Still Present (Not Deleted)

- `native-modules/ios/LifeSet/WidgetDataSync.swift`
- `native-modules/ios/LifeSet/WidgetDataSyncBridge.m`
- `src/services/widget-data-sync.ts`
- `src/native-modules/WidgetDataSync.ts`
- `targets/widget/` (widget extension)
- `plugins/withWidgetDataSync.js` (config plugin - needs fixing)

All files are preserved for future implementation.

