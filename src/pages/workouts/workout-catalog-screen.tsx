import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import exercisesData from '../../data/exercises.json';

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

const categories = [
  { key: 'all', label: 'All', emoji: '💪' },
  { key: 'chest', label: 'Chest', emoji: '🦾' },
  { key: 'back', label: 'Back', emoji: '🔙' },
  { key: 'shoulders', label: 'Shoulders', emoji: '💪' },
  { key: 'legs', label: 'Legs', emoji: '🦵' },
  { key: 'biceps', label: 'Biceps', emoji: '💪' },
  { key: 'triceps', label: 'Triceps', emoji: '💪' },
  { key: 'abs', label: 'Abs', emoji: '🔥' },
  { key: 'glutes', label: 'Glutes', emoji: '🍑' },
  { key: 'cardio', label: 'Cardio', emoji: '🏃' },
  { key: 'stretching', label: 'Stretch', emoji: '🧘' },
];

const difficulties = [
  { key: 'all', label: 'All Levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

export default function WorkoutCatalogScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const exercises = exercisesData as Exercise[];

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory =
        selectedCategory === 'all' || exercise.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        exercise.difficulty === selectedDifficulty;
      const matchesSearch =
        searchQuery === '' ||
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [exercises, selectedCategory, selectedDifficulty, searchQuery]);

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate('ExerciseDetail' as never, { exercise } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Catalog</Text>
        <Text style={styles.subtitle}>
          {filteredExercises.length} exercises available
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterChip,
                  selectedCategory === cat.key && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.filterEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat.key &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.difficultyChip,
                  selectedDifficulty === diff.key &&
                    styles.difficultyChipActive,
                ]}
                onPress={() => setSelectedDifficulty(diff.key)}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    selectedDifficulty === diff.key &&
                      styles.difficultyChipTextActive,
                  ]}
                >
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          {filteredExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleExercisePress(exercise)}
            >
              <View style={styles.exerciseIcon}>
                <Text style={styles.exerciseIconText}>
                  {categories.find((c) => c.key === exercise.category)?.emoji ||
                    '💪'}
                </Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDescription}>
                  {exercise.description}
                </Text>
                <View style={styles.exerciseMeta}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {exercise.difficulty}
                    </Text>
                  </View>
                  {exercise.equipment.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        🏋️ {exercise.equipment.length} items
                      </Text>
                    </View>
                  )}
                  {exercise.duration && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        ⏱️ {Math.ceil(exercise.duration / 60)}min
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.exerciseChevron}>›</Text>
            </TouchableOpacity>
          ))}

          {filteredExercises.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No exercises found matching your filters
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minWidth: 90,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  difficultyChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  difficultyChipTextActive: {
    color: '#fff',
  },
  exerciseList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseIconText: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  exerciseChevron: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

