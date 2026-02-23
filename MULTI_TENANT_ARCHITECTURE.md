# Multi-Tenant Architecture Implementation

## Overview

This document describes the multi-tenant architecture that extends the existing LifeSet platform to support organisations (gyms, yoga studios, corporate wellness, etc.) while maintaining full backward compatibility with existing B2C users.

## Key Principles

1. **Zero Impact on B2C Users**: Users without `organisationId` remain in Consumer Mode with no changes
2. **Backward Compatible**: All existing fields and collections remain unchanged
3. **Mode-Based Features**: Features are enabled/disabled based on organisation type and feature flags
4. **Secure by Default**: Firestore rules ensure users can only access their organisation's data

## Architecture Components

### 1. Firestore Schema Extensions

#### New Collections
- `/organisations/{organisationId}` - Organisation configuration
- `/classes/{classId}` - Class schedules (gym mode)
- `/bookings/{bookingId}` - User bookings
- `/memberships/{membershipId}` - User memberships
- `/packs/{packId}` - Membership packs
- `/attendance/{attendanceId}` - Check-in records
- `/organisationInvites/{inviteId}` - Join codes

#### Extended User Document
Users now have optional fields:
```typescript
{
  // ... existing fields ...
  organisationId?: string | null;
  role?: "member" | "staff" | "admin" | "employee";
  mode?: string; // Derived from organisation.type
}
```

### 2. Cloud Functions

#### GET /me
Returns mode configuration for the authenticated user:
- If no `organisationId` → Consumer Mode
- If `organisationId` exists → Returns organisation, mode config, content pack, navigation

#### POST /createOrganisation
Creates a new organisation and links the creator as admin.

#### POST /validateQRCheckIn
Validates QR code check-in and logs attendance.

### 3. Mobile App Integration

#### Services
- `src/services/firebase/mode-loader.ts` - Fetches mode config from Cloud Function
- `src/services/firebase/organisation.ts` - Organisation operations

#### Hooks
- `useMode()` - Provides mode configuration, organisation data, feature flags
- `useOrganisation()` - Organisation operations (join, leave)
- `useFeatureFlags()` - Feature flag checks

### 4. Mode System

#### Supported Modes
- **consumer** - Default B2C mode (no organisation)
- **gym** - Full gym features (bookings, memberships, packs, QR check-in)
- **company** - Corporate wellness (habits, challenges, analytics, NO payments)
- **yoga** - Yoga studio (similar to gym)
- **pilates** - Pilates studio
- **hiit** - HIIT studio
- **sauna** - Sauna facility

#### Mode Configuration
Each mode defines:
- `enabledFeatures` - Array of feature names
- `navigation` - Array of screen names
- `contentPack` - Content pack identifier

### 5. Content Packs

Content packs provide:
- Default habits
- Default challenges
- Onboarding screens

Packs are loaded based on organisation type and can be customized per organisation.

## Usage Examples

### Mobile App - Check Mode

```typescript
import { useMode } from "../hooks/useMode";

function MyComponent() {
  const { mode, organisation, isConsumerMode, hasFeature } = useMode();

  if (isConsumerMode) {
    // Show consumer UI
  } else {
    // Show organisation-branded UI
    if (hasFeature("bookings")) {
      // Show booking feature
    }
  }
}
```

### Mobile App - Join Organisation

```typescript
import { useOrganisation } from "../hooks/useOrganisation";

function JoinScreen() {
  const { joinByCode } = useOrganisation();

  const handleJoin = async () => {
    try {
      await joinByCode("GYM123");
      // Refresh mode config
    } catch (error) {
      // Handle error
    }
  };
}
```

### Cloud Function - Create Organisation

```typescript
// Called from admin dashboard
POST /createOrganisation
{
  "name": "FitZone Gym",
  "type": "gym",
  "logoUrl": "https://...",
  "brandColours": {
    "primary": "#FF0000",
    "secondary": "#FFFFFF"
  },
  "featureFlags": {
    "bookings": true,
    "memberships": true,
    // ...
  },
  "contentPack": "gymPack"
}
```

## Security Rules

Firestore rules ensure:
- Users can only read their own organisation's data
- Only admins/staff can write to organisation collections
- Bookings are private to the user or visible to staff
- Memberships are readable by user and staff

## Next Steps

1. **Admin Dashboard** - Build Next.js dashboard for organisation management
2. **Booking Engine** - Implement class scheduling and booking system
3. **Membership Engine** - Implement membership tiers and Stripe/GoCardless integration
4. **Public Widgets** - Build embeddable schedule and membership widgets
5. **QR Code Generation** - Add QR code generation in mobile app
6. **Analytics** - Build organisation-level analytics dashboard

## Testing

### Test Consumer Mode
1. User with no `organisationId` should see consumer mode
2. All existing features should work as before

### Test Organisation Mode
1. Create organisation via Cloud Function
2. Link user to organisation
3. Call `/me` endpoint - should return organisation mode
4. Verify feature flags are respected
5. Verify navigation is filtered

## Deployment

### Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Mobile App
No changes needed for existing users. New organisation features are opt-in via `/me` endpoint.

