import React, { useEffect, useRef, useState } from "react";
import { AppState, Image, View, useWindowDimensions } from "react-native";
import { useTranslation } from "src/translations/useTranslation";
import { useDispatch } from "react-redux";
import { setLanguage } from "src/redux/features/misc/slice";
import { Language } from "src/translations/types";
import { Button, WebFadeIn } from "src/components/common";
import { ButtonTypes } from "src/components/common/button";
import commonConstants from "src/themes/constants";

const useStyles = require("./styles/styles").default;

import { useFocusEffect } from "@react-navigation/native";
import { versionLocked } from "src/features/versionLock/components/common/versionLock/utils";
import { VersionLock } from "src/features/versionLock/components/common/versionLock/versionLock";

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const styles = useStyles();
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth >= commonConstants.avgDeviceSize;

  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  const { t } = useTranslation();

  const dispatch = useDispatch();

  //#b3aad3

  useEffect(() => {
    dispatch(setLanguage(Language.English)); //todo: add UI selection option
  }, [dispatch]);

  const checkLock = async () => {
    const _locked = await versionLocked();
    setLocked(_locked);
  };

  useFocusEffect(
    React.useCallback(() => {
      checkLock();
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkLock();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (locked) {
    return <VersionLock />;
  }

  return (
    <View style={{ backgroundColor: "#FFFFFF", flexGrow: 1 }}>
      <WebFadeIn background={false}>
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
          }}
          testID="home-page"
        >
          {!isLargeScreen && (
            <Image
              source={require("../../../assets/splash2.png")}
              style={[styles.splash]}
            />
          )}
          {isLargeScreen && (
            <Image
              source={require("../../../assets/logo2.png")}
              style={[styles.largeScreenLogo]}
            />
          )}

          <Button
            onPress={() => navigation.navigate("Login")}
            type={ButtonTypes.Primary}
            title={t("auth.home.getStarted")}
            testID="app-login-button"
            style={[
              styles.absoluteButton,
              { minWidth: windowWidth > 440 ? 400 : windowWidth - 40 },
            ]}
          />
        </View>
      </WebFadeIn>
    </View>
  );
};
