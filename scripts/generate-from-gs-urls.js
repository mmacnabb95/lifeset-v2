#!/usr/bin/env node
/**
 * Generate exercises.json from gs:// URLs
 * 
 * This converts Firebase Storage gs:// URLs to public HTTP URLs
 * 
 * Usage:
 * 1. In Firebase Console, copy ALL the gs:// URLs (one per line)
 * 2. Paste them into gs-urls.txt
 * 3. Run: node scripts/generate-from-gs-urls.js
 */

const fs = require('fs');
const path = require('path');

// Your Firebase Storage bucket
const BUCKET = 'lifeset-v2.firebasestorage.app';

function cleanExerciseName(filename) {
  return filename
    .replace(/\.(mp4|mov|avi|mkv)$/i, '')
    .replace(/^\d+\s*/, '') // Remove leading numbers like "45 "
    .replace(/[-_]/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function gsUrlToHttpUrl(gsUrl) {
  // Convert: gs://bucket/path/to/file.mp4
  // To: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.mp4?alt=media
  
  const match = gsUrl.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!match) {
    console.error('Invalid gs:// URL:', gsUrl);
    return null;
  }
  
  const [, bucket, filePath] = match;
  const encodedPath = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}

console.log('🔄 Converting gs:// URLs to HTTP URLs\n');
console.log('================================================\n');

// Check if gs-urls.txt exists
const urlsFilePath = path.join(__dirname, 'gs-urls.txt');

if (!fs.existsSync(urlsFilePath)) {
  console.log('📝 Creating gs-urls.txt template...\n');
  
  const template = `# Paste your gs:// URLs here (one per line)
# Example:
# gs://lifeset-v2.firebasestorage.app/exercises/abs/45 Side Bend.mp4
# gs://lifeset-v2.firebasestorage.app/exercises/chest/Bench Press.mp4

`;
  
  fs.writeFileSync(urlsFilePath, template);
  
  console.log('✅ Created: scripts/gs-urls.txt');
  console.log('\n📋 Next steps:');
  console.log('   1. Open scripts/gs-urls.txt');
  console.log('   2. Paste all your gs:// URLs (one per line)');
  console.log('   3. Run this script again\n');
  process.exit(0);
}

// Read URLs from file
const content = fs.readFileSync(urlsFilePath, 'utf-8');
console.log(`📄 File content length: ${content.length} bytes\n`);

const lines = content
  .split(/\r?\n/) // Handle both Unix and Windows line endings
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments

console.log(`📋 Found ${lines.length} non-comment lines\n`);

if (lines.length === 0) {
  console.log('❌ No URLs found in gs-urls.txt');
  console.log('\n💡 Add your gs:// URLs to scripts/gs-urls.txt (one per line)');
  console.log('\n🔍 File contents:');
  console.log(content.substring(0, 500));
  console.log('\n');
  process.exit(1);
}

console.log(`📁 Found ${lines.length} URLs\n`);

// Process each URL
const exercises = [];
let exerciseId = 1;

for (const gsUrl of lines) {
  if (!gsUrl.startsWith('gs://')) {
    console.log(`⚠️  Skipping invalid URL: ${gsUrl}`);
    continue;
  }
  
  const httpUrl = gsUrlToHttpUrl(gsUrl);
  if (!httpUrl) continue;
  
  // Extract category and filename from path
  const pathMatch = gsUrl.match(/exercises\/([^\/]+)\/(.+)/);
  if (!pathMatch) {
    console.log(`⚠️  Couldn't extract category from: ${gsUrl}`);
    continue;
  }
  
  const [, category, filename] = pathMatch;
  const exerciseName = cleanExerciseName(filename);
  
  console.log(`${exerciseId}. [${category}] ${exerciseName}`);
  
  exercises.push({
    id: exerciseId++,
    name: exerciseName,
    category: category,
    description: `${exerciseName} exercise with video tutorial`,
    difficulty: 'intermediate',
    equipment: [],
    muscleGroups: [category],
    videoUrl: httpUrl,
    thumbnailUrl: null,
    duration: null,
    originalFilename: filename
  });
}

// Save exercises.json
const outputPath = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));

console.log('\n\n✨ SUCCESS!\n');
console.log('================================================');
console.log(`📁 Saved to: ${outputPath}`);
console.log(`📊 Total exercises: ${exercises.length}`);
console.log('\n🔗 Sample URL:');
console.log(exercises[0].videoUrl);
console.log('\n💡 Next steps:');
console.log('   1. Review src/data/exercises.json');
console.log('   2. Restart your app');
console.log('   3. Test videos in the Exercise Catalog!\n');

