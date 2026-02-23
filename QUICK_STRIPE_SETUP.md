# Quick Stripe Setup - Step by Step

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Stripe Keys (2 min)

1. Go to https://dashboard.stripe.com
2. **API Keys:**
   - Developers → API keys → Copy **Secret key** (`sk_live_...` or `sk_test_...`)
3. **Connect:**
   - Settings → Connect → Create application
   - Add redirect URI: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
   - Copy **Client ID** (`ca_...`)
4. **Webhooks:**
   - Developers → Webhooks → Add endpoint
   - URL: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy **Signing secret** (`whsec_...`)

### Step 2: Set Environment Variables (1 min)

**Option A: Firebase Console (Easiest)**
1. Go to https://console.firebase.google.com
2. Select project: **lifeset-v2**
3. Functions → Configuration → Add variable:
   ```
   STRIPE_SECRET_KEY = sk_live_YOUR_KEY
   STRIPE_CLIENT_ID = ca_YOUR_CLIENT_ID
   STRIPE_WEBHOOK_SECRET = whsec_YOUR_SECRET
   STRIPE_REDIRECT_URI = https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback
   STRIPE_CONNECT_SUCCESS_URL = https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=connected
   STRIPE_CONNECT_ERROR_URL = https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=error
   ```

**Option B: Firebase CLI**
```bash
cd functions
./scripts/set-env-vars.sh
# Follow prompts
```

### Step 3: Deploy Functions (1 min)

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Step 4: Test (1 min)

1. Log into admin dashboard
2. Go to Settings
3. Click "Connect Stripe"
4. Authorize in Stripe
5. Should redirect back with "Stripe Connected" ✅

---

## ✅ Done!

Your payment system is now configured. See [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) for detailed troubleshooting.

