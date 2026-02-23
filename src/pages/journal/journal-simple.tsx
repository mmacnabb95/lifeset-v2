import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useBranding } from "src/hooks/useBranding";
import { 
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  JournalEntry 
} from "src/services/firebase/journal";

const MOODS = [
  { key: 'great', emoji: '😄', label: 'Great', color: '#4CAF50' },
  { key: 'good', emoji: '😊', label: 'Good', color: '#8BC34A' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: '#FF9800' },
  { key: 'bad', emoji: '😔', label: 'Bad', color: '#FF5722' },
  { key: 'terrible', emoji: '😢', label: 'Terrible', color: '#F44336' },
];

export const JournalSimpleScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { primaryColor, isBranded } = useBranding();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchEntries();
    }, [userId])
  );

  const fetchEntries = async () => {
    try {
      if (!userId) return;
      const journalData = await getJournalEntries(userId);
      setEntries(journalData);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = (entryId: string, entryDate: string) => {
    Alert.alert(
      'Delete Entry',
      `Delete journal entry from ${new Date(entryDate).toLocaleDateString()}?`,
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
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const getMoodEmoji = (mood: string) => {
    return MOODS.find(m => m.key === mood)?.emoji || '';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isBranded && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>📝 My Journal</Text>
        <Text style={styles.headerSubtitle}>{entries.length} entries</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => navigation.navigate('WriteJournal', { entryId: entry.id })}
              onLongPress={() => handleDeleteEntry(entry.id!, entry.date)}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryDateContainer}>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.entryTime}>
                    {new Date(entry.date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                {entry.mood && (
                  <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                )}
              </View>
              
              {entry.title && (
                <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
              )}
              
              <Text style={styles.entryContent} numberOfLines={3}>
                {entry.content}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No Entries Yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the ✏️ button below to start journaling!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Write Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('WriteJournal')}
      >
        <Text style={styles.floatingButtonText}>✏️</Text>
      </TouchableOpacity>
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
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffd54f',
  },
  headerTop: {
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for floating button
  },
  entryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDateContainer: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    color: '#ffab00',
    fontWeight: '600',
  },
  entryTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  entryMood: {
    fontSize: 32,
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
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffd54f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffab00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 32,
  },
});

