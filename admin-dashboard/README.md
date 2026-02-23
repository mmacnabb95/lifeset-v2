# LifeSet Admin Dashboard

Next.js admin dashboard for managing organisations, members, bookings, and memberships.

## Setup

1. Install dependencies:
```bash
cd admin-dashboard
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Authentication

- Uses Firebase Auth (same project as mobile app)
- Only users with `role: "admin"` or `role: "staff"` can access
- Login page at `/`
- Dashboard at `/dashboard`

## Features

### ✅ Implemented
- Login page with Firebase Auth
- Dashboard layout with navigation
- Dashboard overview with stats
- Protected routes (admin/staff only)
- Organisation context loading

### 🚧 Coming Soon
- Member management
- Schedule management
- Membership management
- Pack management
- Analytics dashboard
- Organisation settings

## Project Structure

```
admin-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Login page
│   ├── globals.css         # Global styles
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout with nav
│       ├── page.tsx        # Dashboard overview
│       ├── members/        # Member management
│       ├── schedule/       # Schedule management
│       ├── memberships/    # Membership management
│       └── settings/       # Organisation settings
├── lib/
│   ├── firebase-client.ts  # Firebase client SDK
│   ├── firebase-admin.ts   # Firebase Admin SDK (server-side)
│   └── auth.ts             # Auth utilities
└── package.json
```

## Environment Variables

For production, set these environment variables:

```env
FIREBASE_SERVICE_ACCOUNT_KEY=<service-account-json>
```

Or use Application Default Credentials in production.

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Development Notes

- Uses Firebase Client SDK for authentication
- Uses Firebase Admin SDK for server-side operations (future)
- All pages are client-side rendered for now
- Tailwind CSS for styling
