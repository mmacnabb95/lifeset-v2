import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBranding } from 'src/hooks/useBranding';
import meditationsData from '../../data/meditations.json';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: string;
  audioFile: string;
  duration: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  CALM: '🌊',
  MENTAL_CLARITY: '🧠',
  VISUALISATION: '✨',
  SLEEP: '🌙',
  BREATHWORK: '🌬️',
};

const CATEGORY_COLORS: Record<string, string> = {
  CALM: '#4CAF50',
  MENTAL_CLARITY: '#2196F3',
  VISUALISATION: '#9C27B0',
  SLEEP: '#3F51B5',
  BREATHWORK: '#00BCD4',
};

export default function MeditationBrowserScreen() {
  const navigation = useNavigation();
  const { primaryColor, isBranded } = useBranding();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sessions = meditationsData.sessions as MeditationSession[];
  const categories = meditationsData.categories;

  const filteredSessions = selectedCategory
    ? sessions.filter((s) => s.category === selectedCategory)
    : sessions;

  const handleSessionPress = (session: MeditationSession) => {
    navigation.navigate('MeditationPlayer' as never, { session } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isBranded && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText} allowFontScaling={false}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} allowFontScaling={false}>🧘 Guided Meditations</Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          {filteredSessions.length} sessions available
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle} allowFontScaling={false}>Categories</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                !selectedCategory && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.categoryEmoji} allowFontScaling={false}>💪</Text>
              <Text style={[
                styles.categoryName,
                !selectedCategory && styles.categoryNameActive,
              ]}
              allowFontScaling={false}
              >
                All
              </Text>
            </TouchableOpacity>
            
            {Object.entries(categories).map(([key, cat]: [string, any]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryCard,
                  selectedCategory === key && styles.categoryCardActive,
                  selectedCategory === key && { borderColor: CATEGORY_COLORS[key] },
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Text style={styles.categoryEmoji} allowFontScaling={false}>
                  {CATEGORY_EMOJIS[key]}
                </Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === key && styles.categoryNameActive,
                ]}
                allowFontScaling={false}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsList}>
          {filteredSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                { borderLeftColor: CATEGORY_COLORS[session.category] || '#673ab7' },
              ]}
              onPress={() => handleSessionPress(session)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionEmoji} allowFontScaling={false}>
                  {CATEGORY_EMOJIS[session.category]}
                </Text>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} allowFontScaling={false}>{session.title}</Text>
                  <Text style={styles.sessionCategory} allowFontScaling={false}>
                    {categories[session.category as keyof typeof categories]?.name}
                  </Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText} allowFontScaling={false}>{session.duration} min</Text>
                </View>
              </View>
              
              <Text style={styles.sessionDescription} numberOfLines={2} allowFontScaling={false}>
                {session.description}
              </Text>
              
              <View style={styles.playButton}>
                <Text style={styles.playButtonText} allowFontScaling={false}>▶ Start Session</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#673ab7',
  },
  backButton: {
    padding: 5,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#e1bee7',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e1bee7',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 12,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: '#673ab7',
    borderColor: '#673ab7',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryNameActive: {
    color: 'white',
  },
  sessionsList: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  sessionCategory: {
    fontSize: 13,
    color: '#666',
  },
  durationBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sessionDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#673ab7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

