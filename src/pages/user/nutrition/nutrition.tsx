import React, { useState, useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import FullScreenWithBackground from '../fullScreenWithBackground/fullScreenWithBackground';
import { Typography } from 'src/components/common';
import { TypographyTypes } from 'src/components/common/typography';
import constants from 'src/themes/constants';
import { RecipeCategory, CATEGORY_DESCRIPTIONS, RECIPES } from './constants';

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

// Add type safety and default colors
type CategoryColor = {
  bg: string;
  text: string;
};

const DEFAULT_COLORS: CategoryColor = {
  bg: '#F5F5F5',
  text: '#666666'
};

const NUTRITION_COLORS: Record<RecipeCategory, CategoryColor> = {
  [RecipeCategory.BREAKFAST]: { bg: '#FFF3E0', text: '#E65100' },
  [RecipeCategory.LUNCH]: { bg: '#E8F5E9', text: '#2E7D32' },
  [RecipeCategory.DINNER]: { bg: '#E3F2FD', text: '#1976D2' },
  [RecipeCategory.SNACKS]: { bg: '#FFF8E1', text: '#FFA000' }
};

// Add emoji mapping for nutrition categories
const CATEGORY_EMOJIS: Record<RecipeCategory, string> = {
  [RecipeCategory.BREAKFAST]: '🍳',
  [RecipeCategory.LUNCH]: '🥗',
  [RecipeCategory.DINNER]: '🍽️',
  [RecipeCategory.SNACKS]: '🥨'
};

const NutritionScreen = ({
  navigation,
  route,
  summaryOnly,
  style,
  scrollEnabled = true,
}: {
  navigation: any;
  route: any;
  summaryOnly?: boolean;
  style?: any;
  scrollEnabled?: boolean;
}) => {
  const layoutStyles = useLayoutStyles();
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) return RECIPES;
    return RECIPES.filter(recipe => recipe.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <FullScreenWithBackground 
      headerCompenstation={summaryOnly ? false : true}
      colours={["#90EE90", "#32CD32", "#13bf38"]}
    >
      <ScrollView
        style={{ height: '100%' }}
        nestedScrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            justifyContent: 'space-between',
            marginTop: -20,
            flexGrow: 1,
          },
          style,
        ]}
        scrollEnabled={scrollEnabled}
      >
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: 'center',
            paddingTop: 20,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text="Nutrition Guide"
            style={{
              color: constants.white,
              marginBottom: 10,
            }}
          />
        </View>

        {/* Full screen view */}
        <View
          style={{
            flexGrow: 1,
            backgroundColor: '#EFEEF5',
            borderTopLeftRadius: constants.radiusXXLarge,
            borderTopRightRadius: constants.radiusXXLarge,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Typography
              type={TypographyTypes.H5}
              text={selectedCategory ? selectedCategory : "All Recipes"}
              style={{
                color: constants.black900,
              }}
            />
          </View>

          {/* Categories */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            {Object.values(RecipeCategory).map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
                style={{
                  backgroundColor: selectedCategory === category 
                    ? (NUTRITION_COLORS[category] || DEFAULT_COLORS).text 
                    : (NUTRITION_COLORS[category] || DEFAULT_COLORS).bg,
                  borderRadius: 20,
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  marginRight: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Typography
                  text={CATEGORY_EMOJIS[category]}
                  style={{ 
                    marginRight: 6,
                    fontSize: 16,
                  }}
                />
                <Typography
                  text={category}
                  type={TypographyTypes.Body2}
                  style={{
                    color: selectedCategory === category 
                      ? constants.white 
                      : (NUTRITION_COLORS[category] || DEFAULT_COLORS).text,
                  }}
                />
              </Pressable>
            ))}
          </View>

          {/* Recipes */}
          {filteredRecipes.map((recipe) => (
            <Pressable
              key={recipe.id}
              onPress={() => navigation.navigate('Recipe', { recipe })}
              style={{
                backgroundColor: constants.white,
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                borderLeftWidth: 4,
                borderLeftColor: selectedCategory 
                  ? (NUTRITION_COLORS[selectedCategory] || DEFAULT_COLORS).text
                  : (NUTRITION_COLORS[recipe.category] || DEFAULT_COLORS).text,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Typography
                  text={recipe.title}
                  type={TypographyTypes.H6}
                  style={{
                    color: constants.black900,
                    flex: 1,
                  }}
                />
                <Typography
                  text={recipe.category}
                  type={TypographyTypes.Caption1}
                  style={{
                    color: (NUTRITION_COLORS[recipe.category] || DEFAULT_COLORS).text,
                    fontWeight: '500',
                  }}
                />
              </View>
              <Typography
                text={recipe.description}
                type={TypographyTypes.Body2}
                style={{
                  color: constants.black600,
                  marginBottom: 10,
                }}
                numberOfLines={2}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  text={`${recipe.category} • ${recipe.duration} mins`}
                  type={TypographyTypes.Caption1}
                  style={{
                    color: constants.black600,
                  }}
                />
                <Typography
                  text={`${recipe.servings} servings`}
                  type={TypographyTypes.Caption1}
                  style={{
                    color: constants.black600,
                  }}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default NutritionScreen; 