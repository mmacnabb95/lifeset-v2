# Stripe Setup Guide

Complete guide for configuring Stripe Connect and payment processing.

## 📋 Prerequisites

- Stripe account (create at https://stripe.com)
- Firebase project with Functions enabled
- Admin dashboard deployed (or local URL for testing)

---

## Step 1: Stripe Dashboard Configuration

### 1.1 Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_live_` for production or `sk_test_` for testing)
4. Keep this secure - you'll need it for environment variables

### 1.2 Create Stripe Connect Application

1. Go to **Settings** → **Connect** in Stripe Dashboard
2. Click **"Get started"** or **"Create application"**
3. Fill in:
   - **Application name:** LifeSet Platform
   - **Application description:** Multi-tenant gym management platform
4. Under **Redirect URIs**, add:
   ```
   https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback
   ```
   (Replace `us-central1-lifeset-v2` with your actual Firebase Functions URL if different)
5. Click **Save**
6. Copy the **Client ID** (starts with `ca_...`)

### 1.3 Configure Webhook Endpoint

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook
   ```
   (Replace with your actual Firebase Functions URL if different)
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
   - Click on the webhook endpoint → **"Reveal"** → Copy secret

---

## Step 2: Set Firebase Functions Environment Variables

### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **lifeset-v2**
3. Navigate to **Functions** → **Configuration**
4. Click **"Add variable"** for each:

   ```
   STRIPE_SECRET_KEY = sk_live_YOUR_SECRET_KEY
   STRIPE_CLIENT_ID = ca_YOUR_CLIENT_ID
   STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET
   STRIPE_REDIRECT_URI = https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback
   STRIPE_CONNECT_SUCCESS_URL = https://YOUR_ADMIN_DASHBOARD_URL/dashboard/settings?stripe=connected
   STRIPE_CONNECT_ERROR_URL = https://YOUR_ADMIN_DASHBOARD_URL/dashboard/settings?stripe=error
   ```

5. Replace placeholders:
   - `YOUR_SECRET_KEY` → Your Stripe secret key
   - `YOUR_CLIENT_ID` → Your Stripe Connect client ID
   - `YOUR_WEBHOOK_SECRET` → Your webhook signing secret
   - `YOUR_ADMIN_DASHBOARD_URL` → Your deployed admin dashboard URL (e.g., `https://lifeset-admin.vercel.app`)

### Option B: Using Firebase CLI

```bash
cd functions

# Set environment variables
firebase functions:config:set \
  stripe.secret_key="sk_live_YOUR_SECRET_KEY" \
  stripe.client_id="ca_YOUR_CLIENT_ID" \
  stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET" \
  stripe.redirect_uri="https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback" \
  stripe.connect_success_url="https://YOUR_ADMIN_DASHBOARD_URL/dashboard/settings?stripe=connected" \
  stripe.connect_error_url="https://YOUR_ADMIN_DASHBOARD_URL/dashboard/settings?stripe=error"

# Note: For Firebase Functions v2, use:
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_CLIENT_ID
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_REDIRECT_URI
firebase functions:secrets:set STRIPE_CONNECT_SUCCESS_URL
firebase functions:secrets:set STRIPE_CONNECT_ERROR_URL
```

**Note:** Firebase Functions v2 uses secrets instead of config. Use:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# Enter value when prompted
```

---

## Step 3: Update Code URLs

### 3.1 Update Widget URLs

The widgets are already configured with the default Firebase Functions URL:
- `admin-dashboard/public/widgets/memberships.html` - Line 121
- `admin-dashboard/public/widgets/packs.html` - Line 112

**If your functions are in a different region**, update:
```javascript
const API_BASE = 'https://YOUR_REGION-lifeset-v2.cloudfunctions.net';
```

Common regions:
- `us-central1` (default)
- `us-east1`
- `europe-west1`
- `asia-northeast1`

### 3.2 Update Admin Dashboard Settings

The settings page is already configured:
- `admin-dashboard/app/dashboard/settings/page.tsx` - Lines with `functionsBaseUrl`

**If your functions are in a different region**, update the `functionsBaseUrl` variable.

---

## Step 4: Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

After deployment, note the function URLs:
- `https://us-central1-lifeset-v2.cloudfunctions.net/authorizeStripeConnect`
- `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
- `https://us-central1-lifeset-v2.cloudfunctions.net/disconnectStripe`
- `https://us-central1-lifeset-v2.cloudfunctions.net/createMembershipCheckoutSession`
- `https://us-central1-lifeset-v2.cloudfunctions.net/createPackCheckoutSession`
- `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook`
- `https://us-central1-lifeset-v2.cloudfunctions.net/getPublicMemberships`
- `https://us-central1-lifeset-v2.cloudfunctions.net/getPublicPacks`

---

## Step 5: Update Stripe Connect Redirect URI

After deploying functions, update the redirect URI in Stripe Dashboard:

1. Go to **Settings** → **Connect** → Your application
2. Update **Redirect URI** to match your deployed function:
   ```
   https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback
   ```
3. Save

---

## Step 6: Test the Integration

### 6.1 Test Stripe Connect

1. Log into admin dashboard
2. Go to **Settings**
3. Click **"Connect Stripe"**
4. You should be redirected to Stripe OAuth
5. Authorize the connection
6. You should be redirected back to settings with "Stripe Connected" status

### 6.2 Test Checkout (Test Mode)

1. Create a test membership tier in admin dashboard
2. Visit widget: `/widgets/memberships?organisationId=YOUR_ORG_ID&userId=YOUR_USER_ID`
3. Click "Purchase Membership"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout
6. Check Firestore:
   - `/memberships` should have a new document with `userId`
   - `/pendingPurchases` should show completed purchase

### 6.3 Test Webhook

1. Complete a test purchase
2. Check Stripe Dashboard → **Developers** → **Webhooks** → Your endpoint
3. View webhook events - should see `checkout.session.completed`
4. Check Firestore `/webhookLogs` for logged events

---

## 🔍 Troubleshooting

### Functions Not Deploying

```bash
# Check Firebase CLI is logged in
firebase login

# Check project is set
firebase use lifeset-v2

# Build and deploy
cd functions
npm run build
firebase deploy --only functions
```

### Webhook Not Receiving Events

1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret matches environment variable
3. Check function logs: `firebase functions:log`
4. Test webhook manually in Stripe Dashboard → **Send test webhook**

### Stripe Connect OAuth Failing

1. Verify redirect URI matches exactly in Stripe Dashboard
2. Check `STRIPE_CLIENT_ID` is correct
3. Check `STRIPE_REDIRECT_URI` matches deployed function URL
4. Check function logs for errors

### Environment Variables Not Loading

For Firebase Functions v2, use secrets:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# Enter value when prompted
```

Then update code to access:
```typescript
// In functions/src/config/stripe.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});
```

---

## 📝 Quick Reference

### Environment Variables Checklist

- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_CLIENT_ID` - Stripe Connect client ID
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `STRIPE_REDIRECT_URI` - OAuth callback URL
- [ ] `STRIPE_CONNECT_SUCCESS_URL` - Success redirect
- [ ] `STRIPE_CONNECT_ERROR_URL` - Error redirect

### Stripe Dashboard Checklist

- [ ] Created Connect application
- [ ] Set redirect URI
- [ ] Copied client ID
- [ ] Created webhook endpoint
- [ ] Selected webhook events
- [ ] Copied webhook signing secret

### Code Updates Checklist

- [ ] Widget URLs updated (if different region)
- [ ] Settings page URLs updated (if different region)
- [ ] Functions deployed
- [ ] Webhook URL matches deployed function

---

## 🚀 Production Checklist

Before going live:

- [ ] Switch to Stripe **Live mode** (not test mode)
- [ ] Update all API keys to live keys
- [ ] Test with real card (small amount)
- [ ] Verify webhooks work in production
- [ ] Test Stripe Connect with real gym account
- [ ] Monitor function logs for errors
- [ ] Set up Stripe Dashboard alerts

---

## 📞 Support

- Stripe Documentation: https://stripe.com/docs/connect
- Firebase Functions: https://firebase.google.com/docs/functions
- Stripe Support: https://support.stripe.com

---

All set! Your payment system is ready to process real payments. 🎉

