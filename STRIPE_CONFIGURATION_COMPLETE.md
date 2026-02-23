# Stripe Configuration - Complete Setup

## ✅ What's Been Done

### Code Updates
- ✅ All placeholder URLs replaced with actual Firebase Functions URLs
- ✅ Widgets configured: `https://us-central1-lifeset-v2.cloudfunctions.net`
- ✅ Admin dashboard settings page configured
- ✅ Functions updated to use Firebase Functions v2 secrets
- ✅ Webhook handler configured for raw body handling

### Files Updated
- ✅ `admin-dashboard/public/widgets/memberships.html` - API URL updated
- ✅ `admin-dashboard/public/widgets/packs.html` - API URL updated
- ✅ `admin-dashboard/app/dashboard/settings/page.tsx` - Functions URL updated
- ✅ `functions/src/api/webhooks.ts` - Secrets configuration added
- ✅ `functions/src/api/checkout.ts` - Secrets configuration added
- ✅ `functions/src/api/stripe-connect.ts` - Secrets configuration added

---

## 🔧 What You Need to Do

### Step 1: Set Firebase Functions Secrets (2 minutes)

**Using Firebase CLI:**
```bash
cd functions

# Set each secret (will prompt for value)
firebase functions:secrets:set STRIPE_SECRET_KEY
# Enter: sk_live_... or sk_test_...

firebase functions:secrets:set STRIPE_CLIENT_ID
# Enter: ca_...

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Enter: whsec_...

firebase functions:secrets:set STRIPE_REDIRECT_URI
# Enter: https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback

firebase functions:secrets:set STRIPE_CONNECT_SUCCESS_URL
# Enter: https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=connected

firebase functions:secrets:set STRIPE_CONNECT_ERROR_URL
# Enter: https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=error
```

**Or use the automated script:**
```bash
cd functions
./scripts/set-env-vars.sh
```

### Step 2: Configure Stripe Dashboard (3 minutes)

1. **Stripe Connect Application:**
   - Go to https://dashboard.stripe.com → Settings → Connect
   - Create application (if not exists)
   - Add redirect URI: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback`
   - Copy Client ID (`ca_...`)

2. **Webhook Endpoint:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook`
   - Select events:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy Signing secret (`whsec_...`)

### Step 3: Deploy Functions (1 minute)

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Step 4: Test (2 minutes)

1. **Test Stripe Connect:**
   - Admin dashboard → Settings → "Connect Stripe"
   - Should redirect to Stripe → Authorize → Redirect back
   - Should show "Stripe Connected" ✅

2. **Test Webhook:**
   - Make a test purchase
   - Check Stripe Dashboard → Webhooks → Should see events
   - Check Firestore `/webhookLogs` → Should see logged events

---

## 📋 Configuration Summary

### Environment Variables (Secrets)

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → API keys |
| `STRIPE_CLIENT_ID` | `ca_...` | Stripe Dashboard → Connect → Application |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Webhooks → Endpoint |
| `STRIPE_REDIRECT_URI` | `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback` | Fixed |
| `STRIPE_CONNECT_SUCCESS_URL` | `https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=connected` | Your dashboard URL |
| `STRIPE_CONNECT_ERROR_URL` | `https://YOUR_DASHBOARD_URL/dashboard/settings?stripe=error` | Your dashboard URL |

### Stripe Dashboard URLs

| Setting | URL |
|---------|-----|
| Connect Redirect URI | `https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback` |
| Webhook Endpoint | `https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook` |

### Function Endpoints

All functions are available at:
```
https://us-central1-lifeset-v2.cloudfunctions.net/{functionName}
```

**Available Functions:**
- `authorizeStripeConnect`
- `stripeConnectCallback`
- `disconnectStripe`
- `createMembershipCheckoutSession`
- `createPackCheckoutSession`
- `stripeWebhook`
- `getPublicMemberships`
- `getPublicPacks`

---

## 🎯 Quick Command Reference

```bash
# Set all secrets at once (interactive)
cd functions
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_CLIENT_ID
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_REDIRECT_URI
firebase functions:secrets:set STRIPE_CONNECT_SUCCESS_URL
firebase functions:secrets:set STRIPE_CONNECT_ERROR_URL

# Build and deploy
npm run build
firebase deploy --only functions

# View function logs
firebase functions:log

# List all functions
firebase functions:list
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All secrets set: `firebase functions:secrets:access STRIPE_SECRET_KEY`
- [ ] Functions deployed: `firebase functions:list`
- [ ] Stripe Connect redirect URI matches function URL
- [ ] Webhook endpoint URL matches function URL
- [ ] Test Stripe Connect flow works
- [ ] Test webhook receives events

---

## 🚨 Important Notes

1. **Region:** If your functions are deployed to a different region, update:
   - Widget URLs
   - Settings page URL
   - Stripe redirect URI
   - Webhook endpoint URL

2. **Test vs Live:** 
   - Use `sk_test_...` for testing
   - Use `sk_live_...` for production
   - Update all keys when switching

3. **Webhook Signature:**
   - Must use raw request body for signature verification
   - Firebase Functions v2 handles this automatically
   - If verification fails, check webhook secret matches

4. **Dashboard URL:**
   - Replace `YOUR_DASHBOARD_URL` with your actual deployed dashboard URL
   - Can be localhost for testing: `http://localhost:3000`

---

## 📞 Need Help?

- **Stripe Docs:** https://stripe.com/docs/connect
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **Detailed Guide:** See [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)

---

**All code is ready! Just set the secrets and deploy.** 🚀

