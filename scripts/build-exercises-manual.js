#!/usr/bin/env node
/**
 * Manual Exercise Catalog Builder
 * 
 * Since the automated scripts aren't working, let's build it manually
 * This script will help you create exercises.json step by step
 * 
 * Run: node scripts/build-exercises-manual.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function cleanExerciseName(filename) {
  return filename
    .replace(/\.(mp4|mov|avi|mkv)$/i, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function buildManually() {
  console.log('🏋️ Manual Exercise Catalog Builder\n');
  console.log('================================================\n');
  console.log('This will help you build exercises.json manually.\n');
  console.log('Steps:\n');
  console.log('1. Go to Firebase Console → Storage');
  console.log('2. Navigate to exercises/{category}/');
  console.log('3. Click on a video file');
  console.log('4. Copy the "Download URL" from the right panel\n');
  console.log('We\'ll use this to build the catalog!\n');
  console.log('================================================\n\n');

  const sampleUrl = await ask('Paste ONE sample video URL from Firebase Storage: ');
  
  if (!sampleUrl.includes('firebasestorage.googleapis.com')) {
    console.log('\n❌ That doesn\'t look like a Firebase Storage URL.');
    console.log('It should start with: https://firebasestorage.googleapis.com/');
    rl.close();
    return;
  }

  console.log('\n✅ Great! Now I can build URLs for all your videos.\n');

  // Extract bucket info from sample URL
  const bucketMatch = sampleUrl.match(/\/b\/([^\/]+)\//);
  const bucket = bucketMatch ? bucketMatch[1] : 'lifeset-v2.firebasestorage.app';

  console.log(`📦 Using bucket: ${bucket}\n`);

  const categories = {
    chest: [],
    back: [],
    shoulders: [],
    legs: [],
    biceps: [],
    triceps: [],
    abs: [],
    glutes: [],
    cardio: [],
    stretching: []
  };

  console.log('Now, tell me the video filenames in each category.\n');
  console.log('(Just the filename, like "bench-press.mp4")\n');
  console.log('(Press Enter with empty line to skip a category)\n\n');

  for (const category of Object.keys(categories)) {
    console.log(`\n📂 ${category.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    let fileCount = 1;
    while (true) {
      const filename = await ask(`  ${fileCount}. Enter filename (or press Enter to finish): `);
      if (!filename.trim()) break;
      
      categories[category].push(filename.trim());
      fileCount++;
    }
    
    console.log(`✅ Added ${categories[category].length} videos for ${category}`);
  }

  // Build exercises array
  console.log('\n\n📝 Building exercises.json...\n');
  
  const exercises = [];
  let exerciseId = 1;

  for (const [category, filenames] of Object.entries(categories)) {
    for (const filename of filenames) {
      const exerciseName = cleanExerciseName(filename);
      
      // Build Firebase Storage URL
      const encodedPath = encodeURIComponent(`exercises/${category}/${filename}`);
      const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
      
      exercises.push({
        id: exerciseId++,
        name: exerciseName,
        category: category,
        description: `${exerciseName} exercise with video tutorial`,
        difficulty: 'intermediate',
        equipment: [],
        muscleGroups: [category],
        videoUrl: videoUrl,
        thumbnailUrl: null,
        duration: null,
        originalFilename: filename
      });

      console.log(`  ${exerciseId - 1}. ${exerciseName}`);
    }
  }

  // Save to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));

  console.log('\n\n✨ SUCCESS!\n');
  console.log('================================================');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📊 Total exercises: ${exercises.length}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review the generated exercises.json');
  console.log('   2. Restart your app');
  console.log('   3. Test videos in the Exercise Catalog!\n');

  rl.close();
}

buildManually().catch(error => {
  console.error('Error:', error);
  rl.close();
});

