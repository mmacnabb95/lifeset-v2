# Configuration Checklist

## ✅ Quick Configuration Steps

### 1. Stripe Dashboard Setup

- [ ] **Get Stripe Secret Key**
  - Go to https://dashboard.stripe.com → Developers → API keys
  - Copy Secret key: `sk_live_...` or `sk_test_...`

- [ ] **Create Stripe Connect Application**
  - Settings → Connect → Create application
  - Add redirect URI: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
  - Copy Client ID: `ca_...`

- [ ] **Create Webhook Endpoint**
  - Developers → Webhooks → Add endpoint
  - URL: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook`
  - Select events:
    - ✅ `checkout.session.completed`
    - ✅ `invoice.payment_succeeded`
    - ✅ `invoice.payment_failed`
    - ✅ `customer.subscription.updated`
    - ✅ `customer.subscription.deleted`
  - Copy Signing secret: `whsec_...`

### 2. Firebase Functions Environment Variables

**Using Firebase CLI (Recommended):**
```bash
cd functions

# Set secrets (will prompt for values)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_CLIENT_ID
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_REDIRECT_URI
firebase functions:secrets:set STRIPE_CONNECT_SUCCESS_URL
firebase functions:secrets:set STRIPE_CONNECT_ERROR_URL
```

**Or use the script:**
```bash
cd functions
./scripts/set-env-vars.sh
```

**Values to set:**
- `STRIPE_SECRET_KEY` = Your Stripe secret key
- `STRIPE_CLIENT_ID` = Your Stripe Connect client ID
- `STRIPE_WEBHOOK_SECRET` = Your webhook signing secret
- `STRIPE_REDIRECT_URI` = `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
- `STRIPE_CONNECT_SUCCESS_URL` = `https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=connected`
- `STRIPE_CONNECT_ERROR_URL` = `https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=error`

### 3. Update URLs in Code

**Already Updated:**
- ✅ Widget URLs: `admin-dashboard/public/widgets/memberships.html` (Line 121)
- ✅ Widget URLs: `admin-dashboard/public/widgets/packs.html` (Line 112)
- ✅ Settings page: `admin-dashboard/app/dashboard/settings/page.tsx`

**If your functions are in a different region**, update:
- Widgets: Change `us-central1` to your region
- Settings page: Change `us-central1` to your region

### 4. Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 5. Test Configuration

- [ ] **Test Stripe Connect:**
  1. Log into admin dashboard
  2. Go to Settings
  3. Click "Connect Stripe"
  4. Should redirect to Stripe OAuth
  5. Authorize connection
  6. Should redirect back with "Stripe Connected" status

- [ ] **Test Webhook:**
  1. Complete a test purchase
  2. Check Stripe Dashboard → Webhooks → Your endpoint
  3. Should see `checkout.session.completed` event
  4. Check Firestore `/webhookLogs` for logged events

---

## 📝 Current Configuration

**Project ID:** `lifeset-v2`  
**Default Region:** `us-central1`  
**Functions Base URL:** `https://us-central1-lifeset-v2.cloudfunctions.net`

**Function Endpoints:**
- `https://us-central1-lifeset-v2.cloudfunctions.net/authorizeStripeConnect`
- `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
- `https://us-central1-lifeset-v2.cloudfunctions.net/disconnectStripe`
- `https://us-central1-lifeset-v2.cloudfunctions.net/createMembershipCheckoutSession`
- `https://us-central1-lifeset-v2.cloudfunctions.net/createPackCheckoutSession`
- `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook`
- `https://us-central1-lifeset-v2.cloudfunctions.net/getPublicMemberships`
- `https://us-central1-lifeset-v2.cloudfunctions.net/getPublicPacks`

---

## 🔍 Verification

After configuration, verify:

1. **Environment Variables:**
   ```bash
   firebase functions:secrets:access STRIPE_SECRET_KEY
   # Should show your key (first 20 chars)
   ```

2. **Functions Deployed:**
   ```bash
   firebase functions:list
   # Should show all functions
   ```

3. **Webhook Endpoint:**
   - Check Stripe Dashboard → Webhooks
   - Endpoint should show as "Active"
   - Test by sending a test webhook

---

## 📚 Documentation

- [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) - Detailed setup guide
- [QUICK_STRIPE_SETUP.md](./QUICK_STRIPE_SETUP.md) - Quick 5-minute setup
- [PAYMENT_IMPLEMENTATION.md](./PAYMENT_IMPLEMENTATION.md) - Implementation details

---

All URLs are now configured with your project ID. Just set the environment variables and deploy! 🚀

