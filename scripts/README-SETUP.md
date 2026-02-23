# Admin User Setup Script

## Quick Setup

Run the setup script to create a test admin user:

```bash
node scripts/setup-admin-user.js
```

The script will:
1. Prompt you for email and password
2. Create the user in Firebase Authentication
3. Create the user document in Firestore with `role: "admin"`
4. Optionally create a test organisation

## Command Line Options

You can also provide email and password as arguments:

```bash
node scripts/setup-admin-user.js --email admin@test.com --password test123456
```

To automatically create an organisation:

```bash
node scripts/setup-admin-user.js --email admin@test.com --password test123456 --create-org
```

## What Gets Created

### Authentication User
- Email/password authentication
- Email verified automatically

### Firestore User Document
- `uid`: User ID from Authentication
- `email`: User email
- `username`: Derived from email
- `role`: "admin"
- `xp`: 0
- `level`: 1
- `streak`: 0
- `hasCompletedOnboarding`: true

### Optional: Organisation
- Test organisation with default settings
- User automatically linked to organisation

## Troubleshooting

### "Service account key not found"
Make sure `scripts/serviceAccountKey.json` exists. This file should contain your Firebase service account credentials.

### "User already exists"
The script will ask if you want to update the existing user. Say "y" to update the Firestore document.

### "Permission denied"
Make sure your service account has the following permissions:
- Firebase Authentication Admin
- Cloud Firestore User

## After Setup

1. Start the admin dashboard:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

2. Login at http://localhost:3000 with the credentials you created

3. You should see the dashboard!

