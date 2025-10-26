import React from 'react';
import { View } from 'react-native';
import { Typography } from '../typography';
import { TypographyTypes } from '../typography';
import { MeditationCategory } from 'src/pages/user/meditation/constants';

interface MeditationPlaceholderProps {
  category: MeditationCategory;
  title: string;
  width?: number;
  height?: number;
}

const getCategoryColors = (category: MeditationCategory): string[] => {
  switch (category) {
    case MeditationCategory.CALM:
      return ['#87CEEB', '#B0E2FF']; // Serene sky blues
    case MeditationCategory.MENTAL_CLARITY:
      return ['#E8F5F5', '#C8E6E6']; // Icy frost tones
    case MeditationCategory.VISUALISATION:
      return ['#E6E6FA', '#B19CD9']; // Ethereal lavender
    case MeditationCategory.SLEEP:
      return ['#1a237e', '#000051']; // Deep night blues
    default:
      return ['#E0E0E0', '#F5F5F5']; // Default gray
  }
};

export const MeditationPlaceholder: React.FC<MeditationPlaceholderProps> = ({
  category,
  title,
  width = 300,
  height = 200,
}) => {
  const colors = getCategoryColors(category);

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: colors[0],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors[1],
          opacity: 0.5,
          transform: [{ rotate: '45deg' }, { scale: 2 }],
        }}
      />
      <Typography
        type={TypographyTypes.H6}
        text={title}
        style={{
          color: category === MeditationCategory.SLEEP ? '#FFFFFF' : '#000000',
          textAlign: 'center',
          padding: 20,
          opacity: 0.8,
        }}
      />
    </View>
  );
}; 