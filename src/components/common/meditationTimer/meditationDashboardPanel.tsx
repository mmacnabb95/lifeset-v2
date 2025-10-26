import React, { useEffect, useState } from "react";
import { Typography, TypographyTypes } from "../typography";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import constants from "src/themes/constants";
import { Platform, Pressable, View } from "react-native";
import { useDispatch } from "react-redux";
import { Button, ButtonTypes } from "../button";
import { PngIcon } from "../pngIcon/pngIcon";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import moment from "moment";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";

let timer: any;

const MediButton = ({
  route,
  navigation,
  minutes,
  setCountdownTime,
  setStarted,
  countdownTime,
}: {
  route: any;
  navigation: any;
  minutes: number;
  setCountdownTime: React.Dispatch<React.SetStateAction<number>>;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  countdownTime: number;
}) => {
  return (
    <View style={{}}>
      <Button
        type={ButtonTypes.Secondary}
        title={`${minutes} min`}
        onPress={() => {
          activateKeepAwakeAsync(`timer_med`);
          setCountdownTime(minutes * 60 * 1000);
          let _countdownTime = minutes * 60 * 1000;
          timer = setInterval(() => {
            _countdownTime = _countdownTime - 1000;
            if (_countdownTime < 0) {
              _countdownTime = 0;
            }
            setCountdownTime(_countdownTime);
          }, 1000);
          setStarted(true);
        }}
        style={{
          width: 88,
          height: 32,
          minHeight: 36,
          borderRadius: 40,
          borderWidth: 0,
          borderColor: constants.transparent,
          backgroundColor: "rgba(255, 255, 255, 0.60)",
        }}
        titleStyle={{
          color: "#505050",
          fontSize: 13,
          lineHeight: 18,
          fontWeight: 400,
          fontFamily: "Poppins_400Regular",
        }}
      />
    </View>
  );
};

export const MeditationDashboardPanel = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [countdownTime, setCountdownTime] = useState(0);
  const [timeText, setTimeText] = useState("");
  const [sound, setSound] = useState<Audio.Sound>();
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  async function playSound() {
    console.log("Loading Sound");
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { sound } = await Audio.Sound.createAsync(
      require("../../../../assets/soft_chime.mp3"),
    );

    setSound(sound);

    // console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          // console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const d = moment.duration(countdownTime, "milliseconds");
    const mins = Math.floor(d.asMinutes());
    const seconds = Math.floor(d.asSeconds() - mins * 60);
    const _renderSeconds =
      seconds.toString().length === 1 && seconds > 10
        ? seconds.toString() + "0"
        : seconds < 10
        ? "0" + seconds.toString()
        : seconds.toString();

    const renderTime = `${mins}:${_renderSeconds}`;
    setTimeText(renderTime);
  }, [countdownTime]);

  useEffect(() => {
    if (finished === true && started === true) {
      setFinished(false);
      setStarted(false);
      playSound();
    }
  }, [finished, started]);

  useEffect(() => {
    if (started === true && countdownTime === 0) {
      setFinished(true);
      deactivateKeepAwake(`timer_med`);
      setTimeout(() => clearInterval(timer), 1000);
    }
  }, [countdownTime, started]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setFinished(false);
        setStarted(false);
        clearInterval(timer);
        setCountdownTime(0);
        if (started) {
          deactivateKeepAwake(`timer_med`);
        }
      };
    }, []),
  );

  return (
    <DashboardTile
      style={{
        paddingTop: 10,
        height: 118,
        backgroundColor: "#9B59B6",
      }}
    >
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <PngIcon iconName="yoga2" height={37} width={37} />
        <View style={{ marginLeft: 10, marginTop: 2 }}>
          <Typography
            text={"Breathe"}
            type={TypographyTypes.Caption2}
            style={{ color: "#FFFFFF", fontSize: 16, lineHeight: 19 }}
          />
          {countdownTime > 0 ? (
            <Typography
              text={"inner peace in progress... breathe in, breathe out"}
              type={TypographyTypes.Body1}
              style={{ color: "#FFFFFF", fontSize: 11 }}
            />
          ) : (
            <Typography
              text={"take a moment to clear your mind"}
              type={TypographyTypes.Body1}
              style={{ color: "#FFFFFF", fontSize: 11, lineHeight: 15 }}
            />
          )}
        </View>
      </View>
      {countdownTime === 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            flex: 1,
            alignItems: "center",
          }}
        >
          <MediButton
            route={route}
            navigation={navigation}
            minutes={5}
            setCountdownTime={setCountdownTime}
            setStarted={setStarted}
            countdownTime={countdownTime}
          />
          <MediButton
            route={route}
            navigation={navigation}
            minutes={10}
            setCountdownTime={setCountdownTime}
            setStarted={setStarted}
            countdownTime={countdownTime}
          />
          <MediButton
            route={route}
            navigation={navigation}
            minutes={15}
            setCountdownTime={setCountdownTime}
            setStarted={setStarted}
            countdownTime={countdownTime}
          />
        </View>
      )}
      {countdownTime > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            marginLeft: 44,
            justifyContent: "space-between",
          }}
        >
          <Typography
            type={TypographyTypes.Caption2}
            text={timeText}
            style={{
              color: "white",
              fontSize: 30,
              lineHeight: 33,
              maxHeight: 27,
            }}
          />
          <Pressable
            style={{ marginBottom: 0 }}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              clearInterval(timer);
              setFinished(false);
              setStarted(false);
              setCountdownTime(0);
            }}
          >
            <PngIcon iconName="stop" />
          </Pressable>
        </View>
      )}
    </DashboardTile>
  );
};
