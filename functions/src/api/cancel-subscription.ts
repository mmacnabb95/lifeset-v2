// Cancel Stripe subscription (for admin dashboard)
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db } from "../config";
import { getStripeForAccount } from "../config/stripe";

/**
 * Cancel a Stripe subscription
 * Called from admin dashboard when removing a member
 */
export const cancelSubscription = onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new Error("Unauthorized");
    }

    const { organisationId, membershipId } = request.data;

    if (!organisationId || !membershipId) {
      throw new Error("organisationId and membershipId are required");
    }

    try {
      // Get organisation to find stripeAccountId
      const orgDoc = await db.collection("organisations").doc(organisationId).get();
      if (!orgDoc.exists) {
        throw new Error("Organisation not found");
      }

      const orgData = orgDoc.data();
      const stripeAccountId = orgData?.stripeAccountId;

      if (!stripeAccountId) {
        throw new Error("Organisation does not have Stripe connected");
      }

      // Get membership document
      const membershipDoc = await db.collection("memberships").doc(membershipId).get();
      if (!membershipDoc.exists) {
        throw new Error("Membership not found");
      }

      const membershipData = membershipDoc.data();
      const stripeSubscriptionId = membershipData?.stripeSubscriptionId;

      if (!stripeSubscriptionId) {
        // No Stripe subscription to cancel (manual membership)
        return {
          success: true,
          message: "No Stripe subscription found - membership is manual",
          cancelled: false,
        };
      }

      // Get Stripe instance for connected account
      const stripe = getStripeForAccount(stripeAccountId);

      // Cancel the subscription immediately
      const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);

      // Update membership status
      await membershipDoc.ref.update({
        status: "cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Subscription cancelled successfully",
        cancelled: true,
        subscriptionId: subscription.id,
      };
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      throw new Error(error.message || "Failed to cancel subscription");
    }
  }
);

