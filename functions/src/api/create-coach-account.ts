import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, auth } from "../config";

/**
 * Callable: Create a coach account for the organisation.
 * Only admin or staff can call this.
 * Creates Firebase Auth user + Firestore user doc with role "coach".
 * Separate from customer sign-up flow - no membership, no invite code.
 */
export const createCoachAccount = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Unauthorized - user must be authenticated");
    }

    const { organisationId, email, fullName, password } = request.data || {};
    if (!organisationId || !email) {
      throw new Error("Missing required fields: organisationId, email");
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    if (!emailTrimmed.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Verify caller is admin or staff of this org
    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    if (!callerDoc.exists) {
      throw new Error("User not found");
    }
    const callerData = callerDoc.data();
    const callerRole = callerData?.role;
    if (callerRole !== "admin" && callerRole !== "staff") {
      throw new Error("Only admins or staff can add coaches");
    }
    const callerOrgIds = [
      callerData?.organisationId,
      callerData?.activeOrganisationId,
      ...(callerData?.organisations || []),
    ].filter(Boolean);
    if (!callerOrgIds.includes(organisationId)) {
      throw new Error("You do not have access to this organisation");
    }

    // Generate password if not provided
    const finalPassword = password && String(password).length >= 6
      ? String(password)
      : generateRandomPassword();

    let existingUser: admin.auth.UserRecord | null = null;
    try {
      existingUser = await auth.getUserByEmail(emailTrimmed);
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") {
        throw err;
      }
    }

    if (existingUser) {
      // User exists - update Firestore to add them as coach in this org
      const userDoc = await db.collection("users").doc(existingUser.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      // If no Firestore doc exists (e.g. user from different app), create one
      if (!userDoc.exists) {
        await db.collection("users").doc(existingUser.uid).set({
          email: emailTrimmed,
          fullName: fullName?.trim() || null,
          username: emailTrimmed.split("@")[0],
          role: "coach",
          organisationId,
          activeOrganisationId: organisationId,
          organisations: [organisationId],
          xp: 0,
          level: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
          success: true,
          message: "Existing user added as coach",
          userId: existingUser.uid,
          email: emailTrimmed,
          password: null,
        };
      }

      const existingOrgs = userData?.organisations || [];
      const hasOrg = existingOrgs.includes(organisationId) ||
        userData?.organisationId === organisationId ||
        userData?.activeOrganisationId === organisationId;

      if (!hasOrg) {
        // Add org to their account
        const updatedOrgs = [...new Set([...existingOrgs, organisationId])];
        await db.collection("users").doc(existingUser.uid).update({
          organisations: updatedOrgs,
          organisationId: organisationId,
          activeOrganisationId: organisationId,
          role: "coach",
          fullName: fullName?.trim() || userData?.fullName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Just update role to coach
        await db.collection("users").doc(existingUser.uid).update({
          role: "coach",
          fullName: fullName?.trim() || userData?.fullName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        message: "Existing user added as coach",
        userId: existingUser.uid,
        email: emailTrimmed,
        password: null, // Don't return password for existing users - they have their own
      };
    }

    // Create new Firebase Auth user
    const userRecord = await auth.createUser({
      email: emailTrimmed,
      password: finalPassword,
      emailVerified: false,
      displayName: fullName?.trim() || undefined,
    });

    // Create Firestore user doc
    await db.collection("users").doc(userRecord.uid).set({
      email: emailTrimmed,
      fullName: fullName?.trim() || null,
      username: emailTrimmed.split("@")[0],
      role: "coach",
      organisationId,
      activeOrganisationId: organisationId,
      organisations: [organisationId],
      xp: 0,
      level: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Coach account created successfully",
      userId: userRecord.uid,
      email: emailTrimmed,
      password: finalPassword, // Return so admin can share with coach
    };
  } catch (error: any) {
    console.error("Error creating coach account:", error);
    throw new Error(error.message || "Failed to create coach account");
  }
});

function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
