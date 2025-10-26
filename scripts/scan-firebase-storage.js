#!/usr/bin/env node
/**
 * Scan Firebase Storage (No Auth Required)
 * 
 * This script scans Firebase Storage public URLs and generates exercises.json
 * Works without authentication if videos are publicly readable
 * 
 * Run: node scripts/scan-firebase-storage.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const PROJECT_ID = 'lifeset-v2';
const BUCKET = 'lifeset-v2.firebasestorage.app';
const CATEGORIES = ['chest', 'legs', 'abs', 'biceps', 'triceps', 'stretching', 'glutes', 'back', 'shoulders', 'cardio'];

// ============================================
// HELPER FUNCTIONS
// ============================================

function cleanExerciseName(filename) {
  return filename
    .replace(/\.(mp4|mov|avi|mkv)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ============================================
// MAIN FUNCTION
// ============================================

async function scanFirebaseStorage() {
  console.log('🔥 Scan Firebase Storage for Exercise Videos\n');
  console.log('================================================\n');
  console.log('📡 Connecting to Firebase Storage...\n');

  const exercises = [];
  let exerciseId = 1;
  let totalVideos = 0;

  for (const category of CATEGORIES) {
    console.log(`\n📂 Scanning ${category}...`);
    
    try {
      // Firebase Storage REST API endpoint
      const listUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?prefix=exercises/${category}/&delimiter=/`;
      
      const response = await fetchJSON(listUrl);
      
      if (!response.items || response.items.length === 0) {
        console.log(`   ⚠️  No videos found`);
        continue;
      }

      console.log(`   ✅ Found ${response.items.length} files`);

      for (const item of response.items) {
        const filename = item.name.split('/').pop();
        
        // Skip non-video files
        if (!/\.(mp4|mov|avi|mkv)$/i.test(filename)) {
          continue;
        }

        const exerciseName = cleanExerciseName(filename);
        
        // Construct download URL
        const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(item.name)}?alt=media`;
        
        console.log(`   ${exerciseId}. ${exerciseName}`);
        
        exercises.push({
          id: exerciseId++,
          name: exerciseName,
          category: category,
          description: `${exerciseName} exercise with video tutorial`,
          difficulty: 'intermediate',
          equipment: [],
          muscleGroups: [category],
          videoUrl: downloadURL,
          thumbnailUrl: null,
          duration: null,
          originalFilename: filename
        });

        totalVideos++;
      }

    } catch (error) {
      console.log(`   ⚠️  Error scanning ${category}: ${error.message}`);
      console.log(`   💡 Make sure you've uploaded videos to: exercises/${category}/`);
    }
  }

  if (exercises.length === 0) {
    console.log('\n\n❌ No exercises found!');
    console.log('\n💡 Steps to fix:');
    console.log('   1. Go to Firebase Console → Storage');
    console.log('   2. Upload videos to exercises/{category}/ folders');
    console.log('   3. Make sure files are .mp4, .mov, .avi, or .mkv');
    console.log('   4. Run this script again\n');
    process.exit(1);
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
  console.log('   2. Customize descriptions, difficulty, equipment if needed');
  console.log('   3. Restart your app to load the videos\n');

  process.exit(0);
}

// ============================================
// RUN THE SCRIPT
// ============================================

scanFirebaseStorage().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  console.error('\n💡 Common issues:');
  console.error('   - Videos not uploaded to Firebase Storage yet');
  console.error('   - Storage rules need to be updated');
  console.error('   - Incorrect folder structure (should be exercises/{category}/)\n');
  process.exit(1);
});

