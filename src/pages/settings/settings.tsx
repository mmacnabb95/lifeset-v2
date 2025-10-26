import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { Linking, Pressable, View } from "react-native";
import { useDispatch } from "react-redux";
import { Body, Header, NavOption, Typography, WebFadeIn } from "src/components/common";
import { setHeaderTitle } from "src/redux/features/misc/slice";
import {openComposer} from "react-native-email-link";

// @ts-ignore
const usePageStyles = require("../../themes/layout/styles/styles").default;
const useFormStyles = require("../../themes/form/styles/styles").default;
const useSettingsStyles = require("../../pages/settings/styles/styles").default;

import { useTranslation } from "src/translations/useTranslation";
import commonStyles from "./styles/common.styles";

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const styles = useSettingsStyles();
  const pageStyles = usePageStyles();
  const formStyles = useFormStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        dispatch(setHeaderTitle("Settings"));
      });
      return () => {
        dispatch(setHeaderTitle(""));
      };
    }, [dispatch]),
  );

  return (
    <WebFadeIn>
      <View style={[pageStyles.page]}>
        <Body>
          <>
            {/* <Header
              title={t("settings.title")}
              style={[pageStyles.paddingMob20]}
              navigation={navigation}
              hideGoBack={true}
            /> */}
            <View style={[styles.navList]}>
              <NavOption
                icon="user-edit"
                text={t("settings.personalDetails")}
                destination="PersonalDetails"
              />

              <NavOption
                icon="safe"
                text={t("settings.security")}
                destination="Security"
              />
              <NavOption
                icon="apps-outline"
                text={"Explore Features"}
                destination="ExploreFeatures"
                params={{ overrideRedirect: true }}
              />
              <NavOption
                icon="email-outline"
                text={"Give feedback"}
                destination=""
                params={{ overrideRedirect: true }}
                onPressOverride={async () => {
                  const url = "mailto:support@lifesetwellbeing.com?subject=Lifeset%20App%20Feedback"
                  await Linking.openURL(url);
                }}
              />
              <NavOption
                icon="unlock"
                text={t("settings.subscription")}
                destination="Subscription"
              />
            </View>
          </>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default SettingsScreen;
