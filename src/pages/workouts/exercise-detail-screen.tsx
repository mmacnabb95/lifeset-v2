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
  Vibration,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { getExerciseRecord, updateExerciseRecord, saveExerciseNotes, ExerciseRecord } from 'src/services/firebase/exercise-records';
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
  const [editingRecord, setEditingRecord] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedAt, setNoteSavedAt] = useState<Date | null>(null);
  const [restDuration, setRestDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);

  const isCardio = exercise.category === 'cardio';

  // Load exercise record
  useEffect(() => {
    const loadRecord = async () => {
      if (!userId) return;
      const exerciseRecord = await getExerciseRecord(userId, exercise.id);
      setRecord(exerciseRecord);
      if (exerciseRecord) {
        if (isCardio) {
          // For cardio, show duration in minutes
          setInputValue(Math.floor((exerciseRecord.lastDurationSeconds || 0) / 60).toString());
        } else {
          // For strength, show weight
          setInputValue(exerciseRecord.lastWeight?.toString() || '');
        }
        setNoteText(exerciseRecord.notes || '');
        setNoteSavedAt(exerciseRecord.lastUpdated?.toDate?.() || null);
      }
    };
    loadRecord();
  }, [userId, exercise.id, isCardio]);

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      Vibration.vibrate(600);
      setTimerRunning(false);
      setTimerComplete(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

  const handleSaveRecord = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to save your records');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Input', `Please enter a valid ${isCardio ? 'duration' : 'weight'}`);
      return;
    }

    try {
      if (isCardio) {
        // Save duration in seconds
        await updateExerciseRecord(
          userId, 
          exercise.id, 
          exercise.name, 
          exercise.category,
          { durationSeconds: value * 60 } // Convert minutes to seconds
        );
      } else {
        // Save weight
        await updateExerciseRecord(
          userId, 
          exercise.id, 
          exercise.name, 
          exercise.category,
          { weight: value }
        );
      }
      
      const updatedRecord = await getExerciseRecord(userId, exercise.id);
      setRecord(updatedRecord);
      setEditingRecord(false);
      Alert.alert('✓ Saved!', `Your record for ${exercise.name} has been updated!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save record');
    }
  };

  const handleSaveNote = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to save notes');
      return;
    }

    try {
      setSavingNote(true);
      await saveExerciseNotes(
        userId,
        exercise.id,
        exercise.name,
        exercise.category,
        noteText.trim()
      );

      setRecord((prev) =>
        prev
          ? { ...prev, notes: noteText.trim(), lastUpdated: new Date() }
          : {
              userId,
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              exerciseCategory: exercise.category,
              notes: noteText.trim(),
              lastUpdated: new Date(),
            }
      );
      setNoteSavedAt(new Date());
      Alert.alert('Saved', 'Your personal notes have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save notes');
    } finally {
      setSavingNote(false);
    }
  };

  const handleStartTimer = () => {
    setTimerComplete(false);
    setTimeLeft(restDuration);
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerComplete(false);
    setTimeLeft(restDuration);
  };

  const handleAdjustDuration = (text: string) => {
    if (text === '') {
      setRestDuration(0);
      setTimeLeft(0);
      return;
    }

    const value = parseInt(text, 10);
    if (!isNaN(value) && value >= 0) {
      setRestDuration(value);
      if (!timerRunning) {
        setTimeLeft(value);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              <Text style={styles.recordTitle}>
                {isCardio ? '⏱️ Your Best Time' : '💪 Your Personal Record'}
              </Text>
              {!editingRecord && (
                <TouchableOpacity onPress={() => setEditingRecord(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingRecord ? (
              <View style={styles.editContainer}>
                <Text style={styles.editPrompt}>
                  {isCardio 
                    ? 'Enter your best duration for this exercise:'
                    : 'Enter the weight you can lift for this exercise:'}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.weightInput}
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    placeholder={isCardio ? "Enter minutes" : "Enter weight"}
                    placeholderTextColor="rgba(0, 151, 167, 0.4)"
                    autoFocus
                  />
                  <Text style={styles.inputUnit}>{isCardio ? 'min' : 'kg'}</Text>
                </View>
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingRecord(false);
                      if (record) {
                        if (isCardio) {
                          setInputValue(Math.floor((record.lastDurationSeconds || 0) / 60).toString());
                        } else {
                          setInputValue(record.lastWeight?.toString() || '');
                        }
                      }
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveRecord}
                  >
                    <Text style={styles.saveButtonText}>✓ Save Record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : record ? (
              <View style={styles.recordStats}>
                {isCardio ? (
                  <>
                    <View style={styles.recordStat}>
                      <Text style={styles.recordStatLabel}>Last Duration</Text>
                      <Text style={styles.recordStatValue}>
                        {record.lastDurationSeconds 
                          ? `${Math.floor(record.lastDurationSeconds / 60)} min` 
                          : 'Not set'}
                      </Text>
                    </View>
                    <View style={styles.recordDivider} />
                    <View style={styles.recordStat}>
                      <Text style={styles.recordStatLabel}>Best Duration</Text>
                      <Text style={styles.recordStatValue}>
                        {record.maxDurationSeconds 
                          ? `${Math.floor(record.maxDurationSeconds / 60)} min` 
                          : 'Not set'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addWeightPrompt}
                onPress={() => setEditingRecord(true)}
              >
                <Text style={styles.addWeightIcon}>{isCardio ? '⏱️' : '⚡'}</Text>
                <Text style={styles.addWeightText}>
                  {isCardio ? 'Tap to Record Your Time' : 'Tap to Record Your Weight'}
                </Text>
                <Text style={styles.addWeightSubtext}>
                  Track your {isCardio ? 'endurance' : 'strength'} and progress!
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Rest Timer - Compact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rest Timer</Text>
            <View style={styles.compactTimerCard}>
              <View style={styles.timerInfoRow}>
                <View style={styles.timerInfo}>
                  <Text style={styles.timerLabel}>Next set in</Text>
                  <Text style={styles.compactTimerDisplay}>{formatTime(timeLeft)}</Text>
                  {timerComplete && (
                    <Text style={styles.timerCompleteText}>Rest complete!</Text>
                  )}
                </View>
                <View style={styles.durationInputRow}>
                  <Text style={styles.durationInputLabel}>Rest (sec)</Text>
                  <TextInput
                    style={styles.durationInput}
                    keyboardType="number-pad"
                    value={restDuration.toString()}
                    onChangeText={handleAdjustDuration}
                    selectTextOnFocus
                  />
                </View>
              </View>
              <View style={styles.timerButtonsRow}>
                <TouchableOpacity
                  style={[styles.timerButtonSmall, styles.timerPrimaryButton]}
                  onPress={handleStartTimer}
                >
                  <Text style={styles.timerButtonSmallText}>
                    {timerRunning ? 'Restart' : 'Start'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timerButtonSmall,
                    styles.timerSecondaryButton,
                    !timerRunning && styles.timerButtonDisabled,
                  ]}
                  onPress={handlePauseTimer}
                  disabled={!timerRunning}
                >
                  <Text
                    style={[
                      styles.timerButtonSmallText,
                      !timerRunning && styles.timerButtonDisabledText,
                    ]}
                  >
                    Pause
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timerButtonSmall, styles.timerSecondaryButton]}
                  onPress={handleResetTimer}
                >
                  <Text style={styles.timerButtonSmallText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Personal Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <Text style={styles.sectionSubtitle}>
              Jot down cues about your form, difficulty, or reminders for next time.
            </Text>
            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="e.g. Focus on keeping core tight on the last rep."
              placeholderTextColor="#999"
              value={noteText}
              onChangeText={setNoteText}
              textAlignVertical="top"
              numberOfLines={4}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity
                style={[styles.saveNoteButton, savingNote && styles.saveNoteButtonDisabled]}
                onPress={handleSaveNote}
                disabled={savingNote}
              >
                <Text style={styles.saveNoteButtonText}>
                  {savingNote ? 'Saving...' : 'Save Notes'}
                </Text>
              </TouchableOpacity>
              {noteSavedAt && (
                <Text style={styles.noteTimestamp}>
                  Last updated {noteSavedAt.toLocaleDateString()} {noteSavedAt.toLocaleTimeString()}
                </Text>
              )}
            </View>
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
    lineHeight: 20,
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
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    fontSize: 15,
    minHeight: 110,
  },
  noteActions: {
    marginTop: 12,
    gap: 6,
  },
  saveNoteButton: {
    backgroundColor: '#26c6da',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveNoteButtonDisabled: {
    opacity: 0.6,
  },
  saveNoteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  compactTimerCard: {
    backgroundColor: '#f0fbff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b3e5fc',
    shadowColor: '#26c6da',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  timerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerInfo: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 12,
    color: '#4fb0c6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: '700',
  },
  compactTimerDisplay: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0e4a61',
  },
  timerCompleteText: {
    color: '#4caf50',
    fontWeight: '700',
    marginTop: 6,
  },
  durationInputRow: {
    alignItems: 'center',
  },
  durationInputLabel: {
    fontSize: 12,
    color: '#4fb0c6',
    marginBottom: 4,
    fontWeight: '600',
  },
  durationInput: {
    width: 90,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b3e5fc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#0e4a61',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  timerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timerButtonSmall: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  timerPrimaryButton: {
    backgroundColor: '#26c6da',
  },
  timerSecondaryButton: {
    backgroundColor: '#b2ebf2',
  },
  timerButtonSmallText: {
    color: '#0e4a61',
    fontWeight: '700',
    fontSize: 14,
  },
  timerButtonDisabled: {
    opacity: 0.4,
  },
  timerButtonDisabledText: {
    color: 'rgba(14,74,97,0.4)',
  },
});


