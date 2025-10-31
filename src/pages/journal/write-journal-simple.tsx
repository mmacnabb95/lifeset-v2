import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useXPRewards } from "src/hooks/useXPRewards";
import { 
  createJournalEntry, 
  updateJournalEntry, 
  getJournalEntry,
} from "src/services/firebase/journal";

const MOODS = [
  { key: 'great', emoji: '😄', label: 'Great', color: '#4CAF50' },
  { key: 'good', emoji: '😊', label: 'Good', color: '#8BC34A' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: '#FFC107' },
  { key: 'bad', emoji: '😔', label: 'Bad', color: '#FF9800' },
  { key: 'terrible', emoji: '😢', label: 'Terrible', color: '#F44336' },
];

export const WriteJournalSimpleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = useFirebaseUser();
  const { handleJournalCreation } = useXPRewards();
  const { entryId } = (route.params as any) || {};
  const isEditing = !!entryId;
  
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('okay');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(isEditing);

  // Load existing entry if editing
  useEffect(() => {
    if (isEditing && userId) {
      loadEntry();
    }
  }, [entryId, userId]);

  const loadEntry = async () => {
    try {
      if (!userId || !entryId) return;
      
      const entry = await getJournalEntry(userId, entryId);
      if (entry) {
        setTitle(entry.title || '');
        setContent(entry.content);
        setMood(entry.mood || 'okay');
      }
    } catch (err: any) {
      console.error('Error loading entry:', err);
      Alert.alert('Error', 'Failed to load journal entry');
      navigation.goBack();
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Please Write Something', 'Your journal entry is empty');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'You must be logged in to journal');
      return;
    }

    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const entryData = {
        userId,
        title: title.trim() || undefined,
        content: content.trim(),
        mood: mood as any,
        date: today,
      };

      if (isEditing) {
        await updateJournalEntry(userId, entryId, entryData);
        Alert.alert('✓ Updated!', 'Your journal entry has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await createJournalEntry(entryData);
        // Award XP for creating journal entry
        handleJournalCreation();
        Alert.alert('✓ Saved!', 'Your journal entry has been saved.\n\n+5 XP earned! 🌟', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: any) {
      console.error('Error saving entry:', err);
      Alert.alert('Error', err.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEntry) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffd54f" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? '...' : '✓'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mood Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How are you feeling?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.moodButton,
                  mood === m.key && { backgroundColor: m.color, borderColor: m.color },
                ]}
                onPress={() => setMood(m.key)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    mood === m.key && styles.moodLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Optional Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title (Optional)</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give this entry a title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholderTextColor="#999"
          />
        </View>

        {/* Journal Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What's on your mind?</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your thoughts, feelings, or experiences here..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            maxLength={5000}
            placeholderTextColor="#999"
          />
          <Text style={styles.charCount}>
            {content.length} / 5000 characters
          </Text>
        </View>

        {/* Save Button (alternative to header) */}
        <TouchableOpacity
          style={styles.saveButtonLarge}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonLargeText}>
            {loading ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (if editing) */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButtonLarge}
            onPress={() => handleDeleteEntry(entryId, new Date().toISOString())}
          >
            <Text style={styles.deleteButtonLargeText}>Delete Entry</Text>
          </TouchableOpacity>
        )}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffd54f',
  },
  closeButton: {
    fontSize: 28,
    color: '#333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  moodButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  moodLabelActive: {
    color: 'white',
  },
  titleInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  saveButtonLarge: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffd54f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ffab00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonLargeText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButtonLarge: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffebee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  deleteButtonLargeText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
});

