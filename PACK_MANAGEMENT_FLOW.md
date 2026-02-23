# Pack Management - Customer Flow

## Overview

**Packs** are prepaid bundles of classes that members can purchase. They're different from **Memberships** (which are recurring subscriptions).

### Example Packs:
- 10-Class Pack - $150 (valid for 90 days)
- 20-Class Pack - $280 (valid for 90 days)
- Monthly Unlimited - $99/month (unlimited classes)

---

## Customer Flow

### 1. Admin Creates Pack (Admin Dashboard)

**Admin actions:**
- Go to Pack Management page
- Click "Create Pack"
- Fill in:
  - Name: "10-Class Pack"
  - Description: "Perfect for casual gym-goers"
  - Price: $150
  - Class Count: 10
  - Validity Period: 90 days
  - Active: Yes

**Result:**
- Pack is created in Firestore `packs` collection
- Pack appears in mobile app and web widgets
- Members can now purchase it

---

### 2. Member Discovers Pack (Mobile App or Web Widget)

**Mobile App:**
- Member opens app
- Navigates to "Packs" or "Memberships" section
- Sees available packs:
  - 10-Class Pack - $150
  - 20-Class Pack - $280
  - etc.

**Web Widget:**
- Gym embeds widget on their website
- Visitors see available packs
- Can purchase directly from website

---

### 3. Member Purchases Pack

**Option A: Mobile App Purchase**
1. Member taps on pack
2. Sees pack details (price, class count, validity)
3. Taps "Purchase"
4. Payment via Stripe/GoCardless
5. Pack added to their account

**Option B: Web Widget Purchase**
1. Visitor clicks pack on website
2. Redirected to payment page
3. Completes payment
4. Receives email with app download link
5. Pack linked to their account when they sign up

**Option C: Admin Manual Assignment**
1. Member pays at front desk
2. Admin goes to Pack Management
3. Manually assigns pack to member
4. Pack appears in member's app

---

### 4. Pack Added to Member Account

**What happens:**
- Pack purchase record created in Firestore:
  ```typescript
  {
    userId: "member123",
    packId: "pack456",
    organisationId: "org789",
    classesRemaining: 10,
    expiresAt: "2024-04-01",
    purchasedAt: "2024-01-01",
    status: "active"
  }
  ```
- Member sees pack in app: "10-Class Pack - 10 classes remaining"
- Pack is active and ready to use

---

### 5. Member Books Class Using Pack

**Booking Flow:**
1. Member browses classes in app
2. Taps "Book Class"
3. System checks:
   - ✅ Has active membership? → Book directly
   - ✅ Has active pack with classes remaining? → Book using pack
   - ❌ No membership or pack? → Show "Purchase Membership" or "Buy Pack"

4. If pack available:
   - Booking created
   - **1 class deducted from pack** (classesRemaining: 10 → 9)
   - Member sees: "9 classes remaining"

5. Member attends class
6. Check-in via QR code (optional)
7. Class marked as completed

---

### 6. Pack Usage Tracking

**In Mobile App:**
- Member sees: "10-Class Pack - 7 classes remaining"
- Shows expiration date: "Expires: April 1, 2024"
- Can view booking history

**In Admin Dashboard:**
- Admin sees all pack purchases
- Can view:
  - Who bought which pack
  - How many classes used
  - Remaining classes
  - Expiration dates

---

### 7. Pack Expiration

**When pack expires:**
- Unused classes are lost (or can be extended - configurable)
- Member needs to purchase new pack
- System shows: "Pack expired - Buy new pack?"

**Extension Policy:**
- Option 1: Strict - Classes expire, no extension
- Option 2: Flexible - Admin can extend expiration
- Option 3: Rollover - Unused classes transfer to new pack

---

## Data Structure

### Pack Definition (Admin creates)
```typescript
{
  packId: string;
  organisationId: string;
  name: string;              // "10-Class Pack"
  description: string;      // "Perfect for casual gym-goers"
  price: number;            // 150.00
  currency: string;         // "USD"
  classCount: number;       // 10
  validityDays: number;    // 90
  active: boolean;          // true
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### User Pack Purchase (Created when member buys)
```typescript
{
  userId: string;
  packId: string;
  organisationId: string;
  classesRemaining: number;  // Starts at 10, decreases with bookings
  expiresAt: Date;          // purchasedAt + validityDays
  purchasedAt: Date;
  status: "active" | "expired" | "used";  // "used" when classesRemaining = 0
  createdAt: Timestamp;
}
```

---

## Booking Logic

When member tries to book a class:

```typescript
// Pseudo-code
async function canBookClass(userId, classId) {
  // Check 1: Active membership
  const membership = await getActiveMembership(userId);
  if (membership) {
    return { canBook: true, reason: "active_membership" };
  }
  
  // Check 2: Active pack with classes remaining
  const pack = await getActivePack(userId);
  if (pack && pack.classesRemaining > 0) {
    return { canBook: true, reason: "pack", packId: pack.packId };
  }
  
  // Check 3: No access
  return { 
    canBook: false, 
    reason: "no_access",
    message: "Purchase a membership or pack to book classes"
  };
}
```

---

## Payment Integration

### Stripe Connect (Recommended)
- Gym has Stripe account
- Payments go directly to gym
- LifeSet takes platform fee (if applicable)
- Webhook confirms payment
- Pack automatically activated

### GoCardless (Direct Debit)
- For recurring pack purchases
- Member authorizes direct debit
- Payment processed automatically
- Pack activated on payment confirmation

### Manual (Admin Assignment)
- Member pays cash/card at front desk
- Admin manually creates pack purchase
- No payment processing needed
- Pack immediately active

---

## Admin Dashboard Features Needed

1. **Pack Management Page**
   - Create/edit/delete packs
   - View all packs (active/inactive)
   - Set pricing and validity

2. **Pack Purchases View**
   - See who bought which packs
   - Track usage (classes remaining)
   - View expiration dates
   - Manual pack assignment

3. **Pack Analytics**
   - Most popular packs
   - Revenue from packs
   - Average classes used per pack
   - Expiration rates

---

## Mobile App Features Needed

1. **Pack Purchase Screen**
   - Browse available packs
   - View details (price, classes, validity)
   - Purchase via Stripe/GoCardless
   - View purchase history

2. **Pack Status Display**
   - Show active packs
   - Display classes remaining
   - Show expiration date
   - Link to buy more packs

3. **Booking Integration**
   - Check pack availability before booking
   - Auto-deduct from pack when booking
   - Show which pack was used for booking

---

## Questions to Decide

1. **Where can members purchase packs?**
   - [ ] Mobile app only
   - [ ] Web widget only
   - [ ] Both mobile app and web widget
   - [ ] Admin dashboard (manual assignment)

2. **Payment method:**
   - [ ] Stripe Connect (gym receives payment)
   - [ ] GoCardless (direct debit)
   - [ ] Manual (admin marks as paid)
   - [ ] All of the above

3. **Pack expiration:**
   - [ ] Strict (unused classes expire)
   - [ ] Flexible (admin can extend)
   - [ ] Rollover (transfer to new pack)

4. **Pack usage:**
   - [ ] Automatic (deducted on booking)
   - [ ] Manual (admin marks as used)
   - [ ] Both (auto-deduct, admin can override)

---

## Next Steps

1. Decide on purchase flow (mobile app, web widget, or both)
2. Choose payment integration (Stripe, GoCardless, or manual)
3. Build pack management page in admin dashboard
4. Build pack purchase flow in mobile app (if needed)
5. Build web widget for pack purchases (if needed)
6. Integrate pack checking into booking flow

