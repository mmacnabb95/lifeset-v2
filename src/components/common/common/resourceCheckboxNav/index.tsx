import React, { useRef, useState } from "react";
import { Pressable, View, Image, Platform } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useDispatch, useSelector } from "react-redux";
import {
  habitApiBusy,
  setHabitApiBusy,
  setHabitApiNotBusy,
  setHeaderTitle,
} from "src/redux/features/misc/slice";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { Loading } from "../loading/loading";
import { useXPRewards } from "src/useXPRewards";
import {
  createHabitCompletedRecord,
  deleteHabitCompletedRecord,
} from "src/redux/domain/features/habitCompletedRecord/collection-slice";
import { getAllTimeStreaks } from "src/redux/domain/features/allTimeStreak/collection-slice";
import moment from "moment";
import { thunks } from "src/redux/domain/features/habit/collection-slice";
import { useXP } from "src/useXP";
import { habitsSelector } from "src/redux/domain/features/habit/collection-slice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { XP_REWARDS } from "src/redux/domain/features/xp/collection-slice";

const useCommonStyles =
  require("../../../../themes/resourceCheckboxNav/styles/styles").default;

interface ResourceEditNavOptionsProps {
  readonly navigation: NavigationProp<any>;
  readonly params?: Record<string, string | number | boolean>;
  readonly destination: string;
  readonly text: string;
  readonly showIcon?: boolean;
  readonly iconPath?: string;
  readonly iconPlaceHolder?: string;
  readonly style?: Record<string, string | number>;
  readonly subText?: string;
  readonly rightIcon?: JSX.Element;
  readonly source?: any;
}

