// Firebase Admin SDK Configuration (for server-side operations)
import * as admin from "firebase-admin";

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  // In production, use service account from environment variable
  // In development, you can use a service account key file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // For local development, you can use Application Default Credentials
    // or a service account key file
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      console.log("Note: Firebase Admin requires service account credentials");
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;

