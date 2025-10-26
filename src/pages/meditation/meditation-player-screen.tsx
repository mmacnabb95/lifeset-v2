import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { logMeditationSession } from 'src/services/firebase/meditation';
import { useXPRewards } from 'src/hooks/useXPRewards';
import meditationsData from '../../data/meditations.json';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: string;
  audioFile: string;
  duration: number;
}

// Map audio files to require() statements
const AUDIO_FILES: Record<string, any> = {
  'Morning Tranquility.mp3': require('../../../assets/meditations/Morning Tranquility.mp3'),
  'Calm.mp3': require('../../../assets/meditations/Calm.mp3'),
  'Clarity.mp3': require('../../../assets/meditations/Clarity.mp3'),
  'Clear Mind.mp3': require('../../../assets/meditations/Clear Mind.mp3'),
  'Visualise Future You.mp3': require('../../../assets/meditations/Visualise Future You.mp3'),
  'Meeting Future You.mp3': require('../../../assets/meditations/Meeting Future You.mp3'),
  'Peaceful Night.mp3': require('../../../assets/meditations/Peaceful Night.mp3'),
  'Deep Sleep.mp3': require('../../../assets/meditations/Deep Sleep.mp3'),
  'Calming Breathework.mp3': require('../../../assets/meditations/Calming Breathework.mp3'),
};

export default function MeditationPlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  const { handleMeditationCompletion } = useXPRewards();
  const { session } = route.params as { session: MeditationSession };
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Set audio mode when component mounts
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        console.log('Audio mode set successfully');
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudio();

    return () => {
      // Cleanup sound on unmount
      if (sound) {
        console.log('Unloading sound');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async (autoPlay = true) => {
    try {
      setIsLoading(true);
      console.log('Loading audio file:', session.audioFile);
      
      // Get the audio file from local assets
      const audioSource = AUDIO_FILES[session.audioFile];
      
      if (!audioSource) {
        console.error('Audio file not found in AUDIO_FILES map:', session.audioFile);
        throw new Error(`Audio file not found: ${session.audioFile}`);
      }
      
      console.log('Audio source:', audioSource);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: autoPlay }, // Auto-play if requested
        onPlaybackStatusUpdate
      );
      
      console.log('Sound loaded successfully');
      setSound(newSound);
      
      if (autoPlay) {
        setIsPlaying(true);
        console.log('Auto-playing audio...');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', `Failed to load meditation audio: ${session.audioFile}\n\nError: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
      
      if (status.didJustFinish && !hasCompleted) {
        handleMeditationComplete();
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      console.log('No sound loaded, loading now...');
      await loadAudio();
      return;
    }

    try {
      console.log('Getting sound status...');
      const status = await sound.getStatusAsync();
      console.log('Sound status:', status);
      
      if (status.isLoaded) {
        if (isPlaying) {
          console.log('Pausing audio...');
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log('Playing audio...');
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        console.log('Sound not loaded properly');
      }
    } catch (error) {
      console.error('Error playing/pausing:', error);
      Alert.alert('Playback Error', String(error));
    }
  };

  const handleStop = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPosition(0);
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
  };

  const handleMeditationComplete = async () => {
    setHasCompleted(true);
    
    if (!userId) return;

    try {
      await logMeditationSession({
        userId,
        sessionId: session.id,
        title: session.title,
        category: session.category,
        duration: session.duration,
        completedAt: new Date(),
      });

      // Award XP for meditation
      handleMeditationCompletion();

      Alert.alert(
        '✨ Session Complete!',
        `You've completed "${session.title}". Well done!\n\n+5 XP earned! 🌟`,
        [
          { text: 'Finish', onPress: () => navigation.goBack() },
          { text: 'Meditate Again', onPress: handleStop },
        ]
      );
    } catch (error) {
      console.error('Error logging meditation:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meditation</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Session Info */}
      <View style={styles.content}>
        <View style={styles.sessionIcon}>
          <Text style={styles.sessionIconText}>🧘‍♀️</Text>
        </View>

        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.sessionDescription}>{session.description}</Text>
        
        <View style={styles.sessionMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {session.duration} minutes
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {meditationsData.categories[session.category as keyof typeof meditationsData.categories]?.name}
            </Text>
          </View>
        </View>

        {/* Progress */}
        {sound && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!sound || !isPlaying ? (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={isLoading}
            >
              <Text style={styles.playButtonText}>
                {isLoading ? 'Loading...' : '▶ Play'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={handlePlayPause}
              >
                <Text style={styles.pauseButtonText}>⏸ Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
              >
                <Text style={styles.stopButtonText}>⏹ Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            💡 Find a quiet space, get comfortable, and press play when ready.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#673ab7',
  },
  closeButton: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  sessionIconText: {
    fontSize: 64,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  sessionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  metaBadge: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  metaBadgeText: {
    fontSize: 14,
    color: '#673ab7',
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#673ab7',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  controls: {
    width: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#673ab7',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  instructionsText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 20,
  },
});

