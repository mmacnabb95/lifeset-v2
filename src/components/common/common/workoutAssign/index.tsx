import React, { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography, TypographyTypes } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import constants from "src/themes/resourceEditNavOption/constants";
import {
  Userworkout,
  Workoutday,
} from "../../../../../types/domain/flat-types";
import * as Haptics from "expo-haptics";
import { Icon } from "../icon";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserWorkout,
  deleteUserWorkout,
  userWorkoutsLoading,
  userWorkoutsSelector,
} from "src/redux/domain/features/userWorkout/collection-slice";
import { Modal } from "../modal";
import { Button, ButtonTypes } from "../button";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { PngIcon } from "../pngIcon/pngIcon";

const useCommonStyles =
  require("../../../../themes/resourceEditNavOption/styles/styles").default;

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
    summary: { DayCount: number };
  };
}

export const WorkoutAssign = ({
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
  const dispatch = useDispatch();
  const { userId } = useUserInfo();

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

  return (
    <>
      <Pressable
        onPress={async () => {
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
        }}
        testID={`assign_workout_${listItem.Id}`}
        style={[commonStyles.container, style]}
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
              text={text}
              style={commonStyles.text}
            />

            <View style={commonStyles.categoryView}>
              <Typography
                numberOfLines={1}
                ellipsizeMode="tail"
                text={`${listItem?.summary?.DayCount} day${
                  listItem?.summary?.DayCount > 1 ? "s" : ""
                }`}
                style={{ fontSize: 14 }}
              />
            </View>
          </View>
        </View>
        <View style={{ marginRight: 10 }}>
          <Icon
            iconType={"chevron-right"}
            iconSize={24}
            iconColor={constants.icon}
          />
        </View>
        {/* <Pressable
          onPress={async () => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            if (!thisSelectedWorkout?.[0]) {
              setAssigned(true);
              await dispatch(
                createUserWorkout({ User: userId, Workout: listItem.Id }),
              );
            } else {
              setUnassignModalOpen(true);
            }
          }}
          style={{ marginRight: 10 }}
        >
          {assigned && <Icon iconSize={20} iconType="checked-filled" />}
          {!assigned && <Icon iconSize={20} iconType="checked-outline" />}
        </Pressable> */}
      </Pressable>
    </>
  );
};
