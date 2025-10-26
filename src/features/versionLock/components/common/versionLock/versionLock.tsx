import React from "react";
import {
  Linking,
  Platform,
  View,
  Image,
  useWindowDimensions,
} from "react-native";
import constants from "src/themes/constants";
import {
  Typography,
  TypographyTypes,
} from "../../../../../components/common/typography";
import { Button, ButtonTypes } from "../../../../../components/common/button";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { WebFadeIn } from "../../../../../components/common/webFadeIn";

const useStyles = require("../../../../../pages/home/styles/styles").default;

export const VersionLock = () => {
  const styles = useStyles();
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth >= constants.mobileBreak;
  return (
    <View
      testID="version-lock"
      style={{ backgroundColor: "transparent", flexGrow: 1 }}
    >
      <WebFadeIn background={false}>
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            height: "100%",
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
          testID="home-page"
        >
          {!isLargeScreen && (
            <Image
              source={require("../../../../../../assets/splash2.png")}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
          {isLargeScreen && (
            <Image
              source={require("../../../../../../assets/logo2.png")}
              style={[styles.largeScreenLogo]}
            />
          )}

          <View
            style={[
              {
                position: "absolute",
                bottom: 30,
                marginBottom: 0,
                maxWidth: windowWidth - 40,
                alignSelf: "center",
              },
            ]}
          >
            <Typography
              type={TypographyTypes.H6}
              text={"Please update to the latest version"}
              style={{
                textAlign: "center",
                color: constants.primaryColor,
                fontSize: 16,
              }}
            />
            <Button
              type={ButtonTypes.Primary}
              onPress={() => {
                fireMediumHapticFeedback();
                if (
                  Platform.OS === "ios" &&
                  process.env.GET_APP_LINK_IOS &&
                  process.env.GET_APP_LINK_IOS !== "_"
                ) {
                  Linking.openURL(process.env.GET_APP_LINK_IOS);
                }
                if (
                  Platform.OS === "android" &&
                  process.env.GET_APP_LINK_ANDROID &&
                  process.env.GET_APP_LINK_ANDROID !== "_"
                ) {
                  Linking.openURL(process.env.GET_APP_LINK_ANDROID);
                }
                if (Platform.OS === "web") {
                  location.reload();
                }
              }}
              style={[
                {
                  marginTop: 20,
                  // backgroundColor: "rgba(255,255,255,0.1)",
                  // width: 200,
                },
                // styles.absoluteButton,
                {
                  maxWidth: windowWidth > 440 ? 400 : windowWidth - 40,
                  minWidth: windowWidth > 440 ? 400 : windowWidth - 40,
                },
              ]}
              title="Update"
            />
          </View>
        </View>
      </WebFadeIn>
    </View>
  );
};
