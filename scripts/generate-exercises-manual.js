/**
 * Manual exercise list generator
 * Since we can't access the exercise-videos folder programmatically,
 * just paste your video filenames below and run this script
 */

const fs = require('fs');
const path = require('path');

// INSTRUCTIONS:
// 1. For each category, paste the video filenames from Finder
// 2. Run: node scripts/generate-exercises-manual.js

const videosByCategory = {
  chest: [
    // Example: 'bench-press.mp4', 'pushups-720p.mp4'
    // Paste your chest exercise video filenames here
  ],
  back: [
    // Paste your back exercise video filenames here
  ],
  shoulders: [
    // Paste your shoulder exercise video filenames here
  ],
  legs: [
    // Paste your leg exercise video filenames here
  ],
  biceps: [
    // Paste your bicep exercise video filenames here
  ],
  triceps: [
    // Paste your tricep exercise video filenames here
  ],
  abs: [
    // Paste your ab exercise video filenames here
  ],
  glutes: [
    // Paste your glute exercise video filenames here
  ],
  cardio: [
    // Paste your cardio exercise video filenames here
  ],
  stretching: [
    // Paste your stretching exercise video filenames here
  ],
  arms: [
    // Paste your arm exercise video filenames here
  ]
};

function cleanExerciseName(filename) {
  let name = filename.replace(/\.(mp4|mov|avi|mkv)$/i, '');
  name = name.replace(/720p|1080p|4k|hd/gi, '');
  name = name.replace(/[_-]/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return name;
}

console.log('📝 Generating exercises.json...\n');

const exercises = [];
let exerciseId = 1;

for (const [category, files] of Object.entries(videosByCategory)) {
  if (files.length === 0) continue;
  
  console.log(`✓ ${category}: ${files.length} exercises`);
  
  for (const file of files) {
    const exerciseName = cleanExerciseName(file);
    
    exercises.push({
      id: exerciseId++,
      name: exerciseName,
      category: category,
      description: `${exerciseName} exercise`,
      difficulty: 'intermediate',
      equipment: [],
      muscleGroups: [category],
      videoUrl: `https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/exercises%2F${category}%2F${encodeURIComponent(file)}?alt=media`,
      thumbnailUrl: null,
      duration: null,
      originalFilename: file
    });
  }
}

const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));

console.log(`\n✨ Generated ${exercises.length} exercises!`);
console.log(`📁 Saved to: ${outputPath}\n`);

