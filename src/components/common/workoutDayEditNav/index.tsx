import React from "react";
import { Platform, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";
import { Workoutday } from "../../../../../types/domain/flat-types";
import * as Haptics from "expo-haptics";

const useCommonStyles =
  require("../../../themes/resourceEditNavOption/styles/styles").default;

interface ResourceEditNavOptionsProps {
  readonly navigation: NavigationProp<any>;
  readonly params?: Record<string, string | number | boolean>;
  readonly destination: string;
  readonly text: string;
  readonly showIcon?: boolean;
  readonly iconPath?: string;
  readonly iconPlaceHolder?: string;
  readonly style?: Record<string, string | number>;
  // eslint-disable-next-line no-undef
  readonly subText?: string | JSX.Element;
  readonly listItem: Workoutday & {
    summary: { ExerciseName: string }[];
  };
}

export const WorkoutDayEditNav = ({
  navigation,
  params,
  destination,
  text,
  showIcon,
  iconPath,
  style,
  subText,
  listItem,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();

  return (
    <Pressable
      testID={`navOption_${destination}`}
      key={`navOption_${destination}_${listItem.Id}`}
      style={[commonStyles.container, style]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        navigation.navigate(destination, params);
      }}
    >
      <View style={[commonStyles.row]}>
        {showIcon && (
          <>
            {iconPath && (
              <IkImageViewer
                style={commonStyles.thumbnail}
                imagePath={iconPath}
                height={constants.thumbnailHeight}
                width={constants.thumbnailWidth}
                transform
              />
            )}
          </>
        )}
        <View
          style={[
            commonStyles.textContainer,
            showIcon && iconPath ? {} : commonStyles.textContainerPadding,
          ]}
        >
          <Typography
            numberOfLines={2}
            ellipsizeMode="tail"
            text={`Day ${text}`}
            style={commonStyles.text}
          />

          <View style={commonStyles.categoryView}>
            <Typography
              numberOfLines={1}
              ellipsizeMode="tail"
              text={`${listItem?.summary
                ?.map((e) => e.ExerciseName)
                .join(". ")}`}
              style={{ fontSize: 14 }}
            />
          </View>
        </View>
      </View>
      <Button
        icon={"chevron-right"}
        type={ButtonTypes.IconButton}
        iconColor={constants.icon}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          navigation.navigate(destination, params);
        }}
        style={commonStyles.icon}
      />
    </Pressable>
  );
};
