# Invite System Documentation

## How It Works

The LifeSet invite system uses **invite codes** that allow users to join organisations through the mobile app.

### Flow Overview

1. **Admin creates invite code** (in admin dashboard)
   - Generates a unique 6-character code (e.g., `ABC123`)
   - Sets the role (member/staff)
   - Code is stored in Firestore `organisationInvites` collection

2. **Admin shares code** with potential members
   - Can be shared via email, text, printed, or displayed at the gym
   - Codes are reusable (multiple users can use the same code)
   - Codes can be activated/deactivated

3. **User enters code** in mobile app
   - User opens LifeSet app
   - Navigates to "Join Organisation" screen
   - Enters the 6-character code
   - App calls `joinOrganisationByCode()` function

4. **User joins organisation**
   - System validates code exists and is active
   - Links user to organisation with specified role
   - User immediately gets organisation mode features

## Invite Code Structure

```typescript
{
  inviteId: string;           // Firestore document ID
  organisationId: string;     // Which organisation
  code: string;               // 6-character code (e.g., "ABC123")
  role: "member" | "staff";  // Role assigned to users who join
  active: boolean;            // Can be deactivated
  email?: string;              // Optional: for tracking
  createdBy: string;          // Admin user ID who created it
  createdAt: Timestamp;       // When it was created
}
```

## Admin Dashboard Features

### Create Invite Code
- Click "+ Create Invite Code" button
- Optional: Enter email for tracking
- Select role (member or staff)
- System generates unique code
- Code is displayed and can be copied/shared

### Manage Invite Codes
- View all invite codes for your organisation
- See code, role, status, and creation date
- Activate/Deactivate codes
- Delete codes

### Code Generation
- 6 characters: A-Z, 2-9 (excludes confusing characters like 0, O, I, 1)
- Automatically checks for duplicates
- Example codes: `ABC123`, `XY7Z89`, `MNP456`

## Mobile App Integration

The mobile app already has the join functionality built in:

```typescript
// In mobile app
import { useOrganisation } from "../hooks/useOrganisation";

const { joinByCode } = useOrganisation();

// User enters code
await joinByCode("ABC123");
// User is now linked to organisation!
```

## Security

- **Firestore Rules**: Only admins/staff can create invite codes
- **Code Validation**: Codes must be active to work
- **Role Assignment**: Users get the role specified in the invite
- **Organisation Isolation**: Codes only work for their specific organisation

## Use Cases

### Gym Membership
1. Gym creates invite code `GYM2024`
2. Prints code on membership cards
3. New members enter code when signing up
4. All members join with "member" role

### Staff Onboarding
1. Admin creates invite code `STAFF01` with role "staff"
2. Shares code with new staff member
3. Staff member enters code in app
4. Gets staff permissions immediately

### Corporate Wellness
1. Company creates invite code `CORP2024`
2. Shares via email to all employees
3. Employees enter code to join company wellness program
4. All join with "employee" role

## Future Enhancements

### Email Invites (Optional)
- Send email with invite link
- Link auto-fills code in app
- Track who was invited

### QR Code Invites
- Generate QR code from invite code
- Display at gym front desk
- Users scan to join

### Time-Limited Codes
- Set expiration date
- Auto-deactivate after date
- Useful for events or promotions

### Usage Tracking
- Track how many users joined with each code
- See which codes are most popular
- Analytics on code usage

## Best Practices

1. **Create Role-Specific Codes**
   - Separate codes for members vs staff
   - Makes it easier to manage permissions

2. **Deactivate Old Codes**
   - When changing membership structure
   - When codes are compromised

3. **Use Descriptive Emails**
   - Store email in invite for tracking
   - Helps identify who created what code

4. **Share Codes Securely**
   - Don't post codes publicly
   - Use private channels for staff codes

## Troubleshooting

### "Invalid organisation code"
- Code doesn't exist
- Code is deactivated
- Code is for different organisation

### User can't join
- Check code is active in admin dashboard
- Verify user isn't already in an organisation
- Check Firestore rules allow read access

### Code already exists
- System automatically generates new code if duplicate
- Very unlikely with 6-character codes (36^6 = 2+ billion combinations)

