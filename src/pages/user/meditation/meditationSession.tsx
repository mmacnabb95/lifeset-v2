import React, { useMemo, useEffect } from "react";
import { View, Image, ScrollView, Alert, Pressable } from "react-native";
import { Typography } from "src/components/common/typography";
import { TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/constants";
import { MEDITATION_SESSIONS } from "./constants";
import { AudioPlayer } from "src/components/common/audioPlayer/audioPlayer";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useXPRewards } from '../../../useXPRewards';

const MeditationSessionScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const sessionId = route.params?.sessionId;
  const { handleMeditationCompletion } = useXPRewards();

  const session = useMemo(() => {
    return MEDITATION_SESSIONS.find((s) => s.id === sessionId);
  }, [sessionId]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
      } catch (error) {
        console.error("Error requesting audio permissions:", error);
        Alert.alert(
          "Error",
          "Unable to access audio. Please check your permissions."
        );
      }
    };

    setupAudio();
  }, []);

  useEffect(() => {
    if (session) {
      navigation.setOptions({
        title: session.title,
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.navigate("Main", { screen: "Meditation" })}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={constants.white} />
          </Pressable>
        ),
      });
    }
  }, [navigation, session]);

  if (!session) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Typography
          type={TypographyTypes.H5}
          text="Session not found"
          style={{ color: constants.black900 }}
        />
      </View>
    );
  }

  const handleMeditationComplete = () => {
    console.log('Meditation completed - awarding XP');
    handleMeditationCompletion();
    Alert.alert(
      "Meditation Complete",
      "Great job completing your meditation session!",
      [
        {
          text: "Done",
          onPress: () => navigation.navigate("Main", { screen: "Meditation" }),
        },
      ]
    );
  };

  return (
    <FullScreenWithBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {session.imageUrl && (
          <Image
            source={{ uri: session.imageUrl }}
            style={{
              width: "100%",
              height: 250,
              resizeMode: "cover",
            }}
          />
        )}

        <View
          style={{
            flex: 1,
            backgroundColor: "#EFEEF5",
            borderTopLeftRadius: constants.radiusXXLarge,
            borderTopRightRadius: constants.radiusXXLarge,
            marginTop: -20,
            padding: 20,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text={session.title}
            style={{
              color: constants.black900,
              marginBottom: 8,
            }}
          />

          <Typography
            type={TypographyTypes.Body1}
            text={session.description}
            style={{
              color: constants.black600,
              marginBottom: 24,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Typography
              type={TypographyTypes.Body2}
              text={`${session.duration} minutes`}
              style={{
                color: constants.black600,
              }}
            />
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: constants.black600,
                marginHorizontal: 8,
              }}
            />
            <Typography
              type={TypographyTypes.Body2}
              text={session.category}
              style={{
                color: constants.black600,
              }}
            />
          </View>

          <AudioPlayer
            audioUrl={session.audioUrl}
            onComplete={handleMeditationComplete}
          />
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default MeditationSessionScreen; 