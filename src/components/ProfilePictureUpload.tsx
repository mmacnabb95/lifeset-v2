import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture, deleteProfilePicture } from 'src/services/firebase/profile-picture';
import { updateUserProfile } from 'src/services/firebase/user';

interface Props {
  userId: string;
  currentImageUrl?: string;
  onImageUpdated?: (url: string) => void;
  size?: number;
}

export const ProfilePictureUpload: React.FC<Props> = ({
  userId,
  currentImageUrl,
  onImageUpdated,
  size = 120,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8, // Compress to 80% quality
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);

        // Delete old profile picture if exists
        if (imageUrl) {
          await deleteProfilePicture(imageUrl);
        }

        // Upload new profile picture
        const downloadURL = await uploadProfilePicture(userId, result.assets[0].uri);

        // Update user profile with new picture URL
        await updateUserProfile(userId, {
          profilePictureUrl: downloadURL,
        });

        setImageUrl(downloadURL);
        onImageUpdated?.(downloadURL);

        Alert.alert('Success!', 'Profile picture updated!');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);

              if (imageUrl) {
                await deleteProfilePicture(imageUrl);
              }

              // Update user profile to remove picture URL
              await updateUserProfile(userId, {
                profilePictureUrl: '',
              });

              setImageUrl(undefined);
              onImageUpdated?.('');

              Alert.alert('Success!', 'Profile picture removed');
            } catch (error: any) {
              console.error('Error removing profile picture:', error);
              Alert.alert('Error', 'Failed to remove profile picture');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={pickImage}
        disabled={uploading}
        style={[styles.imageContainer, { width: size, height: size }]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: size, height: size }]}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size }]}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.placeholderSubtext}>Tap to upload</Text>
          </View>
        )}
        
        {uploading && (
          <View style={[styles.loadingOverlay, { width: size, height: size }]}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {imageUrl && !uploading && (
        <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
          <Text style={styles.removeButtonText}>Remove Photo</Text>
        </TouchableOpacity>
      )}

      {!imageUrl && (
        <Text style={styles.helperText}>
          Tap the circle above to add a profile picture
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e0e0e0',
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: 5,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  removeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#ff4444',
    borderRadius: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});

