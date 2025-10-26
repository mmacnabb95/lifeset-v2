#!/usr/bin/env node
/**
 * Generate exercises.json from Firebase Storage
 * 
 * This script connects to Firebase Storage, scans the exercises folder,
 * and generates exercises.json with the correct download URLs
 * 
 * Run: node scripts/generate-exercises-from-firebase.js
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================
// CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyC0J13ZNoc_igOMAJb2-QBfKBRaStpCikQ",
  authDomain: "lifeset-v2.firebaseapp.com",
  projectId: "lifeset-v2",
  storageBucket: "lifeset-v2.firebasestorage.app",
  messagingSenderId: "178817634463",
  appId: "1:178817634463:web:627c56190c9a1a61e252aa"
};

const CATEGORIES = ['chest', 'legs', 'abs', 'biceps', 'triceps', 'stretching', 'glutes', 'back', 'shoulders', 'cardio'];

// ============================================
// HELPER FUNCTIONS
// ============================================

function cleanExerciseName(filename) {
  return filename
    .replace(/\.(mp4|mov|avi|mkv)$/i, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// ============================================
// MAIN FUNCTION
// ============================================

async function generateExercisesFromFirebase() {
  console.log('🔥 Generate exercises.json from Firebase Storage\n');
  console.log('================================================\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const auth = getAuth(app);

  // Ask for Firebase credentials
  const rl = createReadlineInterface();
  
  console.log('📧 Firebase Authentication Required\n');
  console.log('Please enter your Firebase credentials:\n');
  
  const email = await askQuestion(rl, 'Email: ');
  const password = await askQuestion(rl, 'Password: ');
  
  console.log('\n🔐 Authenticating...');
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authentication successful!\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    rl.close();
    process.exit(1);
  }

  console.log('📁 Scanning Firebase Storage for videos...\n');

  const exercises = [];
  let exerciseId = 1;
  let totalVideos = 0;

  // Process each category
  for (const category of CATEGORIES) {
    console.log(`\n📂 Scanning ${category}...`);
    
    try {
      // Get reference to category folder
      const categoryRef = ref(storage, `exercises/${category}`);
      
      // List all files in the category
      const result = await listAll(categoryRef);
      
      if (result.items.length === 0) {
        console.log(`   ⚠️  No videos found`);
        continue;
      }

      console.log(`   ✅ Found ${result.items.length} videos`);

      // Process each video file
      for (const itemRef of result.items) {
        const filename = itemRef.name;
        
        // Skip non-video files
        if (!/\.(mp4|mov|avi|mkv)$/i.test(filename)) {
          continue;
        }

        try {
          // Get download URL
          const downloadURL = await getDownloadURL(itemRef);
          const exerciseName = cleanExerciseName(filename);
          
          console.log(`   ${exerciseId}. ${exerciseName}`);
          
          exercises.push({
            id: exerciseId++,
            name: exerciseName,
            category: category,
            description: `${exerciseName} exercise with video tutorial`,
            difficulty: 'intermediate', // Default, customize later
            equipment: [],
            muscleGroups: [category],
            videoUrl: downloadURL,
            thumbnailUrl: null,
            duration: null,
            originalFilename: filename
          });

          totalVideos++;

        } catch (error) {
          console.error(`   ❌ Error getting URL for ${filename}:`, error.message);
        }
      }

    } catch (error) {
      console.error(`❌ Error scanning ${category}:`, error.message);
    }
  }

  // Save exercises.json
  console.log('\n\n💾 Generating exercises.json...');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  console.log(`✅ Saved to: ${outputPath}`);

  // Summary
  console.log('\n\n📊 GENERATION SUMMARY');
  console.log('================================================');
  console.log(`✅ Total exercises generated: ${exercises.length}`);
  console.log(`📹 Total videos found: ${totalVideos}`);
  console.log('\n✨ Done! Your exercises.json is ready!');
  console.log('\n💡 Next steps:');
  console.log('   1. Review src/data/exercises.json');
  console.log('   2. Customize descriptions, difficulty, equipment');
  console.log('   3. Restart your app to load the new videos\n');

  rl.close();
  process.exit(0);
}

// ============================================
// RUN THE SCRIPT
// ============================================

generateExercisesFromFirebase().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

