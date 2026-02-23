# Multi-Tenant Quick Start Guide

## Overview

The multi-tenant architecture has been implemented. This guide will help you get started.

## What's Been Implemented

### ✅ Backend (Cloud Functions)
- GET `/me` - Mode configuration endpoint
- POST `/createOrganisation` - Create organisation
- POST `/validateQRCheckIn` - QR check-in validation
- Mode configuration system
- Content packs system

### ✅ Mobile App
- Extended UserProfile with `organisationId` and `role`
- Mode loader service
- Organisation service
- `useMode()` hook
- `useOrganisation()` hook
- `useFeatureFlags()` hook

### ✅ Security
- Firestore rules for organisations
- Authentication in Cloud Functions

## Getting Started

### 1. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Test Consumer Mode

Existing users without `organisationId` will automatically be in Consumer Mode. No changes needed.

### 4. Test Organisation Mode

#### Create an Organisation

Call the Cloud Function:
```bash
curl -X POST https://[region]-[project-id].cloudfunctions.net/createOrganisation \
  -H "Authorization: Bearer [firebase-id-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Gym",
    "type": "gym",
    "brandColours": {
      "primary": "#FF0000",
      "secondary": "#FFFFFF"
    }
  }'
```

#### Link a User to Organisation

Update the user document in Firestore:
```javascript
// In Firebase Console or via code
await db.collection("users").doc(userId).update({
  organisationId: "org123",
  role: "member"
});
```

#### Test Mode Loader

In your mobile app:
```typescript
import { useMode } from "./hooks/useMode";

function MyComponent() {
  const { mode, organisation, isConsumerMode, hasFeature } = useMode();
  
  console.log("Mode:", mode);
  console.log("Is Consumer:", isConsumerMode);
  console.log("Can Book:", hasFeature("bookings"));
}
```

## Next Steps

1. **Build Admin Dashboard** - See `admin-dashboard/README.md`
2. **Implement Booking Engine** - See `IMPLEMENTATION_STATUS.md`
3. **Add Stripe Integration** - For membership payments
4. **Build Public Widgets** - See `widgets/README.md`

## Important Notes

- **Backward Compatible**: Existing users are unaffected
- **Opt-in**: Organisation features only activate when `organisationId` is set
- **Secure**: Firestore rules prevent cross-organisation data access
- **Mode-Based**: Features are controlled by mode configuration

## Testing Checklist

- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore Rules
- [ ] Test `/me` endpoint with no organisationId (should return consumer mode)
- [ ] Create organisation
- [ ] Link user to organisation
- [ ] Test `/me` endpoint with organisationId (should return organisation mode)
- [ ] Test feature flags in mobile app
- [ ] Test Firestore rules (try accessing another organisation's data - should fail)

## Support

See `MULTI_TENANT_ARCHITECTURE.md` for detailed architecture documentation.

