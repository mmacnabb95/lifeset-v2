import React from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import { Typography } from "../typography";
import { TypographyTypes } from "../typography";
import constants from "src/themes/constants";
import { MeditationCategory } from "src/pages/user/meditation/constants";
import { LinearGradient } from "expo-linear-gradient";
import { TextStyle } from "react-native";

interface MeditationCategoryProps {
  category: MeditationCategory;
  description: string;
  onPress: () => void;
  isSelected?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 140,
    marginBottom: 16,
    borderRadius: constants.radiusLarge,
    shadowColor: constants.black900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  title: {
    marginBottom: 8,
    fontSize: 22,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 22,
  }
});

const getCategoryColors = (category: MeditationCategory, isSelected: boolean) => {
  if (isSelected) {
    return ['#4A90E2', '#357ABD'];
  }
  
  switch (category) {
    case MeditationCategory.SLEEP:
      return ['#1a237e', '#000051', '#000033']; // Deep night blue gradient
    case MeditationCategory.CALM:
      return ['#87CEEB', '#B0E2FF', '#E1FFFF']; // Serene sky gradient
    case MeditationCategory.MENTAL_CLARITY:
      return ['#E8F5F5', '#C8E6E6', '#A8D8D8']; // Icy frost gradient
    case MeditationCategory.VISUALISATION:
      return ['#E6E6FA', '#B19CD9', '#9370DB']; // Ethereal lavender gradient
    default:
      return [constants.white, constants.white];
  }
};

export const MeditationCategoryTile: React.FC<MeditationCategoryProps> = ({
  category,
  description,
  onPress,
  isSelected = false,
}) => {
  const colors = getCategoryColors(category, isSelected);
  const isSleepCategory = category === MeditationCategory.SLEEP;
  const isCalmCategory = category === MeditationCategory.CALM;
  const isMentalClarity = category === MeditationCategory.MENTAL_CLARITY;
  const isVisualisation = category === MeditationCategory.VISUALISATION;

  const titleStyle = [
    styles.title,
    {
      color: isSleepCategory || isSelected ? constants.white : 
            isVisualisation ? constants.black900 : constants.black900,
      textShadowColor: (isCalmCategory || isVisualisation) ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      fontWeight: isVisualisation ? '600' : 'normal',
    }
  ];

  const descStyle = [
    styles.description,
    {
      color: isSleepCategory || isSelected ? constants.white :
            isVisualisation ? constants.black900 : constants.black600,
      textShadowColor: (isCalmCategory || isVisualisation) ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      fontWeight: isVisualisation ? '500' : 'normal',
    }
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        }
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={styles.gradientContainer}
      >
        {isSleepCategory && (
          <View style={styles.overlayContainer}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 50,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </View>
        )}
        
        {isCalmCategory && (
          <View style={styles.overlayContainer}>
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: 60 + Math.random() * 40,
                  height: 20 + Math.random() * 10,
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  top: `${20 + Math.random() * 60}%`,
                  left: `${Math.random() * 80}%`,
                  opacity: 0.3 + Math.random() * 0.2,
                  transform: [{ scale: 1 + Math.random() * 0.5 }],
                }}
              />
            ))}
          </View>
        )}

        {isMentalClarity && (
          <View style={styles.overlayContainer}>
            {[...Array(15)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: 15 + Math.random() * 20,
                  height: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.4 + Math.random() * 0.3,
                  transform: [
                    { rotate: `${Math.random() * 180}deg` },
                    { scale: 1 + Math.random() * 0.5 }
                  ],
                }}
              />
            ))}
          </View>
        )}

        {isVisualisation && (
          <View style={styles.overlayContainer}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: 120,
                  height: 3,
                  backgroundColor: '#ffffff',
                  borderRadius: 1.5,
                  top: `${Math.random() * 100}%`,
                  left: `-10%`,
                  opacity: 0.2 + Math.random() * 0.3,
                  transform: [
                    { rotate: `${-20 + Math.random() * 40}deg` },
                    { scale: 1 + Math.random() * 1 }
                  ],
                }}
              />
            ))}
          </View>
        )}

        <Typography
          type={TypographyTypes.H5}
          text={category}
          style={titleStyle}
        />
        <Typography
          type={TypographyTypes.Body2}
          text={description}
          style={descStyle}
        />
      </LinearGradient>
    </Pressable>
  );
}; 