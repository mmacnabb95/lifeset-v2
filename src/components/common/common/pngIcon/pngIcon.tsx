import React from "react";
import { Image, ImageSourcePropType } from "react-native";

const iconMap: { [key: string]: ImageSourcePropType } = {
  calendar: require(`../../../../assets/Calendar.png`),
  clock: require(`../../../../assets/clock.png`),
  yoga: require(`../../../../assets/yoga.png`),
  yoga2: require(`../../../../assets/yoga2.png`),
  stop: require(`../../../../assets/stop.png`),
  calendarBlack: require(`../../../../assets/calendarBlack.png`),
  journal: require(`../../../../assets/journal.png`),
  weightlifting: require(`../../../../assets/weightlifting.png`),
  dumbell: require(`../../../../assets/dumbell.png`),
  dumbell2: require(`../../../../assets/dumbell2.png`),
  gym: require(`../../../../assets/gym.png`),
  info: require(`../../../../assets/info.png`),
  running: require(`../../../../assets/running.png`),
  rightChevron: require(`../../../../assets/rightChevron.png`),
  diet: require(`../../../../assets/diet.png`),
  dietary: require(`../../../../assets/dietary.png`),
  diary: require(`../../../../assets/diary.png`),
  weights: require(`../../../../assets/weights.png`),
  onboarding0: require(`../../../../assets/in-app-icon-with-text.png`),
  onboarding1: require(`../../../../assets/ob-habits.png`),
  onboarding2: require(`../../../../assets/ob-streak-leaderboard.png`),
  onboarding3: require(`../../../../assets/ob-mindset-journal.png`),
  onboarding4: require(`../../../../assets/ob-breathe.png`),
  onboarding5: require(`../../../../assets/ob-workout.png`),
  onboarding6: require(`../../../../assets/ob-habit-packs.png`),
};

type Style = Record<string, string | number>;

export const PngIcon = ({
  iconName,
  height,
  width,
  style,
}: {
  iconName: string;
  height?: number;
  width?: number;
  style?: Style | Style[];
}) => {
  return (
    <Image
      style={[{ height: height || 30, width: width || 30 }, style]}
      source={iconMap[iconName]}
    />
  );
};
