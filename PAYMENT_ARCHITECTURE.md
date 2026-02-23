# LifeSet Payment Architecture - Finalized

## 🎯 Three Payment Universes (Cleanly Separated)

### 1. B2C Premium (Apple IAP) — ✅ Existing, Unchanged

**Status:** DO NOT MODIFY

- Uses RevenueCat + Apple IAP
- No changes to current paywall
- No backend changes
- No Stripe involvement
- No invite codes affect this
- If `organisationId == null` → user stays in Consumer Mode → paywall appears

**Cursor must NOT modify this flow.**

---

### 2. Gym Payments (Stripe Connect / GoCardless) — 🚧 To Build

**These are real-world services, so Apple rules do not apply.**

#### What Gyms Can Sell:
- Memberships
- Packs
- Drop-ins
- PT sessions
- Sauna sessions

#### Where Payments Happen:
- **Admin dashboard** (staff-initiated purchases)
- **Public web widgets** (member-initiated purchases)
- **Stripe Checkout** (hosted by Stripe)
- **GoCardless mandate setup**

#### What the Mobile App Does:
- ✅ Shows membership status (read-only)
- ✅ Shows pack balance (read-only)
- ✅ Can open a web checkout link (allowed for real-world services)
- ❌ **Never processes payments inside the app**

#### Backend Responsibilities:
- Stripe Connect OAuth for gyms
- Stripe Checkout sessions
- Stripe webhooks → update Firestore
- Membership activation/expiration
- Pack purchase + usage tracking

---

### 3. Corporate Payments (External Contract) — ✅ Already Works

- Employer pays LifeSet directly (invoice, Stripe, bank transfer)
- Employees join via invite code or link
- Employees get free access
- No in-app payments
- No Apple involvement

**Cursor must not build any payment UI for corporate users.**

---

## 🚫 Critical Rule: No Payments Inside the LifeSet App

### Inside the App, Users:

**Cannot:**
- ❌ Buy memberships
- ❌ Buy packs
- ❌ Enter promo codes
- ❌ Redeem discounts
- ❌ Trigger Stripe flows
- ❌ Trigger GoCardless flows

**Can:**
- ✅ View membership status
- ✅ View pack balance
- ✅ Tap a link that opens a web checkout (allowed)

**This keeps you 100% Apple-compliant.**

---

## 🧩 Implementation Alignment (What Cursor Should Build)

### Admin Dashboard
- ✅ Create/edit/delete membership tiers
- ✅ Create/edit/delete packs
- ✅ View purchases
- ✅ View active memberships
- ✅ View pack usage
- ✅ Connect Stripe
- ✅ Connect GoCardless
- ❌ **No payment processing inside dashboard UI** — only Stripe Checkout links

### Web Widgets
- ✅ Public schedule
- ✅ Public membership purchase
- ✅ Public pack purchase
- ✅ All payments handled via Stripe Checkout

### Mobile App
- ✅ Read-only membership + pack status
- ✅ Deep link to hosted checkout if needed
- ❌ **No paywall for organisation users**

### Backend
- ✅ Stripe Connect OAuth
- ✅ Stripe Checkout session creation
- ✅ Stripe webhooks → update Firestore
- ✅ Membership lifecycle logic
- ✅ Pack usage logic

---

## 🔄 Payment Flow Examples

### Gym Membership Purchase
```
Member → Web Widget → Stripe Checkout → Payment → Webhook → Firestore
                                                              ↓
                                                    membership.status = "active"
                                                              ↓
                                                    App Shows Status (Read-Only)
```

### Pack Purchase
```
Member → Admin Dashboard/Web Widget → Stripe Checkout → Payment → Webhook → Firestore
                                                                              ↓
                                                                    pack.classesRemaining = 10
                                                                              ↓
                                                                    App Shows Balance (Read-Only)
```

### Corporate Access
```
Employer → Invoice/Stripe → LifeSet Account
                              ↓
                        Employees Get Invite Codes
                              ↓
                        Employees Join (No Payment)
                              ↓
                        App Shows Organisation Mode
```

---

## 📋 Implementation Checklist

### Phase 1: Admin Dashboard (Current Focus)
- [x] Member management
- [x] Schedule management
- [x] Bookings management
- [x] Attendance tracking
- [x] Analytics
- [x] Organisation settings
- [ ] Pack management (create/edit/view)
- [ ] Membership tier management (create/edit/view)
- [ ] View pack purchases
- [ ] View active memberships

### Phase 2: Stripe Integration (Next)
- [ ] Stripe Connect OAuth flow
- [ ] Stripe Checkout session creation
- [ ] Stripe webhook handlers
- [ ] Membership status updates
- [ ] Pack purchase tracking

### Phase 3: Web Widgets (Future)
- [ ] Schedule widget
- [ ] Membership purchase widget
- [ ] Pack purchase widget
- [ ] Stripe Checkout integration

### Phase 4: Mobile App Integration (Future)
- [ ] Membership status display (read-only)
- [ ] Pack balance display (read-only)
- [ ] Deep links to web checkout
- [ ] Booking with pack/membership check

---

## 🔐 Security & Compliance

### Apple App Store Compliance
- ✅ B2C digital content uses Apple IAP
- ✅ Real-world services use external payments
- ✅ No payment processing in app
- ✅ App only displays status
- ✅ Links to web checkout allowed

### Stripe Connect Security
- OAuth flow must be secure
- Webhook signatures must be verified
- Gym's Stripe account isolated
- No access to other gyms' accounts

### Data Isolation
- Each gym's data is isolated
- Memberships/packs scoped to organisation
- Firestore rules enforce access control

---

This architecture ensures clean separation, Apple compliance, and scalable growth.

