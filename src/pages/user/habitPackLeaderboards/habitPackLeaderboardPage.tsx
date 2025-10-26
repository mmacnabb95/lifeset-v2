import moment from "moment";
import React, { useEffect } from "react";
import { View } from "react-native";
import { WebFadeIn, Typography, ListBody } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { Userhabitpack } from "../../../../../types/domain/flat-types";
import { useFocusEffect } from "@react-navigation/native";
import constants from "src/themes/constants";
import { useUserHabitPackStreakLeaderboardsSearchCollection } from "src/redux/domain/features/userHabitPackStreakLeaderboard/useUserHabitPackStreakLeaderboardSearchCollection";
import { initialLoadSize } from "src/utils";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackStreakLeaderboardLoading } from "src/redux/domain/features/userHabitPackStreakLeaderboard/collection-slice";
import {
  getPublishedUserHabitPack,
  publishedUserHabitPackSelector,
} from "src/redux/domain/features/publishedUserHabitPack/collection-slice";
import { LinearGradient } from "expo-linear-gradient";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const HabitPackLeaderboardPage = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const dispatch = useDispatch();
  const layoutStyles = useLayoutStyles();
  const { habitPackId } = route.params;

  const loading = useSelector(userHabitPackStreakLeaderboardLoading);
  const {
    searchResult: leaderboardEntries,
    reSearch,
    loadMore,
    loadUserHabitPackStreakLeaderboards,
  } = useUserHabitPackStreakLeaderboardsSearchCollection(
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
    <LinearGradient
      colors={["#FF4838", "#FFBF54"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.3, y: 0.1 }}
      style={[
        {
          paddingVertical: 10,
          // paddingHorizontal: 20,
          minHeight: "100%",
        },
      ]}
    >
      <WebFadeIn
        background={false}
        waitFor={leaderboardEntries && userHabitPack && !loading}
        shouldWait={true}
      >
        <View style={layoutStyles.page}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: 0,
            }}
          >
            <Typography
              type={TypographyTypes.Body1}
              text={userHabitPack?.Name}
              style={{
                color: constants.black,
                // marginTop: 6,
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 7,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 7,
              width: "100%",
              justifyContent: "center",
            }}
          >
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
          <View style={{ width: "100%", alignItems: "center" }}>
            <View
              style={{
                borderBottomColor: "rgba(80, 80, 80, 0.15)",
                borderBottomWidth: 1,
                width: "90%",
                marginBottom: 7,
              }}
            />
          </View>
          <ListBody
            navigation={navigation}
            route={route}
            listItems={leaderboardEntries}
            loading={loading}
            style={{}}
            loadMore={loadMore}
            doLoad={loadUserHabitPackStreakLeaderboards}
            destination={""}
            orderBy={["MaxStreakThisMonth", "desc"]}
            paramKey="companyId"
            editNavItem="StreakLeaderboardItem"
          />
        </View>
      </WebFadeIn>
    </LinearGradient>
  );
};

export default HabitPackLeaderboardPage;
