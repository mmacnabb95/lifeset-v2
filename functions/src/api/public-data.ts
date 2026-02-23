// Public data endpoints for widgets (no auth required)
import { onRequest } from "firebase-functions/v2/https";
import { db } from "../config";

/**
 * Get public organisation data (for landing page branding)
 * GET /getPublicOrganisation?organisationId=xxx OR ?slug=xxx
 */
export const getPublicOrganisation = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const organisationId = req.query.organisationId as string;
    const slug = req.query.slug as string;

    if (!organisationId && !slug) {
      res.status(400).json({ error: "organisationId or slug is required" });
      return;
    }

    let orgDoc;

    if (organisationId) {
      orgDoc = await db.collection("organisations").doc(organisationId).get();
    } else if (slug) {
      const orgsQuery = await db.collection("organisations")
        .where("landingPage.slug", "==", slug.toLowerCase())
        .limit(1)
        .get();
      orgDoc = orgsQuery.empty ? null : orgsQuery.docs[0];
    }

    if (!orgDoc || !orgDoc.exists) {
      res.status(404).json({ error: "Organisation not found" });
      return;
    }

    const data = orgDoc.data();
    const orgId = orgDoc.id;

    const landingPage = data?.landingPage || {};
    const enabled = landingPage.enabled !== false;

    res.json({
      organisationId: orgId,
      name: data?.name || "",
      type: data?.type || null,
      logoUrl: landingPage.logoUrl || data?.logoUrl || "",
      brandColours: data?.brandColours || { primary: "#6366F1", secondary: "#FFFFFF" },
      slug: landingPage.slug || null,
      landingPage: {
        enabled,
        hero: landingPage.hero || {
          title: `Join ${data?.name || "Us"}`,
          subtitle: "Start your journey today",
          imageUrl: "",
        },
        aboutSection: landingPage.aboutSection || { title: "", content: "", imageUrl: "" },
        signUpHeadline: landingPage.signUpHeadline || "Choose your membership",
        ctaButtonText: landingPage.ctaButtonText || "Continue to payment",
        showMemberships: landingPage.showMemberships !== false,
        showPacks: landingPage.showPacks !== false,
        footerText: landingPage.footerText || "",
      },
    });
  } catch (error: any) {
    console.error("Error getting public organisation:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Get public membership tiers
 * GET /getPublicMemberships?organisationId=xxx
 */
export const getPublicMemberships = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const organisationId = req.query.organisationId as string;
    if (!organisationId) {
      res.status(400).json({ error: "organisationId is required" });
      return;
    }

    // Get active membership tiers (no userId = tier, not purchase)
    const membershipsQuery = await db.collection("memberships")
      .where("organisationId", "==", organisationId)
      .where("active", "==", true)
      .get();

    const memberships = membershipsQuery.docs
      .filter(doc => !doc.data().userId) // Only tiers, not purchases
      .map(doc => {
        const data = doc.data();
        return {
          membershipId: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          duration: data.duration,
          features: data.features || [],
        };
      });

    res.json(memberships);
  } catch (error: any) {
    console.error("Error getting public memberships:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Get public packs
 * GET /getPublicPacks?organisationId=xxx
 */
export const getPublicPacks = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const organisationId = req.query.organisationId as string;
    if (!organisationId) {
      res.status(400).json({ error: "organisationId is required" });
      return;
    }

    // Get active packs
    const packsQuery = await db.collection("packs")
      .where("organisationId", "==", organisationId)
      .where("active", "==", true)
      .get();

    const packs = packsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        packId: doc.id,
        name: data.name,
        description: data.description,
        features: data.features || [],
        price: data.price,
        currency: data.currency,
        classCount: data.classCount,
        validityDays: data.validityDays,
      };
    });

    res.json(packs);
  } catch (error: any) {
    console.error("Error getting public packs:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Get public class schedule for an organisation
 * GET /getPublicClasses?organisationId=xxx
 * Returns upcoming classes (date >= today) with bookedCount
 */
export const getPublicClasses = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const organisationId = req.query.organisationId as string;
    if (!organisationId) {
      res.status(400).json({ error: "organisationId is required" });
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const classesQuery = await db.collection("classes")
      .where("organisationId", "==", organisationId)
      .where("date", ">=", now)
      .orderBy("date", "asc")
      .limit(100)
      .get();

    const classes = await Promise.all(
      classesQuery.docs.map(async (classDoc) => {
        const data = classDoc.data();
        const bookingsSnap = await db.collection("bookings")
          .where("classId", "==", classDoc.id)
          .where("status", "==", "confirmed")
          .get();
        const bookedCount = bookingsSnap.size;
        const dateVal = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return {
          classId: classDoc.id,
          name: data.name,
          description: data.description || "",
          instructor: data.instructor || "",
          date: dateVal.toISOString(),
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          capacity: data.capacity || 0,
          bookedCount,
          spotsLeft: Math.max(0, (data.capacity || 0) - bookedCount),
        };
      })
    );

    res.json(classes);
  } catch (error: any) {
    console.error("Error getting public classes:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

