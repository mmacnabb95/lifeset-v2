import Stripe from "stripe";

// Initialize Stripe with platform account (for Connect)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Get Stripe instance for a connected account
export const getStripeForAccount = (stripeAccountId: string): Stripe => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    stripeAccount: stripeAccountId,
  });
};

// Stripe Connect OAuth configuration
// Trim whitespace to prevent issues with trailing newlines from secrets
export const STRIPE_CLIENT_ID = (process.env.STRIPE_CLIENT_ID || "").trim();
export const STRIPE_REDIRECT_URI = (process.env.STRIPE_REDIRECT_URI || "").trim();

