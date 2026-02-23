import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { useBranding } from "src/hooks/useBranding";
import recipesData from "src/data/recipes.json";

const CATEGORIES = [
  { key: 'All', emoji: '🍽️', label: 'All' },
  { key: 'Breakfast', emoji: '🍳', label: 'Breakfast' },
  { key: 'Lunch', emoji: '🥗', label: 'Lunch' },
  { key: 'Dinner', emoji: '🍝', label: 'Dinner' },
  { key: 'Snack', emoji: '🍎', label: 'Snack' },
  { key: 'Dessert', emoji: '🍰', label: 'Dessert' },
];

const CATEGORY_MAP: Record<string, string[]> = {
  All: [],
  Breakfast: ['Breakfast'],
  Lunch: ['Lunch'],
  Dinner: ['Dinner'],
  Snack: ['Snacks'],
  Dessert: ['Dessert'],
};

export const RecipeBrowserScreen = ({ navigation }: { navigation: any }) => {
  const { primaryColor, isBranded } = useBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let recipes = recipesData.recipes;

    // Filter by category
    if (selectedCategory !== 'All') {
      const allowedCategories = CATEGORY_MAP[selectedCategory] || [selectedCategory];
      recipes = recipes.filter(r => allowedCategories.includes(r.category));
    }

    // Search by title or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      recipes = recipes.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query)
      );
    }

    return recipes;
  }, [searchQuery, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isBranded && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText} allowFontScaling={false}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} allowFontScaling={false}>Recipes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Category Filter - Compact Grid */}
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonSelected,
              selectedCategory === category.key && isBranded && { backgroundColor: primaryColor },
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryEmoji} allowFontScaling={false}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextSelected,
              ]}
              allowFontScaling={false}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recipes List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredRecipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
          >
            <View style={styles.recipeHeader}>
              <View>
                <Text style={styles.recipeCategory} allowFontScaling={false}>{recipe.category}</Text>
                <Text style={styles.recipeTitle} allowFontScaling={false}>{recipe.title}</Text>
              </View>
              <Text style={styles.recipeDuration} allowFontScaling={false}>⏱️ {recipe.duration} min</Text>
            </View>
            
            <Text style={styles.recipeDescription} numberOfLines={2} allowFontScaling={false}>
              {recipe.description}
            </Text>
            
            <View style={styles.recipeFooter}>
              <View style={styles.nutritionBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText} allowFontScaling={false}>{recipe.nutrition.calories} cal</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText} allowFontScaling={false}>{recipe.nutrition.protein}g protein</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText} allowFontScaling={false}>{recipe.nutrition.carbs}g carbs</Text>
                </View>
              </View>
              <View style={styles.servings}>
                <Text style={styles.servingsText} allowFontScaling={false}>🍽️ {recipe.servings}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon} allowFontScaling={false}>🔍</Text>
            <Text style={styles.emptyStateTitle} allowFontScaling={false}>No recipes found</Text>
            <Text style={styles.emptyStateText} allowFontScaling={false}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#ff9800',
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 6,
    minWidth: '30%',
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#ff9800',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  recipeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recipeDuration: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  servings: {
    marginLeft: 10,
  },
  servingsText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
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
});
