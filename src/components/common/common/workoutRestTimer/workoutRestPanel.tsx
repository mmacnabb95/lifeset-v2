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
import { ProgressChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

let timer: any;

const MediButton = ({
  minutes,
  setCountdownTime,
  setStarted,
  countdownTime,
  setType,
}: {
  minutes: number;
  setCountdownTime: React.Dispatch<React.SetStateAction<number>>;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  countdownTime: number;
  setType: "cardio" | "weight";
}) => {
  return (
    <Button
      type={ButtonTypes.Primary}
      disabled={countdownTime > 0}
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
        height: 32,
        minHeight: 40,
        flexDirection: "row",
        maxWidth: 112,
        minWidth: 112,
        flexBasis: "auto",
        flexShrink: 1,
        flexGrow: 0,
        opacity: countdownTime > 0 ? 0.5 : 1,
        paddingHorizontal: 8,
      }}
    >
      {/* {setType === "weight" && (
        <PngIcon iconName="weightlifting" height={24} width={24} />
      )}
      {setType === "cardio" && (
        <PngIcon iconName="running" height={24} width={24} />
      )} */}
      <Typography
        text={"Start rest"}
        style={{
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: 400,
          fontFamily: "Poppins_400Regular",
          marginLeft: 0,
        }}
        type={TypographyTypes.ButtonTextPrimary}
      />
    </Button>
  );
};

export const WorkoutRestPanel = ({
  restTime,
  setType,
}: {
  restTime: number; //in minutes
  setType: "cardio" | "weight";
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
      require("../../../../../assets/mixkit-fairy-bells.wav"),
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
    const _seconds = countdownTime / 1000;
    const _renderTime = moment()
      .minutes((_seconds - (_seconds! % 60)) / 60)
      .seconds(_seconds % 60)
      .format("mm:ss");

    setTimeText(_renderTime);
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
      setTimeout(() => {
        clearInterval(timer);
      }, 1000);
    }
  }, [countdownTime, restTime, started]);

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

  const chartConfig: AbstractChartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (_opacity = 1, _index) => `rgba(0, 152, 255, ${_opacity})`,
  };

  const _data = {
    data: [1 - countdownTime / 1000 / 60 / restTime],
    colors: [constants.blue900],
  };

  return (
    <DashboardTile
      style={{
        height: 106,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <ProgressChart
          data={_data}
          width={80}
          height={80}
          strokeWidth={5}
          hasLegend={true}
          withCustomBarColorFromData={true}
          radius={35}
          chartConfig={chartConfig}
          hideLegend={true}
          style={{ justifyContent: "flex-start" }}
        />
        <View
          style={{
            height: 80,
            width: 80,
            position: "absolute",
            top: Platform.OS === "android" ? 3 : -1,
            justifyContent: Platform.OS === "android" ? "flex-start" : "center",
            alignItems: "center",
          }}
        >
          <Typography
            type={TypographyTypes.Caption2}
            text={timeText}
            style={[
              {
                width: "100%",
                textAlign: "center",
                color: constants.blue900,
                fontSize: 15,
                lineHeight: 22,
                fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                height: 20,
              },
              Platform.OS === "android" ? { top: 25 } : {},
            ]}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <View style={{ marginLeft: 5, marginRight: 5 }}>
          <View style={{ flexDirection: "row" }}>
            <Typography
              text={"Rest for "}
              type={TypographyTypes.Body1}
              style={{ color: "rgba(0, 0, 0, 0.50)", fontSize: 13 }}
            />
            <Typography
              text={moment()
                .minutes((restTime * 60 - ((restTime * 60) % 60)) / 60)
                .seconds((restTime * 60) % 60)
                .format("m:ss")}
              type={TypographyTypes.Body2}
              style={{
                color: "rgba(0, 0, 0, 0.7)",
                fontSize: 10,
                fontWeight: 600,
                // verticleAlign: "center",
                // letterSpacing: 0.5,
              }}
            />
          </View>
          <Typography
            text={"in between sets"}
            type={TypographyTypes.Body1}
            style={{ color: "rgba(0, 0, 0, 0.50)", fontSize: 13 }}
          />
        </View>
      </View>
      <MediButton
        minutes={restTime}
        setCountdownTime={setCountdownTime}
        setStarted={setStarted}
        countdownTime={countdownTime}
        setType={setType}
      />
    </DashboardTile>
  );
};
