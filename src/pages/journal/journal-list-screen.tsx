import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { getJournalEntries, deleteJournalEntry, JournalEntry } from "src/services/firebase/journal";

// Helper function for mood emojis
const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'great': return '😄';
    case 'good': return '😊';
    case 'okay': return '😐';
    case 'bad': return '😔';
    case 'terrible': return '😢';
    default: return '';
  }
};

export const JournalListScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchEntries = async () => {
    try {
      if (!userId) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching journal entries for user:', userId);
      
      const journalData = await getJournalEntries(userId);

      console.log('Journal entries:', journalData.length);

      setEntries(journalData);
      setError("");
    } catch (err: any) {
      console.error('Error fetching journal entries:', err);
      setError(err.message || 'Failed to load journal entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const handleDeleteEntry = (entryId: string, entryDate: string) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete your journal entry from ${new Date(entryDate).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userId) return;
              await deleteJournalEntry(userId, entryId);
              setEntries(prev => prev.filter(e => e.id !== entryId));
              console.log(`Deleted journal entry: ${entryId}`);
            } catch (err: any) {
              console.error('Error deleting entry:', err);
              Alert.alert('Error', err.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9c27b0" />
        <Text style={styles.loadingText}>Loading journal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Button
          type={ButtonTypes.Primary}
          title="Retry"
          onPress={fetchEntries}
          style={{ marginTop: 20, width: 200 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {entries.length} journal {entries.length !== 1 ? 'entries' : 'entry'}
          </Text>
        </View>

        {/* Entries List */}
        {entries.length > 0 ? (
          <View style={styles.entriesList}>
            {entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => navigation.navigate('WriteJournal', { entryId: entry.id })}
                onLongPress={() => handleDeleteEntry(entry.id!, entry.date)}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                  {entry.mood && (
                    <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                  )}
                </View>
                
                {entry.title && (
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                )}
                
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
                
                {entry.tags && entry.tags.length > 0 && (
                  <View style={styles.entryTags}>
                    {entry.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No journal entries yet!</Text>
            <Text style={styles.emptyStateText}>
              Start documenting your thoughts, feelings, and experiences.
            </Text>
          </View>
        )}

        {/* New Entry Button */}
        <Button
          type={ButtonTypes.Primary}
          title="+ Write New Entry"
          onPress={() => navigation.navigate('WriteJournal')}
          style={styles.newEntryButton}
        />

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            💡 Tap to edit • Long press to delete
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
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
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#9c27b0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  entriesList: {
    marginBottom: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: '#9c27b0',
    fontWeight: '600',
  },
  entryMood: {
    fontSize: 24,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0e6f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#9c27b0',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  newEntryButton: {
    marginBottom: 20,
    backgroundColor: '#9c27b0',
  },
  instructions: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
