# LifeSet Widget Extension Setup

## ✅ What's Been Completed

1. **Widget Extension Structure**
   - Created `ios/LifeSetWidget/LifeSetWidget.swift` with small, medium, and large widget views
   - Created `ios/LifeSetWidget/Info.plist` for widget configuration

2. **App Configuration**
   - Added `appleTargets` configuration in `app.json` for the widget extension
   - Configured App Groups: `group.com.lifesetwellbeing.lifeset`
   - Added entitlements for App Groups in both main app and widget extension

3. **Data Sync Service**
   - Created `src/services/widget-data-sync.ts` to sync habits, goals, and streak data
   - Integrated sync into habit completion and goal update flows

4. **Widget Views**
   - **Small Widget**: Displays streak number and today's completion count (X/Y habits)
   - **Medium Widget**: Shows streak + today's habits with checkmarks (up to 4 habits)
   - **Large Widget**: Full view with streak, all today's habits, and active goals with progress bars

## ✅ Native Module for App Groups - COMPLETED

**The native module has been created to bridge React Native to App Groups UserDefaults.**

Created files:
- `ios/WidgetDataSync.h` - Native module header
- `ios/WidgetDataSync.m` - Native module implementation
- `src/native-modules/WidgetDataSync.ts` - TypeScript bridge

The native module:
- Writes widget data to App Groups UserDefaults (`group.com.lifesetwellbeing.lifeset`)
- Notifies WidgetKit to refresh the widget timeline
- Falls back to AsyncStorage in Expo Go (widget won't work in Expo Go, but won't crash)

The widget reads from:
```
UserDefaults(suiteName: "group.com.lifesetwellbeing.lifeset")?.data(forKey: "widgetData")
```

## 📋 Next Steps

1. **Run `npx create-target`** and select "Widget" to generate proper Xcode structure
   - OR manually configure the widget extension in Xcode after building

2. **Configure App Groups in Apple Developer Portal**
   - Go to https://developer.apple.com/account/resources/identifiers/list
   - Create App Group: `group.com.lifesetwellbeing.lifeset`
   - Add it to both your main app and widget extension

3. **Build Development Build**
   ```bash
   eas build --profile development --platform ios
   ```

4. **Test on Device**
   - Install the development build
   - Add widget to home screen
   - Complete a habit and verify widget updates

## 🎨 Widget Features

### Small Widget (2x2)
- 🔥 Streak number (large, bold)
- "day streak" label
- Today's completion: "X/Y habits today"

### Medium Widget (4x2)
- Left: Streak display with "X/Y today"
- Right: Today's habits list (up to 4) with checkmarks

### Large Widget (4x4)
- Header: Streak + best streak + today's completion
- Today's Habits: Full list (up to 5) with checkmarks
- Active Goals: Up to 3 goals with progress bars

## 🔄 Data Sync

Widget data syncs automatically when:
- Habit is completed/uncompleted
- Goal progress is updated
- Habits screen is loaded

The sync service fetches:
- Current streak and longest streak
- Today's habits and completion status
- Active goals with progress

## 📝 Notes

- Widget updates every hour automatically
- Widget can also update when app writes new data (via App Groups notification)
- Widget reads from App Groups UserDefaults, not AsyncStorage
- Requires iOS 17.0+ (configured in `app.json`)

