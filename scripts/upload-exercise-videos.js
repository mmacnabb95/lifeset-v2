#!/usr/bin/env node
/**
 * Upload Exercise Videos to Firebase Storage
 * 
 * This script uploads your exercise videos to Firebase Storage
 * and updates the exercises.json catalog with real video URLs
 * 
 * Run: node scripts/upload-exercise-videos.js
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
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

// Path to your video files folder
const VIDEOS_FOLDER = '/Users/matthewmacnabb/Documents/lifeset-v2/exercise-videos';

// Categories based on your folder structure
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
// MAIN UPLOAD FUNCTION
// ============================================

async function uploadVideosToFirebase() {
  console.log('🚀 Exercise Video Uploader to Firebase Storage\n');
  console.log('================================================\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const auth = getAuth(app);

  // Ask for Firebase credentials
  const rl = createReadlineInterface();
  
  console.log('📧 Firebase Authentication Required\n');
  console.log('Please enter your Firebase credentials to upload videos:\n');
  
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

  console.log('📁 Scanning video files...\n');

  const exercises = [];
  let uploadedCount = 0;
  let skippedCount = 0;
  let exerciseId = 1;

  // Process each category
  for (const category of CATEGORIES) {
    const categoryPath = path.join(VIDEOS_FOLDER, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Skipping ${category}: Folder not found`);
      continue;
    }

    try {
      const files = fs.readdirSync(categoryPath);
      const videoFiles = files.filter(file => 
        /\.(mp4|mov|avi|mkv)$/i.test(file)
      );

      if (videoFiles.length === 0) {
        console.log(`⚠️  ${category}: No video files found`);
        continue;
      }

      console.log(`\n📂 ${category.toUpperCase()}: Found ${videoFiles.length} videos`);
      console.log('─'.repeat(50));

      for (const file of videoFiles) {
        const filePath = path.join(categoryPath, file);
        const exerciseName = cleanExerciseName(file);
        const fileSize = fs.statSync(filePath).size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

        console.log(`\n${uploadedCount + 1}. ${exerciseName}`);
        console.log(`   📦 Size: ${fileSizeMB} MB`);
        console.log(`   📤 Uploading to Firebase Storage...`);

        try {
          // Read the file
          const fileBuffer = fs.readFileSync(filePath);
          
          // Create a reference in Firebase Storage
          const storageRef = ref(storage, `exercises/${category}/${file}`);
          
          // Upload the file
          const metadata = {
            contentType: 'video/mp4',
            cacheControl: 'public, max-age=31536000',
          };
          
          await uploadBytes(storageRef, fileBuffer, metadata);
          
          // Get the download URL
          const downloadURL = await getDownloadURL(storageRef);
          
          uploadedCount++;
          console.log(`   ✅ Uploaded! (${uploadedCount} total)`);

          // Add to exercises catalog
          exercises.push({
            id: exerciseId++,
            name: exerciseName,
            category: category,
            description: `${exerciseName} exercise with video tutorial`,
            difficulty: 'intermediate', // Default, can be customized later
            equipment: [],
            muscleGroups: [category],
            videoUrl: downloadURL,
            thumbnailUrl: null,
            duration: null, // Can be extracted from video metadata later
            originalFilename: file
          });

        } catch (uploadError) {
          skippedCount++;
          console.error(`   ❌ Upload failed:`, uploadError.message);
        }
      }

    } catch (error) {
      console.error(`❌ Error processing ${category}:`, error.message);
    }
  }

  // Save exercises.json
  console.log('\n\n💾 Generating exercises.json...');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  console.log(`✅ Saved to: ${outputPath}`);

  // Summary
  console.log('\n\n📊 UPLOAD SUMMARY');
  console.log('================================================');
  console.log(`✅ Successfully uploaded: ${uploadedCount} videos`);
  console.log(`❌ Failed/Skipped: ${skippedCount} videos`);
  console.log(`📝 Total exercises in catalog: ${exercises.length}`);
  console.log('\n✨ Done! Your exercise videos are now in Firebase Storage!');
  console.log('\n💡 Next steps:');
  console.log('   1. Check src/data/exercises.json for the updated catalog');
  console.log('   2. Restart your app to load the new video URLs');
  console.log('   3. Browse exercises in the Workout Catalog screen\n');

  rl.close();
  process.exit(0);
}

// ============================================
// RUN THE SCRIPT
// ============================================

uploadVideosToFirebase().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

