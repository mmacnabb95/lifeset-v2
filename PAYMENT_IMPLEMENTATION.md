# Payment & Access Control Implementation

## ✅ Completed Features

### 1. Stripe Connect OAuth Flow
**Files:**
- `functions/src/config/stripe.ts` - Stripe configuration
- `functions/src/api/stripe-connect.ts` - OAuth endpoints
- `admin-dashboard/app/dashboard/settings/page.tsx` - UI for connecting/disconnecting

**Endpoints:**
- `GET /authorizeStripeConnect` - Initiates OAuth flow
- `GET /stripeConnectCallback` - Handles OAuth callback
- `POST /disconnectStripe` - Disconnects Stripe account

**Features:**
- Admin-only Stripe connection
- OAuth state verification
- Stores `stripeAccountId` in organisation document
- UI shows connection status

### 2. Checkout Session Creation
**Files:**
- `functions/src/api/checkout.ts`

**Endpoints:**
- `POST /createMembershipCheckoutSession` - Creates membership checkout
- `POST /createPackCheckoutSession` - Creates pack checkout

**Features:**
- Uses organisation's Stripe Connect account
- Creates pending purchase records
- Returns Stripe Checkout URL
- Supports subscriptions (memberships) and one-time payments (packs)

### 3. Stripe Webhook Handlers
**Files:**
- `functions/src/api/webhooks.ts`

**Endpoint:**
- `POST /stripeWebhook` - Handles all Stripe webhook events

**Events Handled:**
- `checkout.session.completed` - Creates membership/pack purchase
- `invoice.payment_succeeded` - Activates membership
- `invoice.payment_failed` - Marks membership as past_due
- `customer.subscription.updated` - Updates membership status
- `customer.subscription.deleted` - Cancels membership

**Features:**
- Webhook signature verification
- Event logging to Firestore
- Automatic membership/pack activation
- Status updates based on payment events

### 4. Public Purchase Widgets
**Files:**
- `admin-dashboard/public/widgets/memberships.html`
- `admin-dashboard/public/widgets/packs.html`
- `functions/src/api/public-data.ts`

**Endpoints:**
- `GET /getPublicMemberships` - Returns active membership tiers
- `GET /getPublicPacks` - Returns active packs

**Features:**
- No authentication required
- Embeddable in gym websites
- Displays products with pricing
- Redirects to Stripe Checkout
- Success/failure handling

### 5. Booking Enforcement
**Files:**
- `functions/src/api/booking-enforcement.ts`

**Functions:**
- `canUserBookClass()` - Checks if user can book
- `createBookingWithAccessCheck()` - Creates booking with validation

**Validation:**
- Active membership OR active pack with remaining classes
- Class capacity check
- Duplicate booking prevention
- Automatic pack class decrement

### 6. QR Check-in Validation
**Files:**
- `functions/src/api/qr-checkin.ts` (updated)

**Endpoint:**
- `POST /validateQRCheckIn` (existing, enhanced)

**Features:**
- Validates membership OR pack access
- Decrements pack classes on check-in
- Marks pack as "used" when empty
- Logs attendance

### 7. Firestore Structure Updates
**New Collections:**
- `/pendingPurchases` - Tracks pending checkout sessions
- `/webhookLogs` - Logs webhook events for debugging

**Updated Collections:**
- `/memberships` - Now stores both tiers (no userId) and purchases (with userId)
- `/packPurchases` - Stores pack purchases with remaining classes
- `/organisations` - Added `stripeAccountId` field

**Security Rules:**
- Added rules for `pendingPurchases` and `webhookLogs`
- Members can read their own purchases
- Staff/admin can manage all purchases

### 8. Admin Dashboard UI
**Files:**
- `admin-dashboard/app/dashboard/settings/page.tsx` (updated)

**Features:**
- Stripe connection status display
- Connect/Disconnect Stripe buttons
- Shows Stripe account ID (truncated)

---

## 🔧 Required Configuration

### Environment Variables (Firebase Functions)

Set these in Firebase Console → Functions → Configuration:

```bash
STRIPE_SECRET_KEY=sk_live_... # Your Stripe secret key
STRIPE_CLIENT_ID=ca_... # Stripe Connect client ID
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret
STRIPE_REDIRECT_URI=https://YOUR_DOMAIN/dashboard/settings?stripe=connected
STRIPE_CONNECT_SUCCESS_URL=https://YOUR_DOMAIN/dashboard/settings?stripe=connected
STRIPE_CONNECT_ERROR_URL=https://YOUR_DOMAIN/dashboard/settings?stripe=error
```

### Stripe Dashboard Setup

1. **Create Stripe Connect Application:**
   - Go to Stripe Dashboard → Settings → Connect
   - Create a Connect application
   - Copy the Client ID (`ca_...`)
   - Set redirect URI: `https://YOUR_FIREBASE_FUNCTIONS_URL/stripeConnectCallback`

2. **Configure Webhook Endpoint:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://YOUR_FIREBASE_FUNCTIONS_URL/stripeWebhook`
   - Select events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook signing secret (`whsec_...`)

3. **Update Widget URLs:**
   - Edit `admin-dashboard/public/widgets/memberships.html`
   - Replace `YOUR_FIREBASE_PROJECT` with your actual Firebase Functions URL
   - Edit `admin-dashboard/public/widgets/packs.html`
   - Replace `YOUR_FIREBASE_PROJECT` with your actual Firebase Functions URL

4. **Update Admin Dashboard Settings:**
   - Edit `admin-dashboard/app/dashboard/settings/page.tsx`
   - Replace `YOUR_REGION-YOUR_PROJECT` with your actual Firebase Functions URL

---

