import React, { useEffect } from "react";
import { Typography, TypographyTypes } from "../typography";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import constants from "src/themes/constants";
import { CompanyLogo } from "src/navigation/header/companyLogo";
import { Pressable, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { benefitsLoading } from "src/redux/domain/features/benefit/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  Company,
  Settings,
  Streakleaderboard,
} from "../../../../../types/domain/flat-types";
import { Loading } from "../loading/loading";
import { WebFadeIn } from "../webFadeIn";
import { useFocusEffect } from "@react-navigation/native";
import {
  companySelector,
  getCompany,
} from "src/redux/domain/features/company/collection-slice";
import { useStreakLeaderBoardsSearchCollection } from "src/redux/domain/features/streakLeaderBoard/useStreakLeaderBoardSearchCollection";
import {
  getSettings,
  settingsSelector,
} from "src/redux/domain/features/settings/collection-slice";
import moment from "moment";
import { StreakleaderboardItem } from "../streakLeaderboardItem";
import { initialLoadSize } from "src/utils";
import { LinearGradient } from "expo-linear-gradient";

export const StreakLeaderBoard = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const dispatch = useDispatch();
  const { userId, companyId } = useUserInfo();
  const _company: Company = useSelector(companySelector(companyId));
  const settings: Settings = useSelector(settingsSelector(userId));

  const loading = useSelector(benefitsLoading);
  const {
    searchResult: leaderboardEntries,
    loadStreakLeaderBoards: loadLeaderboardEntries,
  } = useStreakLeaderBoardsSearchCollection(
    companyId,
    initialLoadSize,
    undefined,
  );

  useFocusEffect(
    React.useCallback(() => {
      if (companyId && companyId !== "new") {
        dispatch(getCompany(companyId));
      }
    }, [dispatch, companyId]),
  );

  useEffect(() => {
    if (!settings && userId) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, settings, userId]);

  if (
    !companyId ||
    !leaderboardEntries ||
    leaderboardEntries.length === 0 ||
    !settings?.StreakLeaderboardParticipation
  ) {
    return null;
  }

  return (
    <DashboardTile
      style={{
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => {
          navigation.navigate("StreakLeaderboard");
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
          {loading && !leaderboardEntries && (
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
            waitFor={leaderboardEntries && _company && !loading}
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
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  marginTop: 10,
                  paddingLeft: 4,
                }}
              >
                <View
                  style={{
                    height: 61,
                    width: 61,
                    borderRadius: 32,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <CompanyLogo
                    style={{
                      marginLeft: 0,
                      height: 40,
                      width: 40,
                    }}
                  />
                </View>
                <Typography
                  type={TypographyTypes.Body1}
                  text={"Streak leaderboard"}
                  style={{
                    color: constants.black,
                    marginTop: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 7,
                  }}
                />
              </View>
              <Typography
                type={TypographyTypes.Body1}
                text={moment(new Date()).format("MMMM YYYY")}
                style={{
                  color: constants.black,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              />
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
