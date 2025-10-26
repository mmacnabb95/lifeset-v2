import React, { useEffect, useState, useRef } from "react";
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  Platform,
  Animated,
  StyleSheet,
} from "react-native";
import { useTranslation } from "src/translations/useTranslation";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "src/redux/features/misc/slice";
import { Language } from "src/translations/types";
import { Button, ButtonTypes } from "src/components/common/button";
import { ListBody, Typography } from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";
import { habitsLoading } from "src/redux/domain/features/habit/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import constants from "src/themes/constants";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import moment from "moment";
import { Doughnut } from "../habitTracking/chart/doughnut";
import { getCompletedPercentageForDate, getWeekDays } from "./helpers";
import { DailyDoughnut } from "../habitTracking/chart/dailyDoughnut";
import { useHabitByDateCollection } from "src/redux/domain/features/habit/useHabitByDateCollection";
import { FaderView } from "src/components/common/fader/faderView";
import { Habit } from "../../../../../types/domain/flat-types";
import * as Haptics from "expo-haptics";
import {
  allTimeStreaksSelector,
  getAllTimeStreaks,
} from "src/redux/domain/features/allTimeStreak/collection-slice";
import { useFocusEffect } from "@react-navigation/native";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const DailyHabitsScreen = ({
  navigation,
  route,
  summaryOnly,
  style,
  scrollEnabled = true,
  compactMode = false,
}: {
  navigation: any;
  route: any;
  summaryOnly?: boolean;
  style?: any;
  scrollEnabled?: boolean;
  compactMode?: boolean;
}) => {
  const layoutStyles = useLayoutStyles();
  const { width: windowWidth } = useWindowDimensions();
  const availableWidth =
    windowWidth - 40 - (style?.paddingLeft || 0) - (style?.paddingRight || 0); //i.e. - padding

  const { text } = useTranslation();
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const today = moment().format("YYYY-MM-DD");
  const [yearMonthDayDate, setYearMonthDayDate] = useState(today);
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotation = useRef(new Animated.Value(0)).current;
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(setLanguage(Language.English));
  }, [dispatch]);

  const basicParams = {
    limit: 10000,
  };

  //actually returns all habits for this week
  const {
    results: habits,
    loadMore,
    loadHabits,
  } = useHabitByDateCollection(userId, yearMonthDayDate, 10000);

  const loading = useSelector(habitsLoading);
  const { width: screenWidth } = useWindowDimensions();

  const weekDays = getWeekDays();

  const filterHabitByCreationDeletionDate = (
    _habit: Habit,
    _dateInFocus: string,
  ) => {
    const _date = new Date(moment(_dateInFocus).format("YYYY-MM-DD"));
    const _createdDate = new Date(
      moment(_habit.CreatedDate).format("YYYY-MM-DD"),
    );
    const _deletedDate = _habit.DeletedDate
      ? new Date(moment(_habit.DeletedDate).format("YYYY-MM-DD"))
      : undefined;

    if (_date >= _createdDate && (!_deletedDate || _date < _deletedDate)) {
      return true;
    }

    return false;
  };

  const weekCompletionPercentages = weekDays?.map((day: string) => {
    return getCompletedPercentageForDate(
      habits?.filter((h) => {
        // console.log("h.Date", h.Date, "day", day, h.Date === day?.split(",")[0], h.Title, filterHabitByCreationDeletionDate(h, h.Date));
        const r =
          h.Date === day?.split(",")[0] &&
          filterHabitByCreationDeletionDate(h, h.Date);
        return r;
      }),
      day?.split(",")[0],
    );
  });

  const _allTimeStreak = useSelector(allTimeStreaksSelector(userId));

  const [_strikeLength, setStrikeLength] = useState(0);
  const strikeLength = _allTimeStreak?.[0]?.StreakDays;

  useEffect(() => {
    setStrikeLength(strikeLength);
  }, [strikeLength]);

  const jsDay = moment(yearMonthDayDate).day();
  const mondayZeroBasedDay = jsDay === 0 ? 6 : jsDay - 1;
  const completionPercentage = weekCompletionPercentages[mondayZeroBasedDay];

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      // dispatch(setHeaderTitle(""));
    });

    return unsubscribe;
  }, [dispatch, navigation]);

  useEffect(() => {
    if (userId) {
      dispatch(getAllTimeStreaks({ user: userId }));
    }
  }, [dispatch, userId]);

  let todaysHabits = habits?.filter((h) => h.Date === yearMonthDayDate);
  const permissionedHabits: (Habit & { readOnly: boolean })[] = [];
  todaysHabits?.forEach((h: Habit) => {
    if (filterHabitByCreationDeletionDate(h, yearMonthDayDate)) {
      permissionedHabits.push({
        ...h,
        readOnly: yearMonthDayDate !== today,
      });
    }
  });

  useEffect(() => {
    if (permissionedHabits.length > 0 && yearMonthDayDate === today) {
      const allCompleted = permissionedHabits.every(
        (habit) => habit.CompletedToday,
      );
      if (allCompleted) {
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
        }

        const animation = Animated.parallel([
          Animated.sequence([
            // Super quick explosive burst (now 1.4x)
            Animated.timing(flameScale, {
              toValue: 1.4, // Changed from 1.5 to 1.4
              duration: 150,
              useNativeDriver: true,
            }),
            // Quick fallback
            Animated.timing(flameScale, {
              toValue: 1.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(flameScale, {
                  toValue: 1.4,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(flameScale, {
                  toValue: 1.2,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 3 },
            ),
          ]),
          // More dramatic rotation
          Animated.loop(
            Animated.sequence([
              Animated.timing(flameRotation, {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(flameRotation, {
                toValue: -0.3,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 8 },
          ),
        ]);

        animation.start();

        animationTimeout.current = setTimeout(() => {
          animation.stop();
          Animated.parallel([
            Animated.timing(flameScale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(flameRotation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }, 2100);
      } else {
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
        }
        flameScale.setValue(1);
        flameRotation.setValue(0);
      }
    }

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [permissionedHabits, yearMonthDayDate, today]);

  const styles = StyleSheet.create({
    tileContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: 8, // reduced padding
      gap: 8, // smaller gap between tiles
    },
    tile: {
      width: "48%", // slightly smaller width to fit 2 tiles per row with gap
      aspectRatio: 1.2, // more compact aspect ratio
      borderRadius: 8,
      padding: 12, // reduced internal padding
      marginBottom: 8, // reduced bottom margin
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    tileTitle: {
      fontSize: 14, // smaller font size
      fontWeight: "600",
      marginBottom: 4, // reduced margin
    },
    tileContent: {
      fontSize: 12, // smaller content text
      lineHeight: 16,
    },
  });
  useFocusEffect(
    React.useCallback(() => {
      if (userId && yearMonthDayDate) {
        loadHabits({
          date: yearMonthDayDate,
          offset: 0,
          limit: 10000,
        });
      }
    }, [userId, yearMonthDayDate]),
  );

  return (
    <FullScreenWithBackground headerCompenstation={summaryOnly ? false : true}>
      <>
        <ScrollView
          style={{ height: "100%" }}
          nestedScrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              justifyContent: "space-between",
              marginTop: compactMode ? -10 : -20,
              flexGrow: 1,
            },
            style,
          ]}
          testID="home-page"
          scrollEnabled={scrollEnabled}
        >
          <View
            style={{
              paddingHorizontal: compactMode ? 12 : 20,
              alignItems: "center",
              paddingTop: compactMode ? 12 : 20,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  width: availableWidth / 2,
                  height: "100%",
                }}
              >
                <View style={{ top: compactMode ? 35 : 55 }}>
                  <Typography
                    text={text("habits.overall.subtitle")}
                    type={TypographyTypes.H5}
                    style={{
                      color: constants.white,
                      fontSize: compactMode ? 18 : 22,
                      marginBottom: 0,
                    }}
                  />

                  <Typography
                    text={
                      yearMonthDayDate === today
                        ? "Today"
                        : weekDays
                            .find(
                              (wd) => yearMonthDayDate === wd?.split(",")[0],
                            )
                            ?.split(",")[1]
                            .substring(1) || ""
                    }
                    type={TypographyTypes.H5}
                    style={{
                      color: constants.white,
                      marginBottom: 10,
                      fontSize: compactMode ? 18 : 22,
                    }}
                  />
                </View>
                {_strikeLength > 0 && (
                  <FaderView
                    key={`fader_strikes`}
                    testID={`daily_streak`}
                    visible={_strikeLength > 0}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        marginTop: compactMode ? 6 : 10,
                        top: compactMode ? 40 : 60,
                      },
                    ]}
                  >
                    <Animated.Image
                      source={require("../../../assets/be-icons/png/flame.png")}
                      style={{
                        width: compactMode ? 32 : 40,
                        height: compactMode ? 32 : 40,
                        marginRight: 6,
                        transform: [
                          { scale: flameScale },
                          {
                            rotate: flameRotation.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ["-30deg", "30deg"],
                            }),
                          },
                        ],
                      }}
                    />
                    <Typography
                      text={_strikeLength.toString()}
                      style={{
                        color: constants.white,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    />
                    <Typography
                      text={" day streak!"}
                      style={{ color: constants.white }}
                    />
                  </FaderView>
                )}
              </View>
              <View
                style={{
                  width: availableWidth / 2,
                  transform: [{ scale: compactMode ? 0.9 : 1 }],
                }}
              >
                <Doughnut title={""} data={[completionPercentage || 0]} />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: compactMode ? 20 : 30,
                paddingBottom: compactMode ? 12 : 20,
                marginTop: compactMode ? 8 : 12,
                width: availableWidth,
              }}
            >
              {weekDays?.map((day, index) => (
                <Pressable
                  key={`${index}_day`}
                  testID={`${day?.split(",")[1].substring(1, 3)}_${
                    day?.split(",")[0] === yearMonthDayDate ? "selected" : "_"
                  }`}
                  onPress={() => {
                    if (yearMonthDayDate !== day?.split(",")[0]) {
                      setYearMonthDayDate(day?.split(",")[0]);
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }
                  }}
                >
                  <DailyDoughnut
                    key={`${index}_dou`}
                    text={day?.split(",")[1].substring(1, 3)}
                    data={[weekCompletionPercentages?.[index] ?? 0]}
                    selected={day?.split(",")[0] === yearMonthDayDate}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {!summaryOnly && (
            <View
              style={{
                flexGrow: 1,
                backgroundColor: "#EFEEF5",
                borderTopLeftRadius: constants.radiusXXLarge,
                borderTopRightRadius: constants.radiusXXLarge,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              {!todaysHabits ||
                (todaysHabits.length === 0 && (
                  <View>
                    <Typography
                      text={"No habits yet"}
                      style={{ color: constants.black900, textAlign: "center" }}
                    />
                  </View>
                ))}
              <ListBody
                navigation={navigation}
                contentStyle={layoutStyles.scrollPageCompensation}
                route={route}
                listItems={permissionedHabits}
                loading={loading}
                style={style}
                basicParams={basicParams}
                loadMore={loadMore}
                doLoad={loadHabits}
                destination={"Tracking"}
                paramKey="habitId"
                orderBy={["Title"]}
                showSubText={true}
                editNavItem="ResourceCheckboxNav"
              />
            </View>
          )}
        </ScrollView>
        {!summaryOnly && (
          <>
            <View
              style={{
                flexGrow: 1,
                backgroundColor: "#EFEEF5",
                height: 45,
                marginTop: -24,
              }}
            />
            <Button
              onPress={() => navigation.navigate("PredefinedHabits")}
              type={ButtonTypes.Primary}
              title={text("habits.dailyHabits.addNew")}
              testID="add-new-habit"
              style={{
                position: "absolute",
                bottom: 30,
                left: 20,
                width: screenWidth - 40,
              }}
            />
          </>
        )}
      </>
    </FullScreenWithBackground>
  );
};

export default DailyHabitsScreen;
