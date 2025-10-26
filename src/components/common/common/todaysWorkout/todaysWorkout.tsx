import React from "react";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { Pressable, View } from "react-native";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { LinearGradient } from "expo-linear-gradient";
import { Typography, TypographyTypes } from "../typography";
import { PngIcon } from "../pngIcon/pngIcon";
import { useUserWorkoutsSearchCollection } from "src/redux/domain/features/userWorkout/useUserWorkoutSearchCollection";
import { initialLoadSize } from "src/utils";
import _ from "lodash";
import { Userworkout } from "../../../../../types/domain/flat-types";
import { fireMediumHapticFeedback } from "src/utils/haptics";

export const TodaysWorkout = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { userId } = useUserInfo();
  const { searchResult: workouts } = useUserWorkoutsSearchCollection(
    userId,
    initialLoadSize,
  );

  const todaysWorkout = _.maxBy(
    workouts,
    (
      w: Userworkout & {
        _workout: { Id: number; Name: string; summary: { DayCount: number } };
      },
    ) => {
      return w.StartDate;
    },
  );

  const handlePress = () => {
    fireMediumHapticFeedback();
    if (todaysWorkout) {
      navigation.navigate("UserWorkoutDay", {
        workoutId: todaysWorkout._workout.Id,
        userWorkoutId: todaysWorkout.Id,
        workoutDayId: todaysWorkout.CurrentWorkoutDay,
      });
    } else {
      navigation.navigate("WorkoutDashboard");
    }
  };

  return (
    <DashboardTile
      style={{
        padding: 0,
        overflow: "hidden",
        height: 160
      }}
    >
      <LinearGradient
        colors={["#9BE9EE", "#6FB28E", "#005484"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.3, y: 0.1 }}
        style={{ height: '100%' }}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            {
              height: "100%",
              width: "100%",
              opacity: pressed ? 0.9 : 1,
              padding: 12,
            },
          ]}
        >
          <View style={{ height: '100%' }}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <PngIcon
                iconName="gym"
                height={32}
                width={32}
              />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Typography
                type={TypographyTypes.H4}
                text={todaysWorkout ? "Today's Workout" : "Workout"}
                style={{
                  color: '#505050',
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: '600'
                }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text={todaysWorkout ? 
                  `Day ${todaysWorkout.CurrentDayNumber} of ${todaysWorkout._workout.summary.DayCount}` : 
                  "Begin your fitness journey"}
                style={{
                  color: '#505050',
                  fontSize: 14,
                  opacity: 0.9
                }}
              />
            </View>
          </View>
        </Pressable>
      </LinearGradient>
    </DashboardTile>
  );
};
