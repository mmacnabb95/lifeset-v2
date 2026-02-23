# Admin Dashboard Setup Guide

## Quick Start

### 1. Create Admin User

Run the setup script:

```bash
node scripts/setup-admin-user.js
```

The script will prompt you for:
- **Email**: Your admin email (e.g., `admin@test.com`)
- **Password**: Your password (min 6 characters)
- **Create organisation?**: Type `y` to create a test organisation, or `n` to skip

### 2. Start Admin Dashboard

```bash
cd admin-dashboard
npm run dev
```

### 3. Login

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter the email and password you created
3. You should see the dashboard!

## Alternative: Non-Interactive Setup

You can also provide all values as command-line arguments:

```bash
node scripts/setup-admin-user.js --email admin@test.com --password test123456 --create-org
```

## What the Script Does

1. ✅ Creates user in Firebase Authentication
2. ✅ Creates user document in Firestore with:
   - `role: "admin"`
   - `email`, `username`, `xp`, `level`, `streak`
   - All required fields
3. ✅ Optionally creates a test organisation
4. ✅ Links user to organisation (if created)

## Troubleshooting

### "Cannot find module 'firebase-admin'"
Already installed! If you see this, run:
```bash
npm install firebase-admin --save-dev
```

### "Service account key not found"
Make sure `scripts/serviceAccountKey.json` exists. This is your Firebase service account credentials file.

### "Permission denied"
Your service account needs:
- Firebase Authentication Admin permissions
- Cloud Firestore User permissions

Check in Firebase Console → IAM & Admin → Service Accounts

### User already exists
The script will ask if you want to update the existing user. Type `y` to update the Firestore document with admin role.

## Next Steps

After logging in:
1. ✅ Dashboard overview with stats
2. 🚧 Build out member management
3. 🚧 Build out schedule management
4. 🚧 Build out membership management
5. 🚧 Add organisation settings

## Testing the Full Flow

1. Create admin user (script)
2. Login to dashboard
3. Create organisation via dashboard (coming soon)
4. Add members
5. Create classes/schedule
6. Test mobile app with organisation mode

