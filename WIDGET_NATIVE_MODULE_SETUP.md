# Widget Native Module Setup

## Current Status

The Swift native module files (`WidgetDataSync.swift` and `WidgetDataSyncBridge.m`) are automatically copied to `ios/LifeSet/` during `npx expo prebuild`, but they need to be manually added to the Xcode project to be compiled.

## Manual Setup (Required After Each Prebuild)

After running `npx expo prebuild -p ios --clean`, you need to manually add the files to Xcode:

1. **Open Xcode:**
   ```bash
   open ios/LifeSet.xcodeproj
   ```

2. **Add Files to Project:**
   - Right-click the "LifeSet" folder (gray folder icon) in the Project Navigator
   - Select "Add Files to LifeSet..."
   - Navigate to `ios/LifeSet/`
   - Select both:
     - `WidgetDataSync.swift`
     - `WidgetDataSyncBridge.m`
   - In the dialog:
     - ✅ Check "Copy items if needed" (they're already there, but check it anyway)
     - Select "Create groups"
     - ✅ Check the "LifeSet" target
     - Click "Add"

3. **Verify Build Phases:**
   - Select the "LifeSet" project (blue icon)
   - Select the "LifeSet" target
   - Go to "Build Phases" tab
   - Expand "Compile Sources"
   - Verify both files are listed:
     - `WidgetDataSync.swift`
     - `WidgetDataSyncBridge.m`

4. **Build:**
   - Press Cmd+B to build
   - If successful, the native module should be available

## For EAS Build

Since EAS Build runs `npx expo prebuild` on their servers, the files will be copied but not added to the Xcode project. 

**Current Workaround:** The files need to be manually added to the Xcode project before building, OR we need to fix the config plugin to properly add them automatically.

**Future Solution:** We're working on fixing the config plugin to automatically add the files to the Xcode project during prebuild.

## Testing

After adding the files and building:
1. Run `npx expo start --dev-client`
2. Complete a habit
3. Check the console - you should see `✅ Widget data synced:` instead of `⚠️ Native module not available`

## Files Location

- Source files: `native-modules/ios/LifeSet/`
- Copied to: `ios/LifeSet/` (during prebuild)
- Must be added to: Xcode project Build Phases > Compile Sources

