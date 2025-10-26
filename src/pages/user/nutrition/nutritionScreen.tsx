import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { RouteProp } from '@react-navigation/native';
import constants from './constants';

type NutritionScreenProps = {
  route: RouteProp<{
    params: {
      recipe: {
        id: number;
        name: string;
        ingredients: string[];
        steps: string[];
        image: string;
      };
    };
  }>;
};

function NutritionScreen({
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
}) {
  const { recipe } = route.params || {};

  return (
    <ScrollView 
      style={[styles.container, style]}
      scrollEnabled={scrollEnabled}
    >
      <SharedElement id={`recipe.${recipe?.id}.image`}>
        <Image source={recipe?.image} style={styles.image} resizeMode="cover" />
      </SharedElement>
      
      <View style={styles.content}>
        <Text style={styles.title}>{recipe?.name}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe?.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.listItem}>• {ingredient}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe?.steps.map((step, index) => (
            <Text key={index} style={styles.listItem}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.colors.background,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: constants.spacing.large,
  },
  title: {
    fontSize: constants.typography.size.xlarge,
    fontWeight: 'bold',
    color: constants.colors.text.primary,
    marginBottom: constants.spacing.large,
  },
  section: {
    marginBottom: constants.spacing.large,
  },
  sectionTitle: {
    fontSize: constants.typography.size.large,
    fontWeight: 'bold',
    color: constants.colors.text.primary,
    marginBottom: constants.spacing.medium,
  },
  listItem: {
    fontSize: constants.typography.size.medium,
    color: constants.colors.text.secondary,
    marginBottom: constants.spacing.small,
    lineHeight: 24,
  },
});

export default NutritionScreen; 