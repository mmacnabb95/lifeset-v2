// Create Stripe Customer Portal session (for users to manage subscriptions)
import { onCall } from "firebase-functions/v2/https";
import { db } from "../config";
import { getStripeForAccount } from "../config/stripe";

/**
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription (cancel, update payment method, etc.)
 */
export const createCustomerPortalSession = onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new Error("Unauthorized");
    }

    const { organisationId, returnUrl } = request.data;

    if (!organisationId) {
      throw new Error("organisationId is required");
    }

    try {
      // Get user's membership to find Stripe customer ID
      const userId = request.auth.uid;
      
      // Get organisation
      const orgDoc = await db.collection("organisations").doc(organisationId).get();
      if (!orgDoc.exists) {
        throw new Error("Organisation not found");
      }

      const orgData = orgDoc.data();
      const stripeAccountId = orgData?.stripeAccountId;

      if (!stripeAccountId) {
        throw new Error("Organisation does not have Stripe connected");
      }

      // Find user's active membership in this organisation
      const membershipsQuery = await db.collection("memberships")
        .where("userId", "==", userId)
        .where("organisationId", "==", organisationId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (membershipsQuery.empty) {
        throw new Error("No active membership found");
      }

      const membershipData = membershipsQuery.docs[0].data();
      const stripeCustomerId = membershipData?.stripeCustomerId;

      if (!stripeCustomerId) {
        throw new Error("No Stripe customer ID found for this membership");
      }

      // Get Stripe instance for connected account
      const stripe = getStripeForAccount(stripeAccountId);

      // Create Customer Portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl || "https://lifesetwellbeing.com",
      });

      return {
        success: true,
        url: portalSession.url,
      };
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      throw new Error(error.message || "Failed to create customer portal session");
    }
  }
);

