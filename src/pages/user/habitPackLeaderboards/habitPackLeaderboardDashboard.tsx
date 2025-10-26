import moment from "moment";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import { WebFadeIn, Typography } from "src/components/common";
import { DashboardTile } from "src/components/common/dashboardTile/dashboardTile";
import { Loading } from "src/components/common/loading/loading";
import { StreakleaderboardItem } from "src/components/common/streakLeaderboardItem";
import { TypographyTypes } from "src/components/common/typography";
import {
  Streakleaderboard,
  Userhabitpack,
} from "../../../../../types/domain/flat-types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import constants from "src/themes/constants";
import { useUserHabitPackStreakLeaderboardsSearchCollection } from "src/redux/domain/features/userHabitPackStreakLeaderboard/useUserHabitPackStreakLeaderboardSearchCollection";
import { initialLoadSize } from "src/utils";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackStreakLeaderboardLoading } from "src/redux/domain/features/userHabitPackStreakLeaderboard/collection-slice";
import { LinearGradient } from "expo-linear-gradient";
import {
  getPublishedUserHabitPack,
  publishedUserHabitPackSelector,
} from "src/redux/domain/features/publishedUserHabitPack/collection-slice";

export const HabitPackLeaderboardDashboard = ({
  habitPackId,
}: {
  habitPackId: number;
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const loading = useSelector(userHabitPackStreakLeaderboardLoading);
  const { searchResult: leaderboardEntries, reSearch } =
    useUserHabitPackStreakLeaderboardsSearchCollection(
      habitPackId,
      initialLoadSize,
    );
  useFocusEffect(
    React.useCallback(() => {
      reSearch();
    }, []),
  );

  const userHabitPack: Userhabitpack = useSelector(
    publishedUserHabitPackSelector(habitPackId),
  );

  useEffect(() => {
    if (!userHabitPack) {
      dispatch(getPublishedUserHabitPack(habitPackId));
    }
  }, [dispatch, habitPackId, userHabitPack]);

  return (
    <DashboardTile
      style={{
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => {
          navigation.navigate("UserHabitPackLeaderBoard", { habitPackId });
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
            position: "relative",
            flexBasis: "auto",
            flexShrink: 1,
            flexGrow: 0,
          },
        ]}
      >
        <LinearGradient
          colors={["#FF4838", "#FFBF54"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.3, y: 0.1 }}
          style={[
            {
              paddingVertical: 10,
              paddingHorizontal: 20,
            },
          ]}
        >
          {(!leaderboardEntries || !userHabitPack) && (
            <View
              style={{
                height: "100%",
                top: 0,
                width: 100,
                position: "absolute",
                alignSelf: "center",
              }}
            >
              <Loading />
            </View>
          )}
          <WebFadeIn
            background={false}
            waitFor={leaderboardEntries && userHabitPack && !loading}
            shouldWait={true}
            style={{
              flexBasis: "auto",
              flexShrink: 1,
              flexGrow: 0,
              height: undefined,
            }}
          >
            <View
              style={{
                width: "100%",
                alignItems: "center",
                flexBasis: "auto",
                flexShrink: 1,
                flexGrow: 0,
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginTop: 10,
                  // paddingLeft: 4,
                }}
              >
                <Typography
                  type={TypographyTypes.Body1}
                  text={userHabitPack?.Name}
                  style={{
                    color: constants.black,
                    marginTop: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 7,
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", marginBottom: 7 }}>
                <Typography
                  type={TypographyTypes.Body1}
                  text={"Streak leaderboard - "}
                  style={{
                    color: constants.black,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Typography
                  type={TypographyTypes.Body1}
                  text={moment(new Date()).format("MMMM YYYY")}
                  style={{
                    color: constants.black,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              </View>
              <View
                style={{
                  borderBottomColor: "rgba(80, 80, 80, 0.15)",
                  borderBottomWidth: 1,
                  width: "90%",
                  marginBottom: 7,
                }}
              />
              {leaderboardEntries
                ?.filter((b, i) => i < 3)
                .map((leaderboardEntry: Streakleaderboard) => {
                  return (
                    <StreakleaderboardItem
                      key={`leaderboardEntry_${leaderboardEntry.Id}`}
                      navigation={navigation}
                      style={{
                        width: "100%",
                        flexBasis: "auto",
                        flexShrink: 1,
                        flexGrow: 0,
                      }}
                      listItem={leaderboardEntry}
                      descriptionLines={2}
                    />
                  );
                })}
            </View>
          </WebFadeIn>
        </LinearGradient>
      </Pressable>
    </DashboardTile>
  );
};
