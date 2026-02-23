#!/bin/bash

# Script to set Firebase Functions environment variables
# Usage: ./set-env-vars.sh

echo "🔧 Setting Firebase Functions Environment Variables"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Run: firebase login"
    exit 1
fi

echo "📝 Enter your Stripe configuration values:"
echo ""

read -p "Stripe Secret Key (sk_live_... or sk_test_...): " STRIPE_SECRET_KEY
read -p "Stripe Connect Client ID (ca_...): " STRIPE_CLIENT_ID
read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "Admin Dashboard URL (e.g., https://lifeset-admin.vercel.app): " ADMIN_DASHBOARD_URL

# Set default values
STRIPE_REDIRECT_URI="https://us-central1-lifeset-v2.cloudfunctions.net/stripeConnectCallback"
STRIPE_CONNECT_SUCCESS_URL="${ADMIN_DASHBOARD_URL}/dashboard/settings?stripe=connected"
STRIPE_CONNECT_ERROR_URL="${ADMIN_DASHBOARD_URL}/dashboard/settings?stripe=error"

echo ""
echo "🚀 Setting environment variables..."

# For Firebase Functions v2, use secrets
firebase functions:secrets:set STRIPE_SECRET_KEY <<< "$STRIPE_SECRET_KEY"
firebase functions:secrets:set STRIPE_CLIENT_ID <<< "$STRIPE_CLIENT_ID"
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET <<< "$STRIPE_WEBHOOK_SECRET"
firebase functions:secrets:set STRIPE_REDIRECT_URI <<< "$STRIPE_REDIRECT_URI"
firebase functions:secrets:set STRIPE_CONNECT_SUCCESS_URL <<< "$STRIPE_CONNECT_SUCCESS_URL"
firebase functions:secrets:set STRIPE_CONNECT_ERROR_URL <<< "$STRIPE_CONNECT_ERROR_URL"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📋 Summary:"
echo "  - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:20}..."
echo "  - STRIPE_CLIENT_ID: ${STRIPE_CLIENT_ID:0:20}..."
echo "  - STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:0:20}..."
echo "  - STRIPE_REDIRECT_URI: $STRIPE_REDIRECT_URI"
echo "  - STRIPE_CONNECT_SUCCESS_URL: $STRIPE_CONNECT_SUCCESS_URL"
echo "  - STRIPE_CONNECT_ERROR_URL: $STRIPE_CONNECT_ERROR_URL"
echo ""
echo "🔨 Next steps:"
echo "  1. Deploy functions: cd functions && npm run build && firebase deploy --only functions"
echo "  2. Configure webhook in Stripe Dashboard"
echo "  3. Test Stripe Connect flow"

