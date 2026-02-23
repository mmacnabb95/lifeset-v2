# LifeSet Cloud Functions

Firebase Cloud Functions for the LifeSet multi-tenant platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Deploy functions:
```bash
npm run deploy
```

## Available Functions

### GET /me
Returns mode configuration for the authenticated user.

**Request:**
```
GET https://[region]-[project-id].cloudfunctions.net/me
Headers: Authorization: Bearer [firebase-id-token]
```

**Response:**
```json
{
  "mode": "gym",
  "user": {
    "uid": "...",
    "email": "...",
    "username": "...",
    "organisationId": "org123",
    "role": "member"
  },
  "organisation": {
    "organisationId": "org123",
    "name": "FitZone Gym",
    "type": "gym",
    "logoUrl": "...",
    "brandColours": { "primary": "#FF0000", "secondary": "#FFFFFF" },
    "featureFlags": { ... }
  },
  "modeConfig": {
    "mode": "gym",
    "enabledFeatures": [...],
    "navigation": [...],
    "contentPack": "gymPack"
  },
  "contentPack": { ... },
  "navigation": [...]
}
```

### POST /createOrganisation
Creates a new organisation (admin only).

**Request:**
```json
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
    "packs": true,
    "qrCheckIn": true,
    "habits": true,
    "challenges": true,
    "journaling": false,
    "nutrition": false,
    "workouts": true,
    "analytics": true
  },
  "contentPack": "gymPack"
}
```

### POST /validateQRCheckIn
Validates QR code check-in and logs attendance.

**If you get 403 Forbidden / Failed to fetch:** Firebase Functions v2 blocks unauthenticated invocations by default. Run:
```bash
./functions/allow-public-invocation.sh
```
Or manually: `gcloud functions add-invoker-policy-binding validateQRCheckIn --region=us-central1 --member="allUsers"`

**Request:**
```json
{
  "qrCode": "userId:timestamp:hash",
  "classId": "class123"
}
```

## Development

Run functions locally:
```bash
npm run serve
```

This starts the Firebase emulator suite. Functions will be available at:
- `http://localhost:5001/[project-id]/[region]/me`

## Environment Variables

Set in Firebase Console → Functions → Configuration:
- `STRIPE_SECRET_KEY` - Stripe secret key (for future payment integration)
- `GOCARDLESS_SECRET_KEY` - GoCardless secret key (for future payment integration)

