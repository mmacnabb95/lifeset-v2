# Exercise Videos Upload Guide

## 📹 Overview

This guide will help you upload your exercise videos to Firebase Storage and integrate them into the LifeSet app.

---

## 🎯 Prerequisites

1. **Exercise Videos**: Organized by category in folders
2. **Firebase Account**: Access to your Firebase project console
3. **Firebase Login**: Email/password credentials for authentication

---

## 📁 Step 1: Organize Your Videos

Create a folder structure like this:

```
exercise-videos/
├── chest/
│   ├── bench-press.mp4
│   ├── push-ups.mp4
│   └── ...
├── back/
│   ├── pull-ups.mp4
│   ├── rows.mp4
│   └── ...
├── legs/
│   ├── squats.mp4
│   └── ...
├── shoulders/
├── biceps/
├── triceps/
├── abs/
├── glutes/
├── cardio/
└── stretching/
```

**Place this folder at:**
```
/Users/matthewmacnabb/Documents/lifeset-v2/exercise-videos/
```

---

## 🔥 Step 2: Deploy Storage Rules

The storage rules have been updated to allow authenticated users to upload videos.

### Deploy to Firebase:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not done):
   ```bash
   cd /Users/matthewmacnabb/Documents/lifeset-v2
   firebase init
   ```
   - Select: Storage
   - Choose your project: lifeset-v2
   - Accept default rules file

4. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

---

## 🚀 Step 3: Run the Upload Script

### Option A: Automated Upload (Recommended)

1. **Install dependencies** (if needed):
   ```bash
   npm install firebase
   ```

2. **Run the upload script**:
   ```bash
   node scripts/upload-exercise-videos.js
   ```

3. **Follow the prompts**:
   - Enter your Firebase email
   - Enter your Firebase password
   - Script will upload all videos and generate exercises.json

### Option B: Manual Upload via Firebase Console (RECOMMENDED - EASIEST!)

**Step 1: Access Firebase Storage**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lifeset-v2**
3. Click **Storage** in the left sidebar (folder icon)
4. You'll see your storage bucket: `lifeset-v2.firebasestorage.app`

**Step 2: Create Folder Structure**

1. Click **"Create folder"** button
2. Create a folder named: `exercises`
3. Click into the `exercises` folder
4. Create subfolders for each category:
   - Click "Create folder" for each:
   - `chest`, `back`, `legs`, `shoulders`, `biceps`, `triceps`, `abs`, `glutes`, `cardio`, `stretching`

**Step 3: Upload Videos**

1. Click into a category folder (e.g., `chest`)
2. Click **"Upload file"** button (or drag & drop)
3. Select all videos for that category from your computer
4. Wait for upload to complete (progress bar will show)
5. Repeat for each category

**Step 4: Generate exercises.json Automatically**

After uploading all videos to Firebase Storage, run:

```bash
node scripts/generate-exercises-from-firebase.js
```

This script will:
- Scan your Firebase Storage `exercises/` folder
- Get download URLs for all videos
- Automatically generate `exercises.json` with correct URLs
- No manual copy-pasting needed!

**That's it!** Your videos are uploaded and catalog is generated!

---

## 📝 Step 4: Update exercises.json

The upload script will automatically generate `src/data/exercises.json` with the correct video URLs.

### Manual URL Format (if needed):
```
https://firebasestorage.googleapis.com/v0/b/lifeset-v2.firebasestorage.app/o/exercises%2F{category}%2F{filename}?alt=media&token={token}
```

---

## ✅ Step 5: Verify & Test

1. **Check Firebase Console**:
   - Go to Storage
   - Verify videos are uploaded to `exercises/` folder
   - Check file sizes and permissions

2. **Test in App**:
   - Restart your app
   - Navigate to Workouts → Browse Exercises
   - Tap on an exercise
   - Video should load and play

---

## 🎬 Video Requirements

- **Format**: MP4 (recommended)
- **Resolution**: 720p or 1080p
- **Max Size**: 500MB per video
- **Naming**: Use descriptive names (e.g., `bench-press.mp4`, `pull-ups.mp4`)

---

## 📊 Expected Results

After upload, you should have:

- ✅ Videos in Firebase Storage: `exercises/{category}/{filename}`
- ✅ Updated `src/data/exercises.json` with video URLs
- ✅ Videos playable in the Exercise Detail screen
- ✅ Catalog of exercises organized by category

---

## 🔧 Troubleshooting

### "Permission denied" error
- **Solution**: Run `firebase deploy --only storage` to update rules

### "File too large" error
- **Solution**: Compress videos or increase size limit in storage.rules

### "Authentication failed" error
- **Solution**: Make sure you're using the correct Firebase credentials

### Videos not loading in app
- **Solution**: 
  1. Check Network tab in dev tools for errors
  2. Verify video URLs in exercises.json are correct
  3. Ensure videos are publicly readable

---

## 📱 App Integration

The videos are already integrated into:

1. **Exercise Detail Screen** (`src/pages/workouts/exercise-detail-screen.tsx`)
   - Displays video player
   - Shows exercise info
   - Personal record tracking

2. **Workout Catalog** (`src/pages/workouts/workout-catalog-screen.tsx`)
   - Browse all exercises
   - Filter by category
   - Search by name

3. **Exercise Data** (`src/data/exercises.json`)
   - Exercise metadata
   - Video URLs
   - Categories and difficulty levels

---

## 💡 Tips

1. **Compress videos** before upload to save storage costs and improve loading times
2. **Use consistent naming** for easy organization
3. **Test with a few videos** first before uploading all
4. **Backup your videos** before running bulk operations

---

## 🎯 Next Steps After Upload

1. Update exercise metadata in `exercises.json`:
   - Add proper descriptions
   - Set difficulty levels (beginner/intermediate/advanced)
   - Add equipment requirements
   - List targeted muscle groups

2. Generate thumbnails (optional):
   - Extract first frame from each video
   - Upload to `exercises/{category}/thumbnails/`
   - Update `thumbnailUrl` in exercises.json

3. After upload is complete, you can restrict storage.rules again:
   ```
   allow write: if false; // Only admins
   ```

---

## 📞 Need Help?

If you encounter issues:
1. Check Firebase Console → Storage for upload status
2. Review browser console for errors
3. Verify Firebase credentials and permissions
4. Check that videos are in the correct folder structure

Happy uploading! 🚀