export const ResourceCheckboxNav = ({
  navigation,
  params,
  destination,
  text,
  showIcon,
  iconPath,
  style,
  subText,
  rightIcon,
  source,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const apiBusyRef = useRef(false);
  const apiBusy = useSelector(habitApiBusy(source?.Id));
  const { checkAllHabitsCompleted } = useXPRewards();
  const { awardXP } = useXP();
  const habits = useSelector(habitsSelector(source?.User));

  const toggleChecked = async () => {
    if (source.readOnly || apiBusyRef.current || apiBusy) {
      return;
    }

    let newChecked = !checked;

    try {
      apiBusyRef.current = true;
      dispatch(setHabitApiBusy(source.Id));

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      let success = false;
      const today = moment().format("YYYY-MM-DD");

      if (newChecked === true) {
        try {
          await dispatch(
            createHabitCompletedRecord({
              Habit: source.Id,
              HabitCompletedDate: new Date(),
            }),
          );

          success = true;

          // First update habits list
          const result = await dispatch(
            thunks?.getHabitsByDate({
              user: source.User,
              date: today,
              offset: 0,
              limit: 10000,
            }),
          );

          // Check if all habits are completed
          const todaysHabits = result?.payload?.filter(
            (h: any) =>
              h.Date === today &&
              h.CreatedDate &&
              (!h.DeletedDate || new Date(h.DeletedDate) > new Date(today)),
          );

          const allCompleted =
            todaysHabits?.length > 0 &&
            todaysHabits.every((h: any) => h.CompletedToday);

          if (allCompleted) {
            // Check if we already awarded XP today
            const key = `habits_xp_${source.User}_${today}`;
            const awarded = await AsyncStorage.getItem(key);

            if (!awarded) {
              console.log("All habits completed - awarding XP bonus");
              awardXP("COMPLETE_ALL_HABITS");
              await AsyncStorage.setItem(key, "true");
            }
          }

          await dispatch(getAllTimeStreaks({ user: source.User }));
        } catch (error) {
          console.error("Error creating habit completion:", error);
          success = false;
        }
      } else {
        const todaysCompletion = source?.CompletionOverMonth?.find(
          (c: { habitCompleteRecord?: any }) => {
            if (c.habitCompleteRecord) {
              const completionDate = new Date(
                c.habitCompleteRecord.HabitCompletedDate,
              );
              const today = new Date();
              return (
                completionDate.getDate() === today.getDate() &&
                completionDate.getMonth() === today.getMonth() &&
                completionDate.getFullYear() === today.getFullYear()
              );
            }
            return false;
          },
        );

        if (todaysCompletion?.habitCompleteRecord?.Id) {
          try {
            await dispatch(
              deleteHabitCompletedRecord(
                todaysCompletion.habitCompleteRecord.Id,
              ),
            );

            success = true;

            await dispatch(
              thunks?.getHabitsByDate({
                user: source.User,
                date: today,
                offset: 0,
                limit: 10000,
              }),
            );
            await dispatch(getAllTimeStreaks({ user: source.User }));
          } catch (error) {
            console.error("Error deleting habit completion:", error);
            success = false;
          }
        } else {
          // If no completion record found, still allow unchecking
          success = true;
          setChecked(false);
        }
      }

      if (!success) {
        newChecked = !newChecked;
      }

      setChecked(newChecked);
    } catch (error) {
      console.error("Error toggling habit:", error);
      newChecked = !newChecked;
      setChecked(newChecked);
    } finally {
      apiBusyRef.current = false;
      dispatch(setHabitApiNotBusy(source?.Id));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (source?.CompletedToday === true) {
        setChecked(true);
      } else {
        setChecked(false);
      }
    }, [source?.CompletedToday]),
  );

  return (
    <>
      <View style={[commonStyles.container, style]}>
        <View style={[commonStyles.row]}>
          {!!showIcon && (
            <>
              {!!iconPath && (
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
          <Pressable
            testID={`checkbox_habit_${params?.habitId}`}
            onPress={toggleChecked}
            style={{
              height: 48,
              width: 48,
              backgroundColor: checked
                ? "#32CD32"
                : constants.checkboxBackground,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {!apiBusy && (
                <Image
                  testID={`checkbox_habit_${params?.habitId}_${
                    checked ? "checked" : "unchecked"
                  }`}
                  style={{
                    height: 26,
                    width: 26,
                    opacity: checked ? 1 : 0.1,
                    tintColor: checked ? "#FFFFFF" : "#000000",
                  }}
                  source={require("../../../../../assets/check.png")}
                />
              )}
              {apiBusy === true && <Loading size="small" />}
            </View>
          </Pressable>
          <Pressable
            onPress={toggleChecked}
            style={({ pressed }) => [
              commonStyles.textContainer,
              showIcon && iconPath ? {} : commonStyles.textContainerPadding,
              pressed
                ? { opacity: 0.7, backgroundColor: "rgba(0, 0, 0, 0.02)" }
                : {},
              { flex: 1 },
            ]}
          >
            <Typography
              numberOfLines={2}
              ellipsizeMode="tail"
              text={text}
              style={commonStyles.text}
            />

            {!!subText && (
              <View style={commonStyles.categoryView}>
                <Typography
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  text={subText || ""}
                  style={{ fontSize: 14, opacity: 0.8 }}
                />
              </View>
            )}
          </Pressable>
        </View>
        {!rightIcon && (
          <View
            style={{
              width: 50,
              borderLeftWidth: 1,
              borderLeftColor: "rgba(0, 0, 0, 0.05)",
            }}
          >
            <Pressable
              onPress={() => {
                fireMediumHapticFeedback();
                dispatch(setHeaderTitle(text));
                navigation.navigate(destination, params);
              }}
              style={({ pressed }) => ({
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
                backgroundColor: pressed
                  ? "rgba(0, 0, 0, 0.02)"
                  : "transparent",
              })}
            >
              <Button
                icon={"chevron-right"}
                type={ButtonTypes.IconButton}
                iconColor={constants.icon}
                style={[commonStyles.icon, { transform: [{ scale: 0.75 }] }]}
                onPress={() => {
                  fireMediumHapticFeedback();
                  dispatch(setHeaderTitle(text));
                  navigation.navigate(destination, params);
                }}
              />
            </Pressable>
          </View>
        )}
        {!!rightIcon && (
          <Pressable
            testID={`navOption_${destination}`}
            onPress={() => {
              fireMediumHapticFeedback();
              dispatch(setHeaderTitle(""));
              navigation.navigate(destination, params);
            }}
            style={{
              height: "100%",
              width: 50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
    </>
  );
};