## 📋 Implementation Checklist

### Backend (Cloud Functions)
- [x] Stripe configuration
- [x] Stripe Connect OAuth endpoints
- [x] Checkout session creation
- [x] Webhook handlers
- [x] Public data endpoints
- [x] Booking enforcement utilities
- [x] QR check-in validation (enhanced)
- [ ] **TODO:** Set environment variables
- [ ] **TODO:** Deploy functions
- [ ] **TODO:** Configure webhook endpoint in Stripe

### Admin Dashboard
- [x] Stripe connection UI
- [x] Settings page updates
- [ ] **TODO:** Update API URLs with actual Firebase Functions URLs
- [ ] **TODO:** Test Stripe Connect flow

### Public Widgets
- [x] Membership purchase widget
- [x] Pack purchase widget
- [ ] **TODO:** Update API URLs
- [ ] **TODO:** Test widget functionality
- [ ] **TODO:** Deploy widgets to hosting

### Mobile App Integration (Future)
- [ ] Read-only membership status display
- [ ] Read-only pack balance display
- [ ] Deep links to purchase widgets
- [ ] Booking with access validation

---

## 🔄 Payment Flow Diagrams

### Membership Purchase Flow
```
1. User visits widget → /widgets/memberships?organisationId=xxx
2. Widget calls getPublicMemberships → Returns active tiers
3. User clicks "Purchase" → Calls createMembershipCheckoutSession
4. Function creates Stripe Checkout session → Returns URL
5. User redirected to Stripe Checkout → Completes payment
6. Stripe webhook → checkout.session.completed
7. Webhook handler → Creates membership document in Firestore
8. User redirected back → Success page
```

### Pack Purchase Flow
```
1. User visits widget → /widgets/packs?organisationId=xxx
2. Widget calls getPublicPacks → Returns active packs
3. User clicks "Purchase" → Calls createPackCheckoutSession
4. Function creates Stripe Checkout session → Returns URL
5. User redirected to Stripe Checkout → Completes payment
6. Stripe webhook → checkout.session.completed
7. Webhook handler → Creates packPurchase document in Firestore
8. User redirected back → Success page
```

### Booking Flow (with Access Control)
```
1. User attempts to book class
2. App calls canUserBookClass() → Checks:
   - Active membership OR active pack with classes
   - Class capacity
   - No duplicate booking
3. If valid → createBookingWithAccessCheck()
4. Creates booking document
5. If using pack → Decrements classesRemaining
6. If pack empty → Marks as "used"
```

### QR Check-in Flow
```
1. Admin scans QR code → Calls validateQRCheckIn
2. Function validates:
   - QR code matches user
   - Active membership OR active pack with classes
3. If valid:
   - Logs attendance
   - If using pack → Decrements classesRemaining
   - If pack empty → Marks as "used"
4. Returns success/failure
```

---

## 🚨 Important Notes

### Apple Compliance
- ✅ **No payments processed in iOS app** - All payments via Stripe Checkout (web)
- ✅ **App only displays status** - Read-only membership/pack data
- ✅ **Deep links allowed** - App can link to web checkout (real-world services)

### Security
- ✅ Webhook signature verification
- ✅ Admin-only Stripe connection
- ✅ Firestore rules enforce access control
- ✅ User can only see their own purchases

### Data Isolation
- ✅ Each gym's Stripe account isolated
- ✅ Memberships/packs scoped to organisation
- ✅ No cross-organisation data access

---

## 🧪 Testing Checklist

### Stripe Connect
- [ ] Admin can initiate OAuth flow
- [ ] OAuth callback stores stripeAccountId
- [ ] Admin can disconnect Stripe
- [ ] Connection status displays correctly

### Checkout Sessions
- [ ] Membership checkout session created
- [ ] Pack checkout session created
- [ ] Pending purchase records created
- [ ] Checkout URLs redirect correctly

### Webhooks
- [ ] Webhook signature verified
- [ ] Membership created on successful payment
- [ ] Pack purchase created on successful payment
- [ ] Membership status updates on subscription events
- [ ] Failed payments mark membership as past_due

### Booking Enforcement
- [ ] User with active membership can book
- [ ] User with active pack can book
- [ ] Pack classes decrement on booking
- [ ] User without access cannot book
- [ ] Full classes cannot be booked

### QR Check-in
- [ ] Valid QR code with membership → Success
- [ ] Valid QR code with pack → Success + decrement
- [ ] Invalid QR code → Failure
- [ ] No access → Failure

### Public Widgets
- [ ] Widgets load membership tiers/packs
- [ ] Purchase button creates checkout session
- [ ] Redirect to Stripe Checkout works
- [ ] Success page displays after payment

---

## 📝 Next Steps

1. **Set Environment Variables:**
   - Configure all Stripe keys in Firebase Functions
   - Set redirect URIs

2. **Deploy Functions:**
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

3. **Configure Stripe Dashboard:**
   - Set up Connect application
   - Configure webhook endpoint
   - Test webhook delivery

4. **Update URLs:**
   - Replace placeholder URLs in widgets
   - Update admin dashboard API calls

5. **Test End-to-End:**
   - Connect Stripe account
   - Create test membership/pack
   - Complete test purchase
   - Verify Firestore updates

6. **Mobile App Integration:**
   - Add membership/pack status display
   - Add deep links to purchase widgets
   - Integrate booking enforcement

---

## 🔗 Related Documentation

- [Payment Architecture](./PAYMENT_ARCHITECTURE.md)
- [Multi-Tenant Architecture](./MULTI_TENANT_ARCHITECTURE.md)
- [Invite System](./INVITE_SYSTEM.md)

---

All payment infrastructure is now in place and ready for configuration and testing!

