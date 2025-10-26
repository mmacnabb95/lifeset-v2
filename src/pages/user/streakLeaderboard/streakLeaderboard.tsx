import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ListBody, Typography } from "src/components/common";
import { StreakLeaderBoard } from "src/components/common/streakLeaderboard/streakLeaderboard";
import style from "src/pages/settings/countryPicker/style";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { benefitsLoading } from "src/redux/domain/features/benefit/collection-slice";
import {
  companySelector,
  getCompany,
} from "src/redux/domain/features/company/collection-slice";
import {
  settingsSelector,
  getSettings,
} from "src/redux/domain/features/settings/collection-slice";
import { useStreakLeaderBoardsSearchCollection } from "src/redux/domain/features/streakLeaderBoard/useStreakLeaderBoardSearchCollection";
import { initialLoadSize } from "src/utils";
import { Company, Settings } from "../../../../../types/domain/flat-types";
import moment from "moment";
import { TypographyTypes } from "src/components/common/typography";
import { CompanyLogo } from "src/navigation/header/companyLogo";
import constants from "src/themes/constants";
import { LinearGradient } from "expo-linear-gradient";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const StreakLeaderboardScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const layoutStyles = useLayoutStyles();
  const dispatch = useDispatch();
  const { userId, companyId } = useUserInfo();
  const _company: Company = useSelector(companySelector(companyId));
  const settings: Settings = useSelector(settingsSelector(userId));

  const loading = useSelector(benefitsLoading);
  const {
    searchResult: leaderboardEntries,
    loadStreakLeaderBoards: loadLeaderboardEntries,
    loadMore,
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
      <View style={[layoutStyles.page]}>
        {/* <StreakLeaderBoard navigation={navigation} route={route} isPage />
         */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <CompanyLogo
            style={{ marginLeft: 0, marginTop: 10, marginBottom: 15 }}
          />
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
        </View>
        <ListBody
          navigation={navigation}
          route={route}
          listItems={leaderboardEntries}
          loading={loading}
          style={style}
          loadMore={loadMore}
          doLoad={loadLeaderboardEntries}
          destination={""}
          orderBy={["MaxStreakThisMonth", "desc"]}
          paramKey="companyId"
          editNavItem="StreakLeaderboardItem"
        />
      </View>
    </LinearGradient>
  );
};

export default StreakLeaderboardScreen;
