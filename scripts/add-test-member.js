/**
 * Add Test Member Script
 * 
 * Creates a test member user in Firestore and optionally in Firebase Authentication
 * Links them to an existing organisation
 * 
 * Usage:
 *   node scripts/add-test-member.js
 * 
 * Or with custom email:
 *   node scripts/add-test-member.js --email member@test.com --org-id YOUR_ORG_ID
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
const orgIdArg = args.find(arg => arg.startsWith("--org-id="))?.split("=")[1];
const createAuthArg = args.includes("--create-auth");

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

async function addTestMember() {
  try {
    console.log("\n🔧 LifeSet Test Member Setup\n");
    console.log("This script will:");
    console.log("1. Create a test member user document in Firestore");
    console.log("2. Optionally create a user in Firebase Authentication");
    console.log("3. Link them to your organisation\n");

    // Get organisation ID
    let organisationId = orgIdArg;
    if (!organisationId) {
      // Try to find an organisation from an admin user
      console.log("Looking for existing organisations...");
      const orgsSnapshot = await db.collection("organisations").limit(1).get();
      
      if (!orgsSnapshot.empty) {
        const org = orgsSnapshot.docs[0].data();
        organisationId = org.organisationId;
        console.log(`✅ Found organisation: ${org.name} (${organisationId})`);
        console.log(`   Using this organisation automatically\n`);
      } else {
        throw new Error("No organisations found. Please provide --org-id argument");
      }
    }

    if (!organisationId) {
      throw new Error("Organisation ID is required");
    }

    // Verify organisation exists
    const orgDoc = await db.collection("organisations").doc(organisationId).get();
    if (!orgDoc.exists) {
      throw new Error(`Organisation ${organisationId} not found`);
    }
    const orgData = orgDoc.data();
    console.log(`✅ Organisation: ${orgData.name}`);

    // Get email
    const email = emailArg || `test-member-${Date.now()}@example.com`;
    console.log(`📧 Email: ${email}`);

    // Create Firestore-only user by default (no Auth)
    let userId = `test-member-${Date.now()}`;
    console.log(`\n📝 Creating Firestore-only user (no Auth account)`);
    console.log(`   Generated UID: ${userId}`);
    
    // If --create-auth flag is set, create Auth user
    if (createAuthArg) {
      const password = "test123456";
      try {
        const user = await auth.createUser({
          email: email,
          password: password,
          emailVerified: true,
        });
        userId = user.uid;
        console.log("✅ User created in Firebase Authentication");
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
      } catch (error) {
        if (error.code === "auth/email-already-exists") {
          console.log(`⚠️  User with email ${email} already exists in Authentication`);
          const existingUser = await auth.getUserByEmail(email);
          userId = existingUser.uid;
          console.log(`   Using existing user: ${userId}`);
        } else {
          throw error;
        }
      }
    }

    // Create Firestore user document
    console.log("\n📝 Creating user document in Firestore...");
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const userData = {
      uid: userId,
      email: email,
      username: email.split("@")[0],
      role: "member",
      organisationId: organisationId,
      xp: 0,
      level: 1,
      streak: 0,
      hasCompletedOnboarding: false,
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

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ Test Member Created!");
    console.log("=".repeat(50));
    console.log("\n📧 Email:", email);
    console.log("👤 User UID:", userId);
    console.log("🔐 Role: member");
    console.log("🏢 Organisation:", orgData.name);
    console.log("🏢 Organisation ID:", organisationId);
    if (createAuthArg) {
      console.log("\n💡 This user can now login to the mobile app");
    } else {
      console.log("\n💡 This is a Firestore-only user (no login capability)");
      console.log("   Use for testing admin dashboard features");
      console.log("   To create with Auth, use: --create-auth flag");
    }
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code) {
      console.error("   Error code:", error.code);
    }
    process.exit(1);
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

// Run the script
addTestMember()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

