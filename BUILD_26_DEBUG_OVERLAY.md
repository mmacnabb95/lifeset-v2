# Build 26: Visible Debug Overlay

## Problem
Console.app doesn't capture JavaScript logs from TestFlight builds, making it impossible to debug the logout issue.

## Solution
Added a **visible debug overlay** that appears on screen showing real-time auth state.

## What You'll See

### On Every Screen (Top Right Corner):
A purple debug box showing:

```
🔍 DEBUG ▼

SecureStore: ✅ GrIPkcOi... (or ❌ NONE)
User ID: ✅ GrIPkcOixaa8... (or ❌ NONE)
Auth Init: ✅ YES (or ⏳ NO)
Subscribed: ✅ YES (or ❌ NO or ⏳ Loading)

Updated: 1:20:04 PM
Build 26 - SecureStore
```

### You Can:
- **Tap the header** to collapse/expand it
- **See in real-time** what SecureStore found
- **Track exactly when** auth state changes
- **Know immediately** if SecureStore is working

## Testing Instructions

1. **Build for TestFlight:**
```bash
eas build --profile production --platform ios
```

2. **Test the logout issue:**
   - Log in to the app
   - Go to Home screen
   - **Look at the debug overlay** - Should show:
     - `SecureStore: ✅ [userId]`
     - `User ID: ✅ [userId]`
     - `Auth Init: ✅ YES`
     - `Subscribed: ✅ YES`
   
3. **Completely close the app** (swipe up from app switcher)

4. **Reopen the app**
   - **IMMEDIATELY check the debug overlay**
   - What does `SecureStore:` show?
     - ✅ If it shows a userId → SecureStore IS working
     - ❌ If it shows NONE → SecureStore NOT saving
   - What does `User ID:` show?
     - ✅ If it shows a userId → User restored
     - ❌ If it shows NONE → User NOT restored (THIS IS THE BUG)
   - What screen are you on?
     - Home → Auth persisted correctly ✅
     - Paywall → Subscription check failed
     - Welcome → LOGOUT BUG 🐛

## What This Tells Us

### Scenario 1: Welcome Screen + SecureStore shows NONE
**Meaning:** SecureStore failed to save on login
**Fix:** Check if SecureStore has permissions or is broken

### Scenario 2: Welcome Screen + SecureStore shows ✅ userId
**Meaning:** SecureStore saved, but app didn't restore
**Fix:** App.tsx SecureStore restore logic isn't running

### Scenario 3: Paywall Screen + SecureStore shows ✅ userId
**Meaning:** Auth worked, but subscription check failed
**Fix:** RevenueCat subscription persistence issue

### Scenario 4: Home Screen + Everything ✅
**Meaning:** IT WORKS! 🎉

## Screenshots to Send Me

When you test, take screenshots showing:
1. **After login** - Debug overlay on Home screen
2. **After reopening** - Debug overlay on whichever screen it lands on

This will tell me EXACTLY where the problem is! 🎯

---

**Build 26** is ready for TestFlight testing! 🚀

