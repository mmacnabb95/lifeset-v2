# Stripe Connect Webhook Setup Guide

## The Problem

With Stripe Connect, checkout sessions created on **connected accounts** (gym's Stripe account) send webhooks to the **connected account**, not your platform account. Your current webhook is configured for "Events from: Your account" only.

## Solution: Create a Connect Webhook Endpoint

According to [Stripe's Connect webhook documentation](https://docs.stripe.com/connect/webhooks), you need to create a separate webhook endpoint that listens to events from connected accounts.

### Option 1: Using Stripe Dashboard (Recommended)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **"Add endpoint"** or **"Create new destination"**
3. Enter your endpoint URL:
   ```
   https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook
   ```
4. **IMPORTANT**: In the "Listen to" section, select **"Events on connected accounts"** (NOT "Events from: Your account")
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_...`)

### Option 2: Using Stripe API

If the Dashboard doesn't allow you to change "Listen to", create the webhook via API:

```bash
curl https://api.stripe.com/v1/webhook_endpoints \
  -u sk_test_YOUR_SECRET_KEY: \
  -d url=https://us-central1-lifeset-v2.cloudfunctions.net/stripeWebhook \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=invoice.payment_succeeded" \
  -d "enabled_events[]=invoice.payment_failed" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -d connect=true
```

**Note**: The `connect=true` parameter is critical - this tells Stripe to send events from connected accounts.

### Update Firebase Secret

After creating the Connect webhook, update your Firebase secret:

```bash
cd functions
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste the new webhook signing secret when prompted
```

## Alternative: Use Event Destinations

Stripe also supports "Event Destinations" which is a newer way to handle webhooks. You can create an event destination that forwards events from connected accounts to your endpoint.

1. Go to **Workbench** → **Event Destinations**
2. Click **"Create new destination"**
3. Select **"Webhook"** as destination type
4. Enter your endpoint URL
5. **Enable "Events on connected accounts"**
6. Select the events you want

## Testing

After setting up the Connect webhook:

1. Make a test payment through a connected account
2. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only stripeWebhook
   ```
3. You should see events with `event.account` set to the connected account ID (not null)

## Current Fallback Solution

Until the Connect webhook is properly configured, the `verifyCheckoutSession` function serves as a fallback. It:
- Verifies checkout session status directly from Stripe API
- Creates `pendingMember` and sends welcome email
- Works when users return from Stripe Checkout

This ensures payments are processed even if webhooks don't fire.

