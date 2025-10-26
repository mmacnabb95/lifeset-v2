import React, { useEffect, useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { Audio } from "expo-av";
import { Typography } from "../typography";
import { TypographyTypes } from "../typography";
import constants from "src/themes/constants";
import { Ionicons } from "@expo/vector-icons";

interface AudioPlayerProps {
  audioUrl: string;
  onComplete?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onComplete }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Request audio permissions
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.error("Error setting up audio:", err);
        setError("Failed to initialize audio");
      }
    };

    setupAudio();

    return sound
      ? () => {
          console.log("Unloading sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading audio from URL:", audioUrl);

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
        true
      );

      console.log("Audio loaded successfully");
      setSound(audioSound);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading audio:", error);
      setError("Failed to load audio file");
      setIsLoading(false);
      Alert.alert("Error", "Failed to load meditation audio");
    }
  };

  useEffect(() => {
    loadAudio();
  }, [audioUrl]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        onComplete?.();
      }
    } else if (status.error) {
      console.error("Playback error:", status.error);
      setError(`Playback error: ${status.error}`);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing/pausing:", error);
      setError("Failed to play/pause audio");
      Alert.alert("Error", "Failed to control playback");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Typography
          type={TypographyTypes.Body1}
          text={error}
          style={{ color: constants.black900 }}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Typography
          type={TypographyTypes.Body1}
          text="Loading meditation..."
          style={{ color: constants.black900 }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: constants.white,
        borderRadius: constants.radiusLarge,
        padding: 20,
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={handlePlayPause}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: constants.primaryColor,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={32}
          color={constants.white}
        />
      </Pressable>

      <View style={{ width: "100%", alignItems: "center" }}>
        <View
          style={{
            width: "100%",
            height: 4,
            backgroundColor: "#E0E0E0",
            borderRadius: 2,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: `${(position / duration) * 100}%`,
              height: "100%",
              backgroundColor: constants.primaryColor,
              borderRadius: 2,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography
            type={TypographyTypes.Body2}
            text={formatTime(position)}
            style={{ color: constants.black600 }}
          />
          <Typography
            type={TypographyTypes.Body2}
            text={formatTime(duration)}
            style={{ color: constants.black600 }}
          />
        </View>
      </View>
    </View>
  );
}; 