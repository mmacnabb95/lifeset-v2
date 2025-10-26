import { useNavigation, useNavigationState } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Logo from "src/assets/images/logo";
import { invalidateAuth } from "src/redux/features/auth/slice";
import {
  headerTitle,
  languagePreference,
  routeName,
  setLanguage,
  setRouteName,
  videoPlayerFullScreen,
} from "src/redux/features/misc/slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useTranslation } from "src/translations/useTranslation";
import StaticWebHeader from "./staticWebHeader";
import { Button } from "src/components/common";
import { ButtonTypes } from "src/components/common/button";
import {
  Typography,
  TypographyTypes,
} from "../../components/common/typography";
import Icon from "src/components/common/icon";
import commonConstants from "src/themes/constants";
import constants from "src/themes/constants";
import { getHeaderTitle } from "@react-navigation/elements";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { CompanyLogo } from "./companyLogo";
import { ProfileImage } from "src/components/common";
import {
  getSettings,
  settingsSelector,
} from "src/redux/domain/features/settings/collection-slice";
import { Company, Settings } from "../../../../types/domain/flat-types";
import { Subscriptionview } from "../../../../src/features/subscriptions/types/flat-types";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import {
  subscriptionViewsSelector,
  getSubscriptionViews,
} from "src/features/subscriptions/redux/domain/features/subscriptionView/collection-slice";
import { useIsSubscribed } from "src/features/subscriptions/hooks/useIsSubscribed";
import { isAdmin, isUser } from "../utils/roleCheck";
import { companySelector } from "src/redux/domain/features/company/collection-slice";
import { XPDisplay } from "src/components/XPDisplay";

const useCommonStyles = require("../../themes/navbar/styles/styles").default;

