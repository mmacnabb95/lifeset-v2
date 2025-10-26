/**
 * Upload Exercise Videos to Firebase Storage
 * 
 * This script uploads your exercise videos to Firebase Storage
 * and generates an exercises.json catalog
 * 
 * Run: node scripts/upload-videos-to-firebase.js
 */

const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

// Path to your video files folder
const VIDEOS_FOLDER = '/Users/matthewmacnabb/Documents/lifeset-v2/exercise-videos';

// Firebase Admin SDK service account (download from Firebase Console)
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'lifeset-v2.firebasestorage.app', // Your Firebase Storage bucket
});

const bucket = admin.storage().bucket();

// ============================================
// UPLOAD FUNCTION
// ============================================
async function uploadVideosToFirebase() {
  try {
    console.log('🚀 Starting video upload to Firebase Storage...\n');
    
    // Categories based on your folder structure
    const categories = ['chest', 'legs', 'abs', 'biceps', 'triceps', 'stretching', 'glutes', 'back', 'shoulders', 'cardio'];
    
    const exercises = [];
    let uploadedCount = 0;
    let totalFiles = 0;

    // Process each category folder
    for (const category of categories) {
      const categoryPath = path.join(VIDEOS_FOLDER, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        const videoFiles = files.filter(f => 
          f.endsWith('.mp4') || 
          f.endsWith('.mov') || 
          f.endsWith('.avi')
        );
        
        totalFiles += videoFiles.length;
        console.log(`📂 Category: ${category} (${videoFiles.length} videos)`);

        // Upload each video in this category
        for (const file of videoFiles) {
          const filePath = path.join(categoryPath, file);
          const fileName = path.parse(file).name;
          
          // Clean up filename: remove 720p, 1080p, etc.
          let exerciseName = fileName
            .replace(/720p/gi, '')
            .replace(/1080p/gi, '')
            .replace(/480p/gi, '')
            .replace(/^[\s-_]+|[\s-_]+$/g, '') // trim dashes/underscores
            .replace(/[-_]/g, ' ') // replace dashes/underscores with spaces
            .replace(/\s+/g, ' ') // normalize spaces
            .trim();
      
          // Capitalize first letter of each word
          exerciseName = exerciseName.replace(/\b\w/g, l => l.toUpperCase());
          
          console.log(`   📤 Uploading: ${file} → "${exerciseName}"...`);
          
          try {
            // Upload to Firebase Storage
            const destination = `exercises/${category}/${file}`;
            await bucket.upload(filePath, {
              destination,
              metadata: {
                contentType: 'video/mp4',
                cacheControl: 'public, max-age=31536000',
              },
            });

            // Make the file publicly accessible
            const uploadedFile = bucket.file(destination);
            await uploadedFile.makePublic();
            
            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
            
            uploadedCount++;
            console.log(`   ✅ ${uploadedCount}/${totalFiles} uploaded`);

            // Add to exercises catalog
            exercises.push({
              id: `${category}-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: exerciseName,
              description: `${exerciseName} exercise with video tutorial`,
              category: category.charAt(0).toUpperCase() + category.slice(1),
              difficulty: 'intermediate', // Default, you can customize later
              muscleGroup: category,
              equipment: 'Various', // You can customize later
              videoUrl: publicUrl,
              thumbnailUrl: '', // You can add thumbnails later
              instructions: [
                'Watch the video tutorial carefully',
                'Follow proper form as demonstrated',
                'Start with appropriate weight/intensity',
                'Focus on controlled movements',
              ],
            });

          } catch (uploadError) {
            console.error(`   ❌ Failed to upload ${file}:`, uploadError.message);
          }
        }
        
      } catch (categoryError) {
        console.error(`❌ Error reading category ${category}:`, categoryError.message);
      }
    }

    // ============================================
    // Save exercises.json
    // ============================================
    console.log('\n💾 Generating exercises.json...');
    
    const exercisesJSON = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalExercises: exercises.length,
      source: 'firebase-storage',
      exercises: exercises,
    };

    const outputPath = path.join(__dirname, '../src/data/exercises.json');
    await fs.writeFile(outputPath, JSON.stringify(exercisesJSON, null, 2));
    
    console.log(`   ✅ Saved ${exercises.length} exercises to: ${outputPath}`);

    // ============================================
    // Summary
    // ============================================
    console.log('\n✨ Upload Complete!\n');
    console.log('Summary:');
    console.log(`   📹 Videos uploaded: ${uploadedCount}/${videoFiles.length}`);
    console.log(`   💾 Total size: 6.18GB`);
    console.log(`   📄 Catalog created: src/data/exercises.json`);
    console.log(`\n✅ Your exercise videos are now on Firebase Storage!`);
    console.log(`💰 Estimated cost: ~$0.16/month storage + $2-5/month bandwidth`);

  } catch (error) {
    console.error('❌ Upload failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Download service account key from Firebase Console');
    console.error('2. Save as scripts/serviceAccountKey.json');
    console.error('3. Update VIDEOS_FOLDER path');
    console.error('4. Install firebase-admin: npm install firebase-admin');
    process.exit(1);
  }
}

// ============================================
// RUN UPLOAD
// ============================================
uploadVideosToFirebase();

