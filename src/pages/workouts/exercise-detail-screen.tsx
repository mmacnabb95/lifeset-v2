import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { getExerciseRecord, updateExerciseRecord, ExerciseRecord } from 'src/services/firebase/exercise-records';
import { Video, ResizeMode } from 'expo-av';

interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  equipment: string[];
  muscleGroups: string[];
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
}

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  const { exercise } = route.params as { exercise: Exercise };
  
  const video = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [record, setRecord] = useState<ExerciseRecord | null>(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Load exercise record
  useEffect(() => {
    const loadRecord = async () => {
      if (!userId) return;
      const exerciseRecord = await getExerciseRecord(userId, exercise.id);
      setRecord(exerciseRecord);
      if (exerciseRecord) {
        setWeightInput(exerciseRecord.lastWeight?.toString() || '');
      }
    };
    loadRecord();
  }, [userId, exercise.id]);

  const handleSaveWeight = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to save your records');
      return;
    }

    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight');
      return;
    }

    try {
      await updateExerciseRecord(userId, exercise.id, exercise.name, weight);
      const updatedRecord = await getExerciseRecord(userId, exercise.id);
      setRecord(updatedRecord);
      setEditingWeight(false);
      Alert.alert('✓ Saved!', `Your record for ${exercise.name} has been updated!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save record');
    }
  };

  const handlePlayVideo = async () => {
    if (videoError) {
      Alert.alert(
        'Video Error',
        'Unable to load video. Check your internet connection or try again later.',
        [
          { text: 'Copy URL', onPress: () => Linking.openURL(exercise.videoUrl) },
          { text: 'OK' }
        ]
      );
      return;
    }

    try {
      if (video.current) {
        if (isPlaying) {
          await video.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await video.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Video playback error:', error);
      Alert.alert('Playback Error', 'Unable to play video');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {!videoError ? (
            <>
              <Video
                ref={video}
                source={{ 
                  uri: exercise.videoUrl,
                  // Enable caching to reduce bandwidth costs
                  headers: {
                    'Cache-Control': 'max-age=31536000', // Cache for 1 year
                  }
                }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onError={(error) => {
                  console.error('Video error:', error);
                  setVideoError(true);
                  setVideoLoading(false);
                }}
                onLoad={() => {
                  setVideoLoading(false);
                }}
                onPlaybackStatusUpdate={(status) => {
                  if ('isPlaying' in status) {
                    setIsPlaying(status.isPlaying);
                  }
                }}
              />
              {videoLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Loading video...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderEmoji}>⚠️</Text>
              <Text style={styles.videoPlaceholderText}>
                Unable to load video
              </Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => Linking.openURL(exercise.videoUrl)}
              >
                <Text style={styles.playButtonText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{exercise.name}</Text>
          
          {/* Personal Record - Prominent at Top */}
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>💪 Your Personal Record</Text>
              {!editingWeight && (
                <TouchableOpacity onPress={() => setEditingWeight(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingWeight ? (
              <View style={styles.editContainer}>
                <Text style={styles.editPrompt}>
                  Enter the weight you can lift for this exercise:
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.weightInput}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                    placeholder="Enter weight"
                    placeholderTextColor="rgba(0, 151, 167, 0.4)"
                    autoFocus
                  />
                  <Text style={styles.inputUnit}>kg</Text>
                </View>
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingWeight(false);
                      setWeightInput(record?.lastWeight?.toString() || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveWeight}
                  >
                    <Text style={styles.saveButtonText}>✓ Save Record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : record ? (
              <View style={styles.recordStats}>
                <View style={styles.recordStat}>
                  <Text style={styles.recordStatLabel}>Last Weight</Text>
                  <Text style={styles.recordStatValue}>
                    {record.lastWeight ? `${record.lastWeight} kg` : 'Not set'}
                  </Text>
                </View>
                <View style={styles.recordDivider} />
                <View style={styles.recordStat}>
                  <Text style={styles.recordStatLabel}>Max Weight</Text>
                  <Text style={styles.recordStatValue}>
                    {record.maxWeight ? `${record.maxWeight} kg` : 'Not set'}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addWeightPrompt}
                onPress={() => setEditingWeight(true)}
              >
                <Text style={styles.addWeightIcon}>⚡</Text>
                <Text style={styles.addWeightText}>Tap to Record Your Weight</Text>
                <Text style={styles.addWeightSubtext}>
                  Track your strength and progress!
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(exercise.difficulty) },
              ]}
            >
              <Text style={styles.difficultyBadgeText}>
                {exercise.difficulty}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {exercise.category}
              </Text>
            </View>
            {exercise.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationBadgeText}>
                  ⏱️ {Math.ceil(exercise.duration / 60)} min
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>

          {exercise.muscleGroups.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Muscle Groups</Text>
              <View style={styles.tagContainer}>
                {exercise.muscleGroups.map((muscle, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>💪 {muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {exercise.equipment.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <View style={styles.tagContainer}>
                {exercise.equipment.map((item, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>🏋️ {item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionText}>
              1. Watch the video tutorial above for proper form{'\n'}
              2. Start with a warm-up set{'\n'}
              3. Focus on controlled movements{'\n'}
              4. Breathe properly throughout the exercise{'\n'}
              5. Rest adequately between sets
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    marginTop: 40,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  videoPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  durationBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#26c6da',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 16,
    shadowColor: '#26c6da',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  editButton: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recordStats: {
    flexDirection: 'row',
  },
  recordStat: {
    flex: 1,
    alignItems: 'center',
  },
  recordStatLabel: {
    fontSize: 12,
    color: '#e0f7fa',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  recordDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  editContainer: {
    gap: 14,
  },
  editPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  weightInput: {
    backgroundColor: '#fff',
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 32,
    fontWeight: '900',
    color: '#0097a7',
    textAlign: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inputUnit: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#26c6da',
    fontSize: 16,
    fontWeight: '900',
  },
  addWeightPrompt: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  addWeightIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  addWeightText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  addWeightSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e0f7fa',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  noEquipmentBanner: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  noEquipmentText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
});


