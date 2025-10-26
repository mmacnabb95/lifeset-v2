import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a profile picture to Firebase Storage
 * @param userId - The user's ID
 * @param imageUri - Local URI of the image (from image picker)
 * @returns Download URL of the uploaded image
 */
export const uploadProfilePicture = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create a reference in Firebase Storage
    const filename = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `users/${userId}/profile/${filename}`);

    // Upload the image
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    };

    await uploadBytes(storageRef, blob, metadata);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Profile picture uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
};

/**
 * Delete a profile picture from Firebase Storage
 * @param imageUrl - The full download URL of the image to delete
 */
export const deleteProfilePicture = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the storage path from the URL
    const pathMatch = imageUrl.match(/o\/(.+?)\?/);
    if (!pathMatch) {
      console.warn('Could not extract path from URL:', imageUrl);
      return;
    }

    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);

    await deleteObject(storageRef);
    console.log('Profile picture deleted:', storagePath);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Don't throw - deletion errors are non-critical
  }
};

