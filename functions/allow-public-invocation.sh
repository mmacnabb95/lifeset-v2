#!/bin/bash
# Allow public invocation of validateQRCheckIn (required for Firebase Functions v2)
# The function still validates the Bearer token internally - this just allows the request to reach it.
#
# Run: ./allow-public-invocation.sh
# Or:  bash allow-public-invocation.sh

echo "Granting public invoker access to validateQRCheckIn..."
gcloud functions add-invoker-policy-binding validateQRCheckIn \
  --region=us-central1 \
  --member="allUsers"

echo ""
echo "Done. The QR scanner should now work."
echo "If gcloud is not installed: https://cloud.google.com/sdk/docs/install"
