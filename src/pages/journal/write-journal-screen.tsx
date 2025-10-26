import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { 
  createJournalEntry, 
  updateJournalEntry, 
  getJournalEntry,
  JournalEntry 
} from "src/services/firebase/journal";

const MOODS = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'bad', emoji: '😔', label: 'Bad' },
  { key: 'terrible', emoji: '😢', label: 'Terrible' },
];

export const WriteJournalScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { userId } = useFirebaseUser();
  const entryId = route?.params?.entryId;
  const isEditing = !!entryId;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState('');
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
        setMood(entry.mood);
        setTags(entry.tags?.join(', ') || '');
      }
    } catch (err: any) {
      console.error('Error loading entry:', err);
      Alert.alert('Error', 'Failed to load journal entry');
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your journal');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const entryData = {
        userId,
        title: title.trim() || undefined,
        content: content.trim(),
        mood: mood as any,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        date: today,
      };

      if (isEditing) {
        await updateJournalEntry(userId, entryId, entryData);
        console.log('Updated journal entry:', entryId);
        Alert.alert('Success', 'Journal entry updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const newEntryId = await createJournalEntry(entryData);
        console.log('Created journal entry:', newEntryId);
        Alert.alert('Success', 'Journal entry saved!', [
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading entry...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Date Display */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Mood Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodsContainer}>
            {MOODS.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.key}
                style={[
                  styles.moodButton,
                  mood === moodOption.key && styles.moodButtonSelected,
                ]}
                onPress={() => setMood(mood === moodOption.key ? undefined : moodOption.key)}
              >
                <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    mood === moodOption.key && styles.moodLabelSelected,
                  ]}
                >
                  {moodOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title (Optional)</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your entry a title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>What's on your mind? *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your thoughts, feelings, or experiences..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            maxLength={10000}
          />
          <Text style={styles.charCount}>
            {content.length} / 10,000 characters
          </Text>
        </View>

        {/* Tags Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Tags (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., gratitude, reflection, goals (comma separated)"
            value={tags}
            onChangeText={setTags}
            maxLength={200}
          />
        </View>

        {/* Save Button */}
        <Button
          type={ButtonTypes.Primary}
          title={loading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />

        {/* Help Text */}
        <View style={styles.helpText}>
          <Text style={styles.helpTextContent}>
            💡 Tip: Journaling regularly can improve mental clarity, reduce stress, and help track personal growth.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#9c27b0',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  dateSection: {
    backgroundColor: '#f0e6f6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#9c27b0',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodButtonSelected: {
    borderColor: '#9c27b0',
    backgroundColor: '#f0e6f6',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: '#9c27b0',
  },
  titleInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#9c27b0',
  },
  helpText: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helpTextContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
