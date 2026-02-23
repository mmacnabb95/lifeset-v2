/**
 * Setup Admin User Script
 * 
 * Creates a test admin user in Firebase Authentication and Firestore
 * Optionally creates a test organisation
 * 
 * Usage:
 *   node scripts/setup-admin-user.js
 * 
 * Or with custom email/password:
 *   node scripts/setup-admin-user.js --email admin@test.com --password test123456
 */

const admin = require("firebase-admin");
const readline = require("readline");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Parse command line arguments
const args = process.argv.slice(2);
const emailArg = args.find(arg => arg.startsWith("--email="))?.split("=")[1];
const passwordArg = args.find(arg => arg.startsWith("--password="))?.split("=")[1];
const createOrgArg = args.includes("--create-org");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdminUser() {
  try {
    console.log("\n🔧 LifeSet Admin User Setup\n");
    console.log("This script will:");
    console.log("1. Create a user in Firebase Authentication");
    console.log("2. Create a user document in Firestore with admin role");
    console.log("3. Optionally create a test organisation\n");

    // Get email
    let email = emailArg;
    if (!email) {
      email = await askQuestion("Enter email for admin user: ");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Get password
    let password = passwordArg;
    if (!password) {
      password = await askQuestion("Enter password (min 6 characters): ");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`\n⚠️  User with email ${email} already exists in Authentication`);
      const overwrite = await askQuestion("Update existing user? (y/n): ");
      if (overwrite.toLowerCase() !== "y") {
        console.log("Cancelled.");
        rl.close();
        return;
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, create new one
        console.log("\n📝 Creating new user in Authentication...");
        user = await auth.createUser({
          email: email,
          password: password,
          emailVerified: true,
        });
        console.log("✅ User created in Authentication");
      } else {
        throw error;
      }
    }

    // Create or update Firestore user document
    console.log("\n📝 Creating/updating user document in Firestore...");
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    const userData = {
      uid: user.uid,
      email: email,
      username: email.split("@")[0], // Use email prefix as username
      role: "admin",
      xp: 0,
      level: 1,
      streak: 0,
      hasCompletedOnboarding: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (userDoc.exists) {
      // Update existing document
      await userRef.update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ User document updated in Firestore");
    } else {
      // Create new document
      await userRef.set(userData);
      console.log("✅ User document created in Firestore");
    }

    // Ask about creating organisation
    let createOrg = createOrgArg;
    if (!createOrg) {
      const createOrgAnswer = await askQuestion("\nCreate a test organisation? (y/n): ");
      createOrg = createOrgAnswer.toLowerCase() === "y";
    }

    let organisationId = null;
    if (createOrg) {
      console.log("\n📝 Creating test organisation...");
      const orgName = await askQuestion("Organisation name (default: Test Gym): ") || "Test Gym";
      const orgType = await askQuestion("Organisation type (gym/yoga/pilates/hiit/sauna/company, default: gym): ") || "gym";

      const orgRef = db.collection("organisations").doc();
      organisationId = orgRef.id;

      await orgRef.set({
        organisationId: organisationId,
        name: orgName,
        type: orgType,
        logoUrl: "",
        brandColours: {
          primary: "#6366F1",
          secondary: "#FFFFFF",
        },
        featureFlags: {
          bookings: true,
          memberships: true,
          packs: true,
          qrCheckIn: true,
          habits: true,
          challenges: true,
          journaling: false,
          nutrition: false,
          workouts: true,
          analytics: true,
        },
        contentPack: `${orgType}Pack`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Organisation created");

      // Link user to organisation
      await userRef.update({
        organisationId: organisationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ User linked to organisation");
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ Setup Complete!");
    console.log("=".repeat(50));
    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👤 User UID:", user.uid);
    console.log("🔐 Role: admin");
    if (organisationId) {
      console.log("🏢 Organisation ID:", organisationId);
    }
    console.log("\n💡 You can now login to the admin dashboard at:");
    console.log("   http://localhost:3000");
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code) {
      console.error("   Error code:", error.code);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

