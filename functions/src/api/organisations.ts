// Organisation CRUD endpoints (for admin dashboard)
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, auth } from "../config";
import { sendNewGymSignupNotification } from "../services/email";

export const createOrganisation = onRequest(async (req, res) => {
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

    // For now, allow any authenticated user to create (you'll restrict this later)
    const { name, type, logoUrl, brandColours, featureFlags, contentPack } = req.body;

    const organisationRef = db.collection("organisations").doc();
    const organisationId = organisationRef.id;

    // Generate URL-friendly slug from name (e.g. "CrossFit Dublin" -> "crossfit-dublin")
    const baseSlug = (name || "gym")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "gym";
    let slug = baseSlug;
    let slugAttempts = 0;
    while (slugAttempts < 10) {
      const existing = await db.collection("organisations")
        .where("landingPage.slug", "==", slug)
        .limit(1)
        .get();
      if (existing.empty) break;
      slug = `${baseSlug}-${++slugAttempts}`;
    }

    const landingPage = {
      enabled: true,
      slug,
      hero: {
        title: `Join ${name || "Us"}`,
        subtitle: "Start your journey today",
        imageUrl: "",
      },
      aboutSection: { title: "", content: "", imageUrl: "" },
      signUpHeadline: "Choose your membership",
      showMemberships: true,
      showPacks: true,
      footerText: "",
    };

    await organisationRef.set({
      organisationId,
      name,
      type: type || "gym",
      logoUrl: logoUrl || "",
      brandColours: brandColours || { primary: "#000000", secondary: "#FFFFFF" },
      landingPage,
      featureFlags: featureFlags || {
        bookings: true,
        memberships: true,
        packs: true,
        qrCheckIn: true,
        habits: true,
        challenges: true,
        journaling: false,
        nutrition: false,
        workouts: true,
        analytics: true
      },
      contentPack: contentPack || "gymPack",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Link user to organisation as admin (multi-org format + legacy)
    await db.collection("users").doc(userId).update({
      organisationId,
      activeOrganisationId: organisationId,
      organisations: admin.firestore.FieldValue.arrayUnion(organisationId),
      role: "admin"
    });

    // Notify LifeSet admin for oversight (sales mostly offline)
    const adminEmail = decodedToken.email || "";
    sendNewGymSignupNotification({
      gymName: name || "Unknown",
      gymType: type || "gym",
      adminEmail,
    }).catch(() => {});

    res.json({ organisationId, success: true });
  } catch (error: any) {
    console.error("Error creating organisation:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

