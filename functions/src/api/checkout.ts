// Stripe Checkout session creation
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { getStripeForAccount } from "../config/stripe";

/**
 * Create membership checkout session (callable function for admin dashboard)
 */
export const createMembershipCheckoutSession = onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new Error("Unauthorized - user must be authenticated");
  }

  try {
    const { organisationId, membershipTierId, email, userId, successUrl, cancelUrl } = request.data;

    if (!organisationId || !membershipTierId || !successUrl || !cancelUrl) {
      throw new Error("Missing required fields: organisationId, membershipTierId, successUrl, cancelUrl");
    }

    // Validate URLs are absolute and valid
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch (urlError) {
      throw new Error(`Invalid URL format: successUrl or cancelUrl is not a valid absolute URL. successUrl: ${successUrl}, cancelUrl: ${cancelUrl}`);
    }

    // Email is strongly recommended, userId is optional (for existing users)
    if (!email && !userId) {
      throw new Error("Either email or userId must be provided. Email is required for new customers.");
    }

    // Get organisation
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    if (!orgDoc.exists) {
      throw new Error("Organisation not found");
    }

    const orgData = orgDoc.data();
    const stripeAccountId = orgData?.stripeAccountId;

    if (!stripeAccountId) {
      throw new Error("Organisation has not connected Stripe");
    }

    // Get membership tier
    const membershipDoc = await db.collection("memberships").doc(membershipTierId).get();
    if (!membershipDoc.exists) {
      throw new Error("Membership tier not found");
    }

    const membershipData = membershipDoc.data();
    if (!membershipData) {
      throw new Error("Membership tier data not found");
    }
    
    // Check if this is a tier (userId is null) vs a user membership (userId is set)
    if (membershipData.userId != null) {
      throw new Error("This is a user membership, not a membership tier. Use the tier document ID.");
    }
    
    // Check if tier is active (default to true if not set)
    if (membershipData.active === false) {
      throw new Error("Membership tier is not active");
    }

    // Create pending purchase record
    const pendingPurchaseRef = db.collection("pendingPurchases").doc();
    const pendingPurchaseId = pendingPurchaseRef.id;

    await pendingPurchaseRef.set({
      purchaseId: pendingPurchaseId,
      organisationId,
      email: email || null, // Email is primary identifier
      userId: userId || null, // Optional: if user already exists
      type: "membership",
      membershipTierId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Validate membership data
    if (!membershipData.price || membershipData.price <= 0) {
      throw new Error("Invalid membership price");
    }

    const currency = (membershipData.currency || "EUR").toLowerCase();
    const duration = membershipData.duration || 30;
    
    // Calculate recurring interval
    // Stripe supports: day, week, month, year
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

    // Validate Stripe configuration
    const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!stripeAccountId || !stripeAccountId.startsWith("acct_")) {
      throw new Error(`Invalid Stripe account ID: ${stripeAccountId}`);
    }

    console.log("Creating checkout session for account:", stripeAccountId.substring(0, 10) + "...");

    // Create Stripe Checkout session
    const stripe = getStripeForAccount(stripeAccountId);
    
    // Verify the connected account is accessible
    try {
      await stripe.accounts.retrieve(stripeAccountId);
      console.log("Connected account verified");
    } catch (verifyError: any) {
      console.error("Failed to verify connected account:", verifyError);
      throw new Error(`Stripe account verification failed: ${verifyError.message}. The connected Stripe account may not be fully activated.`);
    }
    
    try {
      // Note: stripeAccount is already set in the Stripe instance, don't pass it again
      // Build product_data - only include description if it's not empty
      const productData: { name: string; description?: string } = {
        name: membershipData.name || "Membership",
      };
      if (membershipData.description && membershipData.description.trim()) {
        productData.description = membershipData.description.trim();
      }

      // Check if membership is recurring or one-time
      const isRecurring = membershipData.recurring !== false; // Default to true if not specified
      
      const lineItems: any[] = [{
        price_data: {
          currency: currency,
          product_data: productData,
          unit_amount: Math.round(membershipData.price * 100), // Convert to cents
        },
        quantity: 1,
      }];
      
      // Add recurring data only if it's a subscription
      if (isRecurring) {
        lineItems[0].price_data.recurring = {
          interval: interval,
          interval_count: intervalCount,
        };
      }

      const session = await stripe.checkout.sessions.create({
        mode: isRecurring ? "subscription" : "payment", // Subscription for recurring, payment for one-time
        payment_method_types: ["card"],
        customer_email: email || undefined, // Pre-fill email in Stripe Checkout
        line_items: lineItems,
        // Append session_id and purchaseId to successUrl (handle both ? and & cases)
        success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}&purchaseId=${pendingPurchaseId}`,
        cancel_url: cancelUrl,
        client_reference_id: pendingPurchaseId,
        metadata: {
          organisationId,
          email: email || "",
          userId: userId || "", // Optional: for existing users
          membershipTierId,
          purchaseId: pendingPurchaseId,
          type: "membership",
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
        pendingPurchaseId,
      };
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      throw new Error(`Stripe API error: ${stripeError.message}`);
    }

  } catch (error: any) {
    console.error("Error creating membership checkout session:", error);
    throw new Error(error.message || "Internal server error");
  }
});

/**
 * Create pack checkout session (callable function for admin dashboard)
 */
export const createPackCheckoutSession = onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new Error("Unauthorized - user must be authenticated");
  }

  try {
    const { organisationId, packId, email, userId, successUrl, cancelUrl } = request.data;

    if (!organisationId || !packId || !successUrl || !cancelUrl) {
      throw new Error("Missing required fields: organisationId, packId, successUrl, cancelUrl");
    }

    // Validate URLs are absolute and valid
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch (urlError) {
      throw new Error(`Invalid URL format: successUrl or cancelUrl is not a valid absolute URL. successUrl: ${successUrl}, cancelUrl: ${cancelUrl}`);
    }

    // Email is strongly recommended, userId is optional (for existing users)
    if (!email && !userId) {
      throw new Error("Either email or userId must be provided. Email is required for new customers.");
    }

    // Get organisation
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    if (!orgDoc.exists) {
      throw new Error("Organisation not found");
    }

    const orgData = orgDoc.data();
    const stripeAccountId = orgData?.stripeAccountId;

    if (!stripeAccountId) {
      throw new Error("Organisation has not connected Stripe");
    }

    // Get pack
    const packDoc = await db.collection("packs").doc(packId).get();
    if (!packDoc.exists) {
      throw new Error("Pack not found");
    }

    const packData = packDoc.data();
    if (!packData?.active) {
      throw new Error("Pack is not active");
    }

    // Create pending purchase record
    const pendingPurchaseRef = db.collection("pendingPurchases").doc();
    const pendingPurchaseId = pendingPurchaseRef.id;

    await pendingPurchaseRef.set({
      purchaseId: pendingPurchaseId,
      organisationId,
      email: email || null, // Email is primary identifier
      userId: userId || null, // Optional: if user already exists
      type: "pack",
      packId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create Stripe Checkout session
    const stripe = getStripeForAccount(stripeAccountId);
    
    // Build product_data - only include description if it's not empty
    const packProductData: { name: string; description?: string } = {
      name: packData.name,
    };
    const packDescription = packData.description?.trim() || `${packData.classCount} classes`;
    if (packDescription) {
      packProductData.description = packDescription;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment
      payment_method_types: ["card"],
      customer_email: email || undefined, // Pre-fill email in Stripe Checkout
      line_items: [
        {
          price_data: {
            currency: packData.currency.toLowerCase(),
            product_data: packProductData,
            unit_amount: Math.round(packData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      // Append session_id and purchaseId to successUrl (handle both ? and & cases)
      success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}&purchaseId=${pendingPurchaseId}`,
      cancel_url: cancelUrl,
      client_reference_id: pendingPurchaseId,
      metadata: {
        organisationId,
        email: email || "",
        userId: userId || "", // Optional: for existing users
        packId,
        purchaseId: pendingPurchaseId,
        type: "pack",
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
      pendingPurchaseId,
    };
  } catch (error: any) {
    console.error("Error creating pack checkout session:", error);
    throw new Error(error.message || "Internal server error");
  }
});

