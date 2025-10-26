/**
 * Simple script to generate exercises.json from video filenames
 * Run from the exercise-videos directory
 */

const fs = require('fs');
const path = require('path');

// Categories that match your folder names
const categories = [
  'chest', 'back', 'shoulders', 'legs', 'arms',
  'biceps', 'triceps', 'abs', 'glutes', 'cardio', 'stretching'
];

function cleanExerciseName(filename) {
  // Remove file extension
  let name = filename.replace(/\.(mp4|mov|avi|mkv)$/i, '');
  
  // Remove common video quality indicators
  name = name.replace(/720p|1080p|4k|hd/gi, '');
  
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ');
  
  // Remove extra spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter of each word
  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name;
}

console.log('📝 Generating exercises.json from video files...\n');

const exercises = [];
let exerciseId = 1;

// Process each category
for (const category of categories) {
  const categoryPath = path.join(process.cwd(), category);
  
  if (!fs.existsSync(categoryPath)) {
    console.log(`⚠️  Skipping category: ${category} (folder not found)`);
    continue;
  }
  
  try {
    const files = fs.readdirSync(categoryPath);
    const videoFiles = files.filter(file => 
      /\.(mp4|mov|avi|mkv)$/i.test(file)
    );
    
    console.log(`✓ ${category}: Found ${videoFiles.length} videos`);
    
    for (const file of videoFiles) {
      const exerciseName = cleanExerciseName(file);
      
      exercises.push({
        id: exerciseId++,
        name: exerciseName,
        category: category,
        description: `${exerciseName} exercise`,
        difficulty: 'intermediate', // You can update these manually later
        equipment: [],
        muscleGroups: [category],
        videoUrl: `https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/exercises%2F${category}%2F${encodeURIComponent(file)}?alt=media`,
        thumbnailUrl: null,
        duration: null, // In seconds, can be updated later
        originalFilename: file
      });
    }
  } catch (err) {
    console.log(`❌ Error reading category ${category}:`, err.message);
  }
}

// Save to src/data/exercises.json
const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));

console.log(`\n✨ Generated ${exercises.length} exercises!`);
console.log(`📁 Saved to: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Upload videos to Firebase Storage manually (or use Firebase Console)');
console.log('2. Update videoUrl in exercises.json with actual Firebase URLs');
console.log('3. Optionally update difficulty, equipment, duration fields\n');

