#!/usr/bin/env node
/**
 * List files from Firebase Storage (Debug Version)
 * This will show you exactly what the API returns
 */

const https = require('https');

const BUCKET = 'lifeset-v2.firebasestorage.app';
const CATEGORY = 'chest'; // Change this to test different categories

console.log(`🔍 Testing Firebase Storage API for category: ${CATEGORY}\n`);
console.log(`URL: https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?prefix=exercises/${CATEGORY}/\n`);

const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?prefix=exercises/${CATEGORY}/`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 Raw Response:\n');
    console.log(data);
    console.log('\n\n📊 Parsed Response:\n');
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.items && parsed.items.length > 0) {
        console.log(`\n✅ Found ${parsed.items.length} items!`);
        console.log('\n📹 Video files:\n');
        
        parsed.items.forEach((item, index) => {
          const filename = item.name.split('/').pop();
          console.log(`${index + 1}. ${filename}`);
          
          if (index === 0) {
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(item.name)}?alt=media`;
            console.log(`   URL: ${downloadUrl}`);
          }
        });
      } else {
        console.log('\n❌ No items found!');
        console.log('\n💡 Possible reasons:');
        console.log('   1. Videos not uploaded yet');
        console.log('   2. Wrong folder path (should be: exercises/chest/)');
        console.log('   3. Storage rules blocking access');
      }
      
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
  
}).on('error', (e) => {
  console.error('Request error:', e);
});

