import React, { useEffect, useState } from "react";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import { Image, ScrollView, Text, View } from "react-native";
import { Button, ResourceCheckboxNav, Typography } from "src/components/common";
import { ButtonTypes } from "src/components/common/button";
import { useDispatch, useSelector } from "react-redux";
import {
  habitSelector,
  habitsSelector,
  thunks,
} from "src/redux/domain/features/habit/collection-slice";
import { Habit } from "../../../../../types/domain/flat-types";
import { FullHabit } from "../../../../../types/custom/types";
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/constants";
import { setHeaderTitle } from "src/redux/features/misc/slice";
import moment from "moment";
import { Doughnut } from "./chart/doughnut";
import { DailyDoughnut } from "./chart/dailyDoughnut";
import _ from "lodash";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const useStyles = require("./styles/styles").default;

const HabitTracking = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const today = moment().format("YYYY-MM-DD");
  const { habitId } = route.params;
  const { userId } = useUserInfo();
  const habits = useSelector(habitsSelector(userId));
  const habit = habits?.find(
    (h: Habit & { Date?: string }) =>
      moment(h.Date).format("YYYY-MM-DD") === today && h.Id === habitId,
  );

  const [_completionOverMonth, setCompletionOverMonth] = useState(
    habit?.CompletionOverMonth,
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!habit) {
        navigation.navigate("Habits");
      }
      dispatch(setHeaderTitle(habit?.Title));
      return () => {
        dispatch(setHeaderTitle(""));
      };
    }, [dispatch, habit, navigation]),
  );

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        thunks!.getHabitsByDate({
          user: userId,
          date: today,
          offset: 0,
          limit: 10000,
        }),
      );
    }, [dispatch, userId]),
  );

  useEffect(() => {
    if (habit?.CompletionOverMonth) {
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let com = _.cloneDeep(habit.CompletionOverMonth);

      // prepend start of the week to the start of the  month
      const startDayIndex = weekDays.indexOf(com[0].dayOfTheWeek);
      for (let i = startDayIndex - 1; i >= 0; i--) {
        com.splice(0, 0, {
          dayOfTheWeek: weekDays[i] + "_",
          completed: false,
          habitCompleteRecord: undefined,
        });
      }

      // append end of the week to the end of the month
      const endDayIndex = weekDays.indexOf(com[com.length - 1].dayOfTheWeek);
      for (let i = endDayIndex + 1; i < 7; i++) {
        com.push({
          dayOfTheWeek: weekDays[i] + "_",
          completed: false,
          habitCompleteRecord: undefined,
        });
      }

      setCompletionOverMonth(com);
    }
  }, [habit?.CompletionOverMonth]);

  return (
    <FullScreenWithBackground>
      <ScrollView
        style={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
      >
        <View
          style={{
            marginBottom: 22,
          }}
        >
          <Typography
            type={TypographyTypes.Body1}
            style={{ textAlign: "center", color: constants.white }}
            text={habit?.Description}
          />
        </View>
        <View
          style={{
            // borderWidth: 1,
            maxHeight: 210,
            flexGrow: 1,
            marginBottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* pass in month progress */}
          <Doughnut data={[habit?.MonthlyCompletionPercentage]} />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            height: 32,
            marginBottom: 22,
          }}
        >
          <View style={{ flex: 1 }}>
            <Typography
              type={TypographyTypes.Default}
              style={{ textAlign: "left", color: constants.white }}
              text={"Repeat:"}
            />
            <Typography
              type={TypographyTypes.Body1}
              style={{
                textAlign: "left",
                color: constants.white,
                opacity: 0.7,
                textTransform: "capitalize",
              }}
              text={habit?.Schedule?.Repetition}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Typography
              type={TypographyTypes.Default}
              style={{ textAlign: "right", color: constants.white }}
              text={"Remind:"}
            />
            <Typography
              type={TypographyTypes.Body1}
              style={{
                textAlign: "right",
                color: constants.white,
                opacity: 0.7,
                textTransform: "capitalize",
              }}
              text={moment(habit?.Schedule?.DateTimeOfTheDay).format("HH:mm")}
            />
          </View>
        </View>
        <View style={{ marginBottom: 35 }}>
          <ResourceCheckboxNav
            text="Mark complete today"
            destination={"HabitEdit"}
            navigation={navigation}
            params={route.params}
            source={habit}
            rightIcon={
              <Image
                source={require("../../../../assets/Setting_line.png")}
                style={{ height: 24, width: 24 }}
              />
            }
          />
        </View>
        <View>
          {/* render rows of 7 days */}
          {_completionOverMonth?.map((c, i) => {
            if ((i + 1) % 7 === 0) {
              return (
                <View style={styles.doughnutRow} key={`${i}_week`}>
                  {_completionOverMonth
                    ?.filter((c, j) => j < i + 1 && j >= i + 1 - 7)
                    .map((c, j) => {
                      if (c.dayOfTheWeek.endsWith("_")) {
                        return (
                          <View
                            key={`${i + j}_day`}
                            style={{
                              height: 60,
                              width: 40,
                              backgroundColor: "transparent",
                            }}
                          />
                        );
                      }
                      return (
                        <DailyDoughnut
                          key={`${i + j}_day`}
                          text={c.dayOfTheWeek}
                          data={[c.completed ? 1 : 0]}
                        />
                      );
                    })}
                </View>
              );
            }
          })}
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default HabitTracking;
