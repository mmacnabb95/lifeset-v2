import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Typography } from "../typography";
import { TypographyTypes } from "../typography";
import constants from "src/themes/constants";
import { MeditationSession, MeditationCategory } from "src/pages/user/meditation/constants";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { AudioPlayer } from "../audioPlayer/audioPlayer";
import { LinearGradient } from "expo-linear-gradient";

interface MeditationSessionTileProps {
  session: MeditationSession;
  onPress?: (session: MeditationSession) => void;
}

const getCategoryColors = (category: MeditationCategory): string[] => {
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

export const MeditationSessionTile: React.FC<MeditationSessionTileProps> = ({
  session,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getCategoryColors(session.category);
  const isNightCategory = session.category === MeditationCategory.SLEEP;

  return (
    <Pressable
      onPress={() => {
        fireMediumHapticFeedback();
        setIsExpanded(!isExpanded);
      }}
      style={({ pressed }) => [
        {
          backgroundColor: constants.white,
          borderRadius: constants.radiusLarge,
          marginBottom: 10,
          opacity: pressed ? 0.9 : 1,
          shadowColor: constants.black900,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
          overflow: "hidden",
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={{
          height: 150,
          padding: 20,
          justifyContent: 'center',
        }}
      >
        <Typography
          type={TypographyTypes.H6}
          text={session.title}
          style={{
            color: isNightCategory ? constants.white : constants.black900,
            marginBottom: 8,
          }}
        />
        <Typography
          type={TypographyTypes.Body2}
          text={session.description}
          style={{
            color: isNightCategory ? constants.white : constants.black600,
            opacity: 0.8,
          }}
        />
      </LinearGradient>

      <View style={{ padding: 15, backgroundColor: constants.white }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
          }}
        >
          <Typography
            type={TypographyTypes.Body2}
            text={`${session.duration} min`}
            style={{
              color: constants.black600,
            }}
          />
        </View>
        
        {isExpanded && (
          <View style={{ marginTop: 15 }}>
            <AudioPlayer 
              audioUrl={session.audioUrl}
              onComplete={() => setIsExpanded(false)}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}; 