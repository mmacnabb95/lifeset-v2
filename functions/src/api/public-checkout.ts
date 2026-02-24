// Public checkout endpoint - no auth required (for landing page self-service sign-up)
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { getStripeForAccount } from "../config/stripe";

/**
 * Create checkout session for membership or pack (public, no auth)
 * POST /createPublicCheckoutSession
 * Body: { organisationId, membershipTierId?, packId?, email, successUrl, cancelUrl }
 */
export const createPublicCheckoutSession = onRequest(
  {
    secrets: ["STRIPE_SECRET_KEY"],
    cors: true,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { organisationId, membershipTierId, packId, email, successUrl, cancelUrl } = req.body;

      if (!organisationId || !email || !successUrl || !cancelUrl) {
        res.status(400).json({ error: "Missing required fields: organisationId, email, successUrl, cancelUrl" });
        return;
      }

      if (!membershipTierId && !packId) {
        res.status(400).json({ error: "Either membershipTierId or packId must be provided" });
        return;
      }

      if (membershipTierId && packId) {
        res.status(400).json({ error: "Provide only one of membershipTierId or packId" });
        return;
      }

      // Validate URLs
      try {
        new URL(successUrl);
        new URL(cancelUrl);
      } catch (urlError) {
        res.status(400).json({ error: "Invalid successUrl or cancelUrl format" });
        return;
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      const orgDoc = await db.collection("organisations").doc(organisationId).get();
      if (!orgDoc.exists) {
        res.status(404).json({ error: "Organisation not found" });
        return;
      }

      const orgData = orgDoc.data();
      const stripeAccountId = orgData?.stripeAccountId;

      if (!stripeAccountId) {
        res.status(400).json({ error: "Organisation has not connected Stripe" });
        return;
      }

      const stripe = getStripeForAccount(stripeAccountId);

      if (membershipTierId) {
        // Membership checkout
        const membershipDoc = await db.collection("memberships").doc(membershipTierId).get();
        if (!membershipDoc.exists) {
          res.status(404).json({ error: "Membership tier not found" });
          return;
        }

        const membershipData = membershipDoc.data();
        if (!membershipData || membershipData.userId != null) {
          res.status(400).json({ error: "Invalid membership tier" });
          return;
        }
        if (membershipData.organisationId !== organisationId) {
          res.status(400).json({ error: "Membership tier does not belong to this organisation" });
          return;
        }
        if (membershipData.active === false) {
          res.status(400).json({ error: "Membership tier is not active" });
          return;
        }

        const pendingPurchaseRef = db.collection("pendingPurchases").doc();
        const pendingPurchaseId = pendingPurchaseRef.id;

        await pendingPurchaseRef.set({
          purchaseId: pendingPurchaseId,
          organisationId,
          email,
          userId: null,
          type: "membership",
          membershipTierId,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const currency = (membershipData.currency || "EUR").toLowerCase();
        const duration = membershipData.duration || 30;
        let interval: "day" | "week" | "month" | "year";
        let intervalCount: number;
        if (duration >= 365) {
          interval = "year";
          intervalCount = Math.floor(duration / 365);
        } else if (duration >= 30) {
          interval = "month";
          intervalCount = Math.floor(duration / 30);
        } else if (duration >= 7) {
          interval = "week";
          intervalCount = Math.floor(duration / 7);
        } else {
          interval = "day";
          intervalCount = duration;
        }

        const isRecurring = membershipData.recurring !== false;
        const productData: { name: string; description?: string } = {
          name: membershipData.name || "Membership",
        };
        if (membershipData.description?.trim()) {
          productData.description = membershipData.description.trim();
        }

        const lineItems: any[] = [{
          price_data: {
            currency,
            product_data: productData,
            unit_amount: Math.round(membershipData.price * 100),
            ...(isRecurring && { recurring: { interval, interval_count: intervalCount } }),
          },
          quantity: 1,
        }];

        const sessionConfig: any = {
          mode: isRecurring ? "subscription" : "payment",
          payment_method_types: ["card"],
          customer_email: email,
          line_items: lineItems,
          success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}&purchaseId=${pendingPurchaseId}&email=${encodeURIComponent(email)}&type=membership`,
          cancel_url: cancelUrl,
          client_reference_id: pendingPurchaseId,
          metadata: {
            organisationId,
            email,
            userId: "",
            membershipTierId,
            purchaseId: pendingPurchaseId,
            type: "membership",
          },
        };
        if (isRecurring) {
          sessionConfig.subscription_data = { application_fee_percent: 0.75 };
        } else {
          sessionConfig.payment_intent_data = { application_fee_amount: Math.round(membershipData.price * 100 * 0.0075) };
        }
        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ url: session.url, sessionId: session.id, pendingPurchaseId });
      } else if (packId) {
        // Pack checkout
        const packDoc = await db.collection("packs").doc(packId).get();
        if (!packDoc.exists) {
          res.status(404).json({ error: "Pack not found" });
          return;
        }

        const packData = packDoc.data();
        if (!packData || packData.organisationId !== organisationId) {
          res.status(400).json({ error: "Invalid pack" });
          return;
        }
        if (!packData.active) {
          res.status(400).json({ error: "Pack is not active" });
          return;
        }

        const pendingPurchaseRef = db.collection("pendingPurchases").doc();
        const pendingPurchaseId = pendingPurchaseRef.id;

        await pendingPurchaseRef.set({
          purchaseId: pendingPurchaseId,
          organisationId,
          email,
          userId: null,
          type: "pack",
          packId,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const productData: { name: string; description?: string } = {
          name: packData.name,
          description: packData.description?.trim() || `${packData.classCount} classes`,
        };

        const packPriceInCents = Math.round(packData.price * 100);
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: email,
          line_items: [{
            price_data: {
              currency: packData.currency?.toLowerCase() || "eur",
              product_data: productData,
              unit_amount: packPriceInCents,
            },
            quantity: 1,
          }],
          payment_intent_data: { application_fee_amount: Math.round(packPriceInCents * 0.0075) }, // 0.75% platform fee
          success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}&purchaseId=${pendingPurchaseId}&email=${encodeURIComponent(email)}&type=pack`,
          cancel_url: cancelUrl,
          client_reference_id: pendingPurchaseId,
          metadata: {
            organisationId,
            email,
            userId: "",
            packId,
            purchaseId: pendingPurchaseId,
            type: "pack",
          },
        });

        res.json({ url: session.url, sessionId: session.id, pendingPurchaseId });
      }
    } catch (error: any) {
      console.error("Error creating public checkout session:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);
