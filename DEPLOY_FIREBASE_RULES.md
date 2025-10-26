# Deploy Firebase Rules Guide

## 🔥 Why Deploy Rules?

Firebase Storage rules control who can read/write files. You need to deploy the updated rules so:
1. Videos can be uploaded to Firebase Storage
2. Users can view videos in the app
3. The scanning scripts can access video URLs

---

## 📋 Quick Setup

### **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
```

---

### **Step 2: Login to Firebase**

```bash
firebase login
```

This will open a browser window - sign in with your Google account (the one that owns the Firebase project).

---

### **Step 3: Initialize Firebase (One-Time Setup)**

```bash
cd /Users/matthewmacnabb/Documents/lifeset-v2
firebase init
```

**When prompted:**

1. **"Which Firebase features?"**
   - Select: `Storage` (use spacebar to select)
   - Press Enter

2. **"Select a default Firebase project"**
   - Choose: `lifeset-v2`

3. **"What file should be used for Storage Rules?"**
   - Enter: `src/services/firebase/storage.rules`

4. **Setup complete!**

---

### **Step 4: Deploy Storage Rules**

```bash
firebase deploy --only storage
```

You should see:
```
✔  Deploy complete!

Storage Rules for lifeset-v2:
  Released: storage.rules
```

---

## ✅ Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **lifeset-v2** project
3. Click **Storage** → **Rules** tab
4. You should see the rules from `src/services/firebase/storage.rules`

---

## 🎯 Alternative: Deploy via Firebase Console (No CLI)

If you prefer not to use the CLI:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **lifeset-v2**
3. Click **Storage**
4. Click **Rules** tab
5. Click **Edit rules**
6. Copy the contents of `src/services/firebase/storage.rules`
7. Paste into the editor
8. Click **Publish**

---

## 📝 Current Storage Rules

Your rules allow:
- ✅ **Read**: Anyone authenticated can view videos
- ✅ **Write**: Authenticated users can upload videos (for initial bulk upload)
- ✅ **Size limit**: Up to 500MB per video

After uploading all videos, you can lock down write access by changing:
```
allow write: if isAuthenticated()
```
to:
```
allow write: if false; // Only admins via console
```

---

## 🐛 Troubleshooting

### "Command not found: firebase"
**Solution**: Install Firebase CLI globally
```bash
npm install -g firebase-tools
```

### "Permission denied"
**Solution**: 
- Make sure you're logged in: `firebase login`
- Check you selected the right project

### "No project active"
**Solution**: 
```bash
firebase use lifeset-v2
```

### "Storage Rules failed to deploy"
**Solution**: 
- Check syntax in `storage.rules` file
- Make sure you initialized storage: `firebase init storage`

---

## 🚀 After Deploying Rules

Now you can:
1. ✅ Upload videos via Firebase Console
2. ✅ Run the scan script without authentication
3. ✅ Videos will be readable in the app

---

## 💡 Recommended Workflow

1. **Deploy rules** (one-time): `firebase deploy --only storage`
2. **Upload videos** via Firebase Console (manual drag & drop)
3. **Generate catalog**: `node scripts/scan-firebase-storage.js` (no auth needed!)
4. **Lock down writes** after upload (optional, for security)

This is the easiest and most reliable method! 🎉

