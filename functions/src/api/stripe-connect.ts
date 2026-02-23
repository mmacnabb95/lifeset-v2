// Stripe Connect OAuth endpoints
import { onRequest } from "firebase-functions/v2/https";
import { db, auth } from "../config";
import { STRIPE_CLIENT_ID, STRIPE_REDIRECT_URI } from "../config/stripe";

/**
 * Initiate Stripe Connect OAuth flow
 * GET /authorizeStripeConnect?organisationId=xxx
 */
export const authorizeStripeConnect = onRequest(
  {
    secrets: ["STRIPE_CLIENT_ID", "STRIPE_REDIRECT_URI"],
  },
  async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const organisationId = req.query.organisationId as string;
    if (!organisationId) {
      res.status(400).json({ error: "organisationId is required" });
      return;
    }

    // Verify user is admin of this organisation
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data();
    if (userData?.organisationId !== organisationId || userData?.role !== "admin") {
      res.status(403).json({ error: "Only organisation admins can connect Stripe" });
      return;
    }

    // Build OAuth URL
    const state = Buffer.from(JSON.stringify({ organisationId, userId })).toString("base64");
    const oauthUrl = `https://connect.stripe.com/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${STRIPE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(STRIPE_REDIRECT_URI)}&` +
      `scope=read_write&` +
      `state=${state}`;

    res.json({ oauthUrl });
  } catch (error: any) {
    console.error("Error initiating Stripe Connect:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Handle Stripe Connect OAuth callback
 * GET /stripeConnectCallback?code=xxx&state=xxx
 */
export const stripeConnectCallback = onRequest(
  {
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_CLIENT_ID", "STRIPE_REDIRECT_URI", "STRIPE_CONNECT_SUCCESS_URL", "STRIPE_CONNECT_ERROR_URL"],
  },
  async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code || !state) {
      res.status(400).send("Missing code or state parameter");
      return;
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const { organisationId, userId } = stateData;

    // Verify user is admin
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).send("User not found");
      return;
    }

    const userData = userDoc.data();
    if (userData?.organisationId !== organisationId || userData?.role !== "admin") {
      res.status(403).send("Unauthorized");
      return;
    }

    // Exchange code for access token
    // For Stripe Connect OAuth, we need to use the platform secret key in Authorization header
    const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${stripeSecretKey}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: STRIPE_CLIENT_ID,
        code,
        redirect_uri: STRIPE_REDIRECT_URI,
      }),
    });

    const tokenData = await response.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const stripeAccountId = tokenData.stripe_user_id;

    // Store stripeAccountId in organisation
    await db.collection("organisations").doc(organisationId).update({
      stripeAccountId,
      updatedAt: require("firebase-admin").firestore.FieldValue.serverTimestamp(),
    });

    // Redirect to success page
    const successUrl = process.env.STRIPE_CONNECT_SUCCESS_URL || `http://localhost:3000/dashboard/settings?stripe=connected`;
    res.redirect(successUrl);
  } catch (error: any) {
    console.error("Error in Stripe Connect callback:", error);
    const errorUrl = process.env.STRIPE_CONNECT_ERROR_URL || `http://localhost:3000/dashboard/settings?stripe=error`;
    res.redirect(errorUrl);
  }
});

/**
 * Disconnect Stripe account
 * POST /disconnectStripe
 */
export const disconnectStripe = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { organisationId } = req.body;
    if (!organisationId) {
      res.status(400).json({ error: "organisationId is required" });
      return;
    }

    // Verify user is admin
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data();
    if (userData?.organisationId !== organisationId || userData?.role !== "admin") {
      res.status(403).json({ error: "Only organisation admins can disconnect Stripe" });
      return;
    }

    // Remove stripeAccountId
    await db.collection("organisations").doc(organisationId).update({
      stripeAccountId: require("firebase-admin").firestore.FieldValue.delete(),
      updatedAt: require("firebase-admin").firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error disconnecting Stripe:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

