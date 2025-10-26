import React, { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import constants from "src/themes/resourceEditNavOption/constants";
import {
  Adminviewuser,
  Userworkout,
  Workout,
  Publishedworkout,
} from "../../../../../types/domain/flat-types";
import * as Haptics from "expo-haptics";
import Icon from "../icon";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserWorkout,
  deleteUserWorkout,
  userWorkoutsLoading,
  userWorkoutsSelector,
} from "src/redux/domain/features/userWorkout/collection-slice";
import { adminViewUserSelector } from "src/redux/domain/features/adminViewUser/collection-slice";
import { useRoute } from "@react-navigation/native";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

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
  readonly subText?: string | JSX.Element;
  readonly listItem: {
    Id: number;
    Name?: string;
    _workout?: {
      Id: number;
      Name: string;
      summary?: { DayCount: number };
    };
    summary?: { DayCount: number };
  };
}

const UserWorkoutEdit = ({
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
  const { userId } = useUserInfo();
  const dispatch = useDispatch();

  const _userWorkouts = useSelector(userWorkoutsSelector(userId));
  const _userWorkoutsLoading = useSelector(userWorkoutsLoading);

  const thisSelectedWorkout = _userWorkouts?.filter(
    (uw: Userworkout) => uw.Workout === listItem.Id,
  );

  const [assigned, setAssigned] = useState(!!thisSelectedWorkout?.[0]);

  useEffect(() => {
    if (_userWorkoutsLoading) {
      return;
    }
    if (thisSelectedWorkout?.[0]) {
      setAssigned(true);
    } else {
      setAssigned(false);
    }
  }, [_userWorkoutsLoading, thisSelectedWorkout]);

  const handlePress = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!thisSelectedWorkout?.[0]) {
      setAssigned(true);
      const res: any = await dispatch(
        createUserWorkout({ User: userId, Workout: listItem.Id }),
      );
      if (res.payload) {
        navigation.navigate("UserWorkoutView", {
          ...params,
          ...{
            workoutId: res.payload._workout.Id,
            userWorkoutId: res.payload.Id,
          },
        });
      }
    } else {
      navigation.navigate("UserWorkoutView", {
        ...params,
        ...{
          workoutId: thisSelectedWorkout?.[0]._workout.Id,
          userWorkoutId: thisSelectedWorkout?.[0].Id,
        },
      });
    }
  };

  const getWorkoutName = (listItem: any, text?: string): string => {
    if (text) return text;
    
    if (listItem._workout) {
      return listItem._workout.Name || "Untitled Workout";
    }
    
    if (listItem.Name) {
      return listItem.Name;
    }
    
    return "Untitled Workout";
  };

  return (
    <Pressable
      testID={`assign_workout_${listItem.Id}`}
      style={[commonStyles.container, style]}
      onPress={handlePress}
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
            text={getWorkoutName(listItem, text)}
            style={commonStyles.text}
          />

          <View style={commonStyles.categoryView}>
            <Typography
              numberOfLines={1}
              ellipsizeMode="tail"
              text={`${listItem._workout?.summary?.DayCount || listItem.summary?.DayCount || 0} day${
                (listItem._workout?.summary?.DayCount || listItem.summary?.DayCount || 0) > 1 ? "s" : ""
              }`}
              style={{ fontSize: 14 }}
            />
          </View>
        </View>
      </View>
      <Icon iconType="chevron-right" iconColor={constants.icon} iconSize={24} />
    </Pressable>
  );
};

export default UserWorkoutEdit;
