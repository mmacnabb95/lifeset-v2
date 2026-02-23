/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useRef } from "react";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";

import {
  getSettings,
  settingsSelector,
  updateSettings,
} from "../../redux/domain/features/settings/collection-slice";
import { useUserInfo } from "../../redux/features/userInfo/useUserInfo";
import { useDispatch, useSelector } from "react-redux";

import Constants from "expo-constants";
import { Settings } from "../../../../types/domain/flat-types";

//to test: https://expo.dev/notifications

//show notifications whilst the app is open
// Note: habitReminder.ts will override this to set shouldSetBadge: false
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show notification banner when app is in foreground
    shouldShowList: true, // Show in notification list
    shouldPlaySound: true,
    shouldSetBadge: false, // Changed to false to prevent red notification badge
  }),
});

const NotificationProvider = ({ children }: any) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const appState = useRef(AppState.currentState);
  const _settings: Settings = useSelector(settingsSelector(userId));

  if (Platform.OS === "web") {
    return <>{children}</>;
  }

  useEffect(() => {
    if (userId) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, userId]);

  // console.log("expo push token: ", _settings?.ExpoPushToken);

  const register = () => {
    registerForPushNotificationsAsync().then((token: any) => {
      console.log("setting notification token", Platform.OS);
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" 
      ) {
        console.log("forgrounded", Platform.OS);
        setExpoPushToken("");
        register();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return register();
  }, [userId]);

  useEffect(() => {
    async function setExpoToken() {
      if (userId && expoPushToken) {
        const response = await dispatch(getSettings(userId));

        const settings = response.payload;

        if (!settings) {
          return;
        }

        console.log("updating settings with push token", Platform.OS);// settings, expoPushToken);

        dispatch(
          updateSettings({
            Name: settings.Name,
            Email: settings.Email,
            Deleted: settings.Deleted,
            Url: settings.Url,
            Meta: settings.Meta,
            PhoneNumber: settings.PhoneNumber,
            Notifications: settings.Notifications,
            Id: settings.Id,
            ExpoPushToken: expoPushToken,
          }),
        );
      }
    }
    setExpoToken();
  }, [dispatch, expoPushToken, userId]);

  return <>{children}</>;
};

export default NotificationProvider;

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }

    // console.log("registering for push");

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig!.extra!.eas.projectId,
      })
    ).data;
  }

  return token;
}
