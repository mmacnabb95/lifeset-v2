# Stripe Billing & Membership Flow Summary

## Overview

This document summarizes how Stripe handles billing, renewals, and cancellations in the LifeSet platform.

---

## 1. Stripe Billing & Cancellation

**Yes, Stripe handles billing and membership cancellation automatically.**

### How It Works:

- **Stripe manages recurring subscriptions** - When a customer pays for a membership, Stripe creates a subscription that automatically bills them on the billing cycle (monthly/yearly).

- **Webhooks sync status** - LifeSet listens to Stripe webhooks to keep membership status in sync:
  - `invoice.payment_succeeded` → Membership status set to `active` (renewal succeeded)
  - `invoice.payment_failed` → Membership status set to `past_due` (renewal failed, 7-day grace period)
  - `customer.subscription.updated` → Membership status updated (e.g., cancelled → `cancelled`)
  - `customer.subscription.deleted` → Membership status set to `cancelled`

- **Automatic renewal extension** - When `invoice.payment_succeeded` fires, the membership's `expiresAt` date is automatically extended by the membership duration (e.g., 30 days for monthly).

---

## 2. Customer Signup Flow

### Initial Signup (Gym Walk-In):

1. **Staff opens admin dashboard** → Clicks "Sell Membership"
2. **Staff selects membership tier** (Monthly/Yearly) and enters customer email
3. **Staff clicks "Send Payment Link"** → Creates Stripe Checkout session
4. **Customer receives payment link** (via email, SMS, QR code, or staff shares)
5. **Customer pays via Stripe Checkout**
6. **Stripe webhook fires** (`checkout.session.completed`)
7. **LifeSet automatically:**
   - Creates `pendingMember` record (if new customer)
   - Generates unique invite code (single-use)
   - Creates `membership` document with `status: "pending_activation"`
   - Stores `stripeSubscriptionId` and `stripeCustomerId`
   - Sends welcome email with invite code
8. **Customer downloads LifeSet app**
9. **Customer signs up** with email + password + invite code
10. **App activates membership** (`status: "active"`) and grants access

### Payment Link Sharing Improvements:

- **QR Code** - Automatically generated for easy scanning
- **Email Link** - One-click email button (opens default email client)
- **SMS Link** - One-click SMS button (opens default SMS app)
- **Copy Link** - Manual copy-to-clipboard option
- **Open Link** - Direct link to Stripe Checkout

---

## 3. Renewals

### How Renewals Work:

1. **Stripe charges customer** on the billing cycle (monthly/yearly)
2. **On success:** `invoice.payment_succeeded` webhook fires
   - LifeSet updates membership `status: "active"`
   - **LifeSet extends `expiresAt` date** by the membership duration (e.g., 30 days)
3. **On failure:** `invoice.payment_failed` webhook fires
   - LifeSet updates membership `status: "past_due"`
   - **7-day grace period** is set (`gracePeriodExpiresAt`)
   - Customer retains access during grace period
   - After grace period expires, customer loses access

### Grace Period Logic:

- **Past Due Memberships:** 7-day grace period from payment failure
- **Admin-Initiated Removal:** 7-day grace period if membership was active
- **Already Expired:** No grace period, immediate removal

---

## 4. Membership Cancellation

### A. Customer Cancels (Self-Service):

**Option 1: Stripe Customer Portal** (Recommended)
- Customer opens Customer Portal link from mobile app
- Can cancel subscription, update payment method, view invoices
- Stripe sends `customer.subscription.deleted` webhook
- LifeSet updates membership `status: "cancelled"`
- Customer loses access immediately

**Option 2: Direct Stripe Cancellation**
- Customer cancels subscription directly in Stripe
- Same webhook flow as above

### B. Admin Cancels Subscription (Dashboard):

- **"Cancel Subscription" button** in member actions
- Only cancels Stripe subscription, keeps member in system
- Member retains access until current membership period expires
- No grace period (they keep what they paid for)

### C. Admin Removes Member (Dashboard):

- **"Remove" button** in member actions
- Cancels Stripe subscription (if exists)
- Expires membership immediately
- If membership was active: 7-day grace period
- If membership was already expired: Immediate removal

---

## 5. Technical Implementation

### Cloud Functions:

1. **`cancelSubscription`** - Cancels a Stripe subscription (called from admin dashboard)
2. **`createCustomerPortalSession`** - Creates Stripe Customer Portal link (for users)
3. **`stripeWebhook`** - Handles all Stripe webhook events

### Webhook Handlers:

- **`handleInvoicePaymentSucceeded`** - Extends `expiresAt` on successful renewal
- **`handleInvoicePaymentFailed`** - Sets `past_due` status and 7-day grace period
- **`handleSubscriptionUpdated`** - Syncs subscription status changes
- **`handleSubscriptionDeleted`** - Marks membership as cancelled

### Membership Status Checks:

- **Active:** `status: "active"` AND `expiresAt > now`
- **Past Due (with grace):** `status: "past_due"` AND `gracePeriodExpiresAt > now`
- **Expired:** `status: "expired"` OR `expiresAt <= now`
- **Cancelled:** `status: "cancelled"`

---

## 6. User Experience

### Mobile App:

- **Membership Status Screen** - Shows current membership, expiry date, days remaining
- **Customer Portal Link** - Button to manage subscription (cancel, update payment method)
- **Grace Period Notice** - Shows warning if membership is past due

### Admin Dashboard:

- **Sell Membership Modal** - QR code, email, SMS sharing options
- **Cancel Subscription** - Separate button for cancelling subscription only
- **Remove Member** - Removes member and cancels subscription
- **Member List** - Shows which members have Stripe subscriptions

---

## Summary

✅ **Stripe handles all billing and renewals automatically**
✅ **Webhooks sync membership status in real-time**
✅ **`expiresAt` is extended on each successful renewal**
✅ **7-day grace period for past_due memberships**
✅ **Admin can cancel subscriptions or remove members**
✅ **Users can cancel via Stripe Customer Portal**
✅ **Payment links can be shared via QR code, email, or SMS**