export const StackNavHeader = ({
  navigation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  route,
  screenProps,
}: {
  navigation: any;
  route?: any;
  screenProps: any;
}) => {
  const commonStyles = useCommonStyles();
  const title = useSelector(headerTitle);
  const { userId, language, companyId, roles } = useUserInfo();
  const _company: Company = useSelector(companySelector(companyId));

  const { width: windowWidth } = useWindowDimensions();

  const dispatch = useDispatch();
  const reduxLanguage = useSelector(languagePreference);
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  const { text } = useTranslation();
  const navRouteName = useSelector(routeName);
  const localNavigation = useNavigation();

  const whitePages = ["EventEdit", "CategoryEdit", "CategoryPublishedView"];
  const isLargeScreen = windowWidth >= commonConstants.avgDeviceSize;

  //subs--------------------------
  const _isSubscribed = useIsSubscribed();
  const isSubscribed = _isSubscribed === true;
  //------------------------------

  const onLanguageChange = React.useCallback(() => {
    if (language !== reduxLanguage) {
      dispatch(setLanguage(language));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, reduxLanguage]);

  useEffect(() => {
    onLanguageChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    onLanguageChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.route]);

  const settings: Settings = useSelector(settingsSelector(userId));
  useEffect(() => {
    if (!settings && userId) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, settings, userId]);

  const getBackgroundColor = () => {
    if (commonConstants.avgDeviceSize > windowWidth) {
      if (navRouteName && whitePages.includes(navRouteName)) {
        return "transparent";
      }
      return "transparent";
    }
    return "transparent";
  };

  if (videoFullScreen || isLargeScreen) {
    return null;
  }

  const routes = localNavigation.getState()?.routes || [];
  const screen = routes[routes.length - 1];

  // console.log("screen", screen.name);

  const screensWithFixedHeaders = [
    "HabitEdit",
    "PredefinedHabits",
    "Settings",
    "PersonalDetails",
    "Security",
    "ChangeUsername",
    "ChangePassword",
    "ChangeEmail",
    "Exercise",
    "ExerciseEdit",
    "Dashboard",
    "CompanyDashboard",
    "Users",
    "Workout",
    "WorkoutEdit",
    "WorkoutDayEdit",
    "WorkoutDayExerciseEdit",
    "WorkoutExerciseSetEdit",
    "ForgottenPassword",
    "ForgottenPasswordConfirmation",
    "PhoneNumber",
    "ConfirmNumber",
    "ResetPassword",
    "Company",
    "CompanyEdit",
    "CompanyUserEdit",
    "CompanyUser",
    "HabitPack",
    "HabitPackEdit",
    "HabitPackHabitEdit",
    "Welcome",
    "Benefits",
    "BenefitEdit",
    "BenefitsView",
    "UserWorkouts",
    "UserWorkoutEdit",
    "UserWorkoutAssignment",
    "UserWorkoutView",
    "UserWorkoutDay",
    "UserWorkoutDayExercise",
    "UserWorkoutExerciseSetEdit",
    "StreakLeaderboard",
    "UserHabitPackEditList",
    "UserHabitPackEdit",
    "UserHabitPackHabitEdit",
    "AllUserHabitPacks",
    "PublishedUserHabitPackView",
    "AllUserHabitPackView",
    "UserHabitPackLeaderBoard",
    "Subscription",
  ];

  const screensWithGreyHeader = [
    "JournalList",
    "Journal",
    "JournalEdit",
    "JournalView",
  ];

  const screenWithWhiteButtonNav = ["UserWorkoutDayExercise"];

  const getIconColor = () => {
    // console.log("screen.name: ", screen.name);
    if (screensWithFixedHeaders.indexOf(screen.name) !== -1) {
      return "black";
    } else if (screensWithGreyHeader.indexOf(screen.name) !== -1) {
      return constants.black900;
    } else {
      return "white";
    }
  };

  const getMenuButtonBackground = () => {
    if (screenWithWhiteButtonNav.indexOf(screen.name) !== -1) {
      return "rgba(255,255,255,0.5)";
    } else {
      return "transparent";
    }
  };

  //todo: use the standard screen options instead of this approach
  const getTitle = () => {
    // console.log("screen.name", screen.name);
    if (screen.name === "Exercise") {
      return "Exercises";
    }
    if (screen.name === "Workout") {
      return "Workouts";
    }
    if (screen.name === "WorkoutEdit") {
      return "Workout";
    }
    if (screen.name === "WorkoutDayEdit") {
      return "Workout day";
    }
    if (screen.name === "WorkoutDayExerciseEdit") {
      return "Workout exercise";
    }
    if (screen.name === "WorkoutExerciseSetEdit") {
      return "Workout set";
    }
    if (screen.name === "Dashboard") {
      return "LifeSet admin";
    }
    if (screen.name === "Welcome") {
      return "";
    }
    if (screen.name === "CompanyDashboard") {
      return "Company management";
    }
    if (screen.name === "PersonalDetails") {
      return "Personal details";
    }
    if (screen.name === "Security") {
      return "Security";
    }
    if (screen.name === "ChangeEmail") {
      return "Change email";
    }
    if (screen.name === "PhoneNumber") {
      return "Phone number confirmation";
    }
    if (screen.name === "ForgottenPassword") {
      return "Password reset";
    }
    if (screen.name === "ResetPassword") {
      return "Password reset";
    }
    if (screen.name === "Company") {
      return "Companies";
    }
    if (screen.name === "CompanyEdit") {
      return "Companies";
    }
    if (screen.name === "CompanyUser") {
      return "Company users";
    }
    if (screen.name === "CompanyUserEdit") {
      return "Company user";
    }
    if (screen.name === "HabitPack") {
      return "Habit packs";
    }
    if (screen.name === "HabitPackEdit") {
      return "Habit pack";
    }
    if (screen.name === "HabitPackHabitEdit") {
      return "Habit";
    }
    if (screen.name === "BenefitEdit") {
      return "Benefit";
    }
    if (screen.name === "Benefits" || screen.name === "BenefitsView") {
      return _company.BenefitsTitle || "Benefits";
    }
    if (screen.name === "UserWorkouts") {
      return "Workouts";
    }
    if (screen.name === "UserWorkoutAssignment") {
      return "Choose workouts";
    }
    if (screen.name === "UserWorkoutView") {
      return "My workouts";
    }
    if (screen.name === "UserWorkoutExerciseSetEdit") {
      return "User's custom set";
    }
    if (screen.name === "UserWorkoutEdit") {
      return "My workouts";
    }
    if (screen.name === "UserWorkoutDay") {
      return "Workout day";
    }
    if (screen.name === "Habits") {
      return "My habits";
    }
    if (screen.name === "StreakLeaderboard") {
      return "Streak leaderboard";
    }
    if (screen.name === "UserHabitPackEditList") {
      return "Your habit packs";
    }
    if (screen.name === "UserHabitPackEdit") {
      return "Habit pack definition";
    }
    if (screen.name === "UserHabitPackHabitEdit") {
      return "Habit definition";
    }
    if (screen.name === "AllUserHabitPacks") {
      return "User habit packs";
    }
    if (screen.name === "AllUserHabitPackView") {
      return "User habit pack";
    }
    if (screen.name === "UserHabitPackLeaderBoard") {
      return "Streak leaderboard";
    }
    if (screen.name === "Subscription") {
      return "Subscription";
    }

    //UserHabitPackLeaderBoard

    //UserHabitPackHabitEdit
    //UserHabitPackEdit
    // if (screen.name === "UserWorkoutDayExercise") {
    //   return "Workout exercise";
    // }
    //ConfirmNumber
    //ChangePassword
  };

  if (!settings) {
    return null;
  }

  return (
    <View
      style={[
        commonStyles.header,
        {
          backgroundColor: getBackgroundColor(),
          position: "absolute",
          top: 0,
          width: "100%",
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={commonStyles.headerLeftColumn}>
        {windowWidth > commonConstants.avgDeviceSize ? (
          <View />
        ) : !localNavigation.canGoBack() &&
          screen.name === "CompanyDashboard" ? (
          <CompanyLogo style={{}} />
        ) : screen.name === "Welcome" ? (
          <View
            style={{
              flexDirection: "row",
              width: 200,
              left: 0,
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => {
                fireMediumHapticFeedback();
                navigation.navigate("PersonalDetails");
              }}
            >
              <ProfileImage
                imageUrl={settings?.Url || ""}
                imageMeta={settings?.Meta || ""}
                resourceLoading={false}
                viewOnly
              />
            </Pressable>
            <View style={{ marginLeft: 10 }}>
              <Typography
                type={TypographyTypes.Body1}
                text={"Welcome back"}
                style={{ fontSize: 12, color: "#505050" }}
              />
              <Typography
                type={TypographyTypes.Caption2}
                text={settings?.Name}
                style={{ fontSize: 16, color: "#505050", marginTop: 5 }}
              />
              <XPDisplay />
            </View>
          </View>
        ) : !localNavigation.canGoBack() ? (
          <View style={{ width: 50 }} />
        ) : (
          <Button
            icon="chevron-left"
            iconColor={getIconColor()}
            type={ButtonTypes.Secondary}
            onPress={() => {
              localNavigation.goBack();
            }}
            style={[
              commonStyles.backButton,
              { backgroundColor: getMenuButtonBackground() },
            ]}
            testID="go-back"
          />
        )}
      </View>
      <View style={commonStyles.headerCenterColumn}>
        <Typography
          type={TypographyTypes.Subtitle2}
          numberOfLines={2}
          text={title || getTitle() || ""}
          style={{ color: getIconColor() }}
        />
      </View>
      <View style={commonStyles.headerRightColumn}>
        {windowWidth > commonConstants.avgDeviceSize ? (
          <Pressable
            testID="user-logout-web-button"
            onPress={() => {
              dispatch(setRouteName(undefined));
              dispatch(invalidateAuth());
            }}
            style={[commonStyles.webMenuItem, commonStyles.logoutButton]}
          >
            <View style={commonStyles.webMenuItemIcon}>
              <Icon iconType="logout" iconSize={20} />
            </View>
            {windowWidth > commonConstants.avgDeviceSize && (
              <Typography
                style={commonStyles.webMenuItemLabel}
                text={text("logout") as string}
              />
            )}
          </Pressable>
        ) : (
          <View style={{ flexDirection: "row" }}>
            {!!companyId && screen.name === "Welcome" && (
              <CompanyLogo style={{}} />
            )}
            {(screen.name !== "ExploreFeatures" && isUser(roles)) ||
            isAdmin(roles) ? (
              <Button
                testID="menu"
                type={ButtonTypes.BackButton}
                onPress={() => navigation.toggleDrawer()}
                style={[
                  commonStyles.menuButton,
                  { backgroundColor: getMenuButtonBackground() },
                ]}
              >
                <Image
                  source={require("../../../assets/newmenu.png")}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </Button>
            ) : (
              <View style={[{ width: 80 }]} />
            )}
          </View>
        )}
      </View>
    </View>
  );
};
