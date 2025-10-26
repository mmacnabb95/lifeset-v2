import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  ViewStyle,
  Animated,
  Platform,
} from "react-native";
import { Button, Modal } from "src/components/common";
import constants from "src/themes/constants";
import { Toggle } from "../toggle";
import { Typography, TypographyTypes } from "../typography";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { ButtonTypes } from "../button";
import {
  enGB,
  registerTranslation,
  TimePickerModal,
} from "react-native-paper-dates";
import { Habit } from "../../../../../types/domain/flat-types";
import * as Haptics from "expo-haptics";
import { useSelector } from "react-redux";
import { predefinedHabit } from "src/redux/features/misc/slice";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import moment from "moment-timezone";

registerTranslation("en-GB", enGB);

const useStyles = require("./styles/styles").default;

type Repetition = "daily" | "weekly" | "monthly" | undefined;

interface HabitSchedule {
  Id?: number | undefined;
  Habit: number | undefined;
  Notifications: boolean;
  Repetition: Repetition;
  DaySelection: string[] | undefined; // only applies to weekly Repetition
  DaysOfTheMonth: number[]; // not sure how this will repeat over months of different length
  DateTimeOfTheDay: Date | string | undefined; // date will be discarded and only time retained
}

const emptySchedule: HabitSchedule = {
  Habit: undefined,
  Notifications: false,
  Repetition: "daily",
  DaySelection: undefined,
  DaysOfTheMonth: [],
  DateTimeOfTheDay: new Date(),
};

const IconWithText = ({
  text,
  value,
  iconSource,
  actionIcon,
  actionIconStyle,
  toggle,
  onToggle,
  onAction,
  testID,
  actionTestID,
  disabled,
}: {
  text: string;
  value?: boolean;
  iconSource: ImageSourcePropType;
  actionIcon?: ImageSourcePropType;
  actionIconStyle?: StyleProp<ViewStyle>;
  toggle?: boolean;
  onToggle?: (on: boolean) => void;
  onAction?: () => void;
  testID?: string;
  actionTestID?: string;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const route = useRoute();
  const [toggleOn, setToggleOn] = useState(value || false);

  useEffect(() => {
    if (value !== undefined) {
      setToggleOn(value);
    }
  }, [value]);

  return (
    <View style={styles.iconWithTextContainer}>
      <View style={styles.iconWithText}>
        <Image source={iconSource} style={styles.icon} />
        <Typography
          type={TypographyTypes.Body1}
          style={styles.text}
          text={text}
        />
      </View>
      {toggle && (
        <View style={styles.toggleContainer}>
          <Toggle
            disabled={route?.params?.viewOnly || disabled}
            testID={testID}
            label={""}
            onChange={() => {
              if (onToggle) {
                onToggle(!toggleOn);
              }
              setToggleOn(!toggleOn);
            }}
            enabled={toggleOn}
          />
        </View>
      )}
      {actionIcon && (
        <Pressable
          disabled={route?.params?.viewOnly || disabled}
          onPress={onAction}
          style={styles.actionStyle}
          testID={actionTestID}
        >
          <Image source={actionIcon} style={[styles.icon, actionIconStyle]} />
        </Pressable>
      )}
    </View>
  );
};

const Divider = () => {
  const styles = useStyles();
  return <View style={styles.divider} />;
};

const DaySelector = ({
  value,
  onDaySelected,
  disabled,
}: {
  value: string[];
  onDaySelected: (days: string[]) => void;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const route = useRoute();
  const availableDays = [
    { label: "M", id: "Monday" },
    { label: "T", id: "Tuesday" },
    { label: "W", id: "Wednesday" },
    { label: "T", id: "Thursday" },
    { label: "F", id: "Friday" },
    { label: "S", id: "Saturday" },
    { label: "S", id: "Sunday" },
  ];
  const [selectedDays, setSelectedDays] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  useEffect(() => {
    if (value) {
      setSelectedDays(value);
    }
  }, [value]);

  return (
    <View style={styles.daySelector}>
      {availableDays.map(
        (
          d: {
            label: string;
            id: string;
          },
          i: number,
        ) => {
          return (
            <Pressable
              disabled={route?.params?.viewOnly || disabled}
              testID={`${d.id}${i}`}
              key={`${d.id}${i}`}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                const days = _.cloneDeep(selectedDays);
                if (!days[i]) {
                  days[i] = d.id;
                } else {
                  days[i] = "";
                }
                setSelectedDays(days);
                onDaySelected(days);
              }}
              style={[
                selectedDays[i] === d.id
                  ? {
                      backgroundColor: constants.blue900,
                    }
                  : {},
                styles.day,
              ]}
            >
              <Typography
                type={TypographyTypes.Body1}
                style={[
                  selectedDays[i] === d.id
                    ? { color: constants.white }
                    : { color: constants.black900 },
                ]}
                text={d.label}
              />
            </Pressable>
          );
        },
      )}
    </View>
  );
};

const RepetitionSelector = ({
  value,
  onSelect,
  disabled,
}: {
  value: Repetition;
  onSelect: (rep: Repetition) => void;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const route = useRoute();
  const availableReps = ["daily", "weekly", "monthly"];
  const [repSelected, setRepSelected] = useState<Repetition>(
    value || undefined,
  );

  useEffect(() => {
    if (value !== undefined) {
      setRepSelected(value);
    }
  }, [value]);

  return (
    <View style={styles.lozengeSelector}>
      {availableReps.map((rep: Repetition | string) => {
        return (
          <Pressable
            disabled={route?.params?.viewOnly || disabled}
            key={rep}
            testID={rep}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onSelect(rep?.toLowerCase()! as Repetition);
              setRepSelected(rep! as Repetition);
            }}
            style={[
              styles.lozengeOption,
              repSelected === rep ? styles.lozengeSelected : {},
            ]}
          >
            <Typography
              type={TypographyTypes.Caption1}
              style={[
                styles.repetitionText,
                repSelected === rep ? styles.repetitionTextSelected : {},
              ]}
              text={rep!}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const Day = ({
  d,
  onSelect,
  selected,
  disabled,
}: {
  d: number;
  onSelect: (day: number) => void;
  selected: boolean;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const route = useRoute();
  return (
    <Pressable
      disabled={route?.params?.viewOnly || disabled}
      testID={`day_${d}`}
      style={[
        selected
          ? {
              backgroundColor: constants.blue900,
            }
          : {},
        styles.dayInGrid,
      ]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onSelect(d);
      }}
    >
      <Typography
        type={TypographyTypes.Body2}
        text={d.toString()}
        style={[
          selected ? { color: constants.white } : { color: constants.black900 },
        ]}
      />
    </Pressable>
  );
};

const DateGrid = ({
  onSelect,
  value,
  disabled,
}: {
  onSelect: (day: number) => void;
  value: number[];
  disabled?: boolean;
}) => {
  const styles = useStyles();
  // using math instead of this long hand means we can't flex each row with space between for different viewport sizes
  const daysRow1 = [1, 2, 3, 4, 5, 6, 7];
  const daysRow2 = [8, 9, 10, 11, 12, 13, 14];
  const daysRow3 = [15, 16, 17, 18, 19, 20, 21];
  const daysRow4 = [22, 23, 24, 25, 26, 27, 28];

  return (
    <View style={styles.dateGrid}>
      <View style={[styles.dateGridRowContainer, { marginTop: 11 }]}>
        {daysRow1.map((d: number) => {
          return (
            <Day
              key={d}
              d={d}
              onSelect={onSelect}
              selected={value.includes(d)}
              disabled={disabled}
            />
          );
        })}
      </View>
      <View style={styles.dateGridRowContainer}>
        {daysRow2.map((d: number) => {
          return (
            <Day
              key={d}
              d={d}
              onSelect={onSelect}
              selected={value.includes(d)}
              disabled={disabled}
            />
          );
        })}
      </View>
      <View style={styles.dateGridRowContainer}>
        {daysRow3.map((d: number) => {
          return (
            <Day
              key={d}
              d={d}
              onSelect={onSelect}
              selected={value.includes(d)}
              disabled={disabled}
            />
          );
        })}
      </View>
      <View style={styles.dateGridRowContainer}>
        {daysRow4.map((d: number) => {
          return (
            <Day
              key={d}
              d={d}
              onSelect={onSelect}
              selected={value.includes(d)}
              disabled={disabled}
            />
          );
        })}
      </View>
    </View>
  );
};

export const Schedule = ({
  formRef,
  habit,
  includeNotifcations = true,
}: {
  formRef: any;
  habit: Habit & { schedule?: HabitSchedule; readonly?: boolean };
  includeNotifcations?: boolean;
}) => {
  const styles = useStyles();
  const route = useRoute();
  const navigation = useNavigation();

  const _predefinedHabit = useSelector(predefinedHabit);

  const [screenLoaded, setScreenLoaded] = useState(false);

  const [scheduleExpanded, setscheduleExpanded] = useState(true);

  const initialSchedule = _predefinedHabit?.Schedule || emptySchedule;

  const [habitSchedule, setHabitSchedule] = useState<HabitSchedule>({
    ...initialSchedule,
    ...{ habit: habit?.Id },
  });

  const getheightAnimRepetitionHeight = useCallback(() => {
    const height =
      habitSchedule.Repetition === "weekly"
        ? 100
        : habitSchedule.Repetition === "monthly"
        ? 200
        : 0;
    return height;
  }, [habitSchedule.Repetition]);

  const getHeightAnimHeight = useCallback(() => {
    const height =
      scheduleExpanded && habitSchedule.Repetition === "weekly"
        ? 170
        : scheduleExpanded && habitSchedule.Repetition === "monthly"
        ? 300
        : scheduleExpanded &&
          (habitSchedule.Repetition === "daily" ||
            habitSchedule.Repetition === undefined)
        ? 70
        : 0;
    return height;
  }, [habitSchedule.Repetition, scheduleExpanded]);

  const heightAnim = useRef(new Animated.Value(0)).current; // Initial value
  const heightAnimRepetition = useRef(new Animated.Value(0)).current; // Initial value

  const [timeSelectionText, setTimeSelectionText] = useState("Set time");
  const [showiOSPicker, setShowiOSPicker] = useState(false);
  const [showWebPicker, setShowWebPicker] = useState(false);

  // console.log("timeSelectionText", timeSelectionText);
  // console.log("habitSchedule.DateTimeOfTheDay", habitSchedule.DateTimeOfTheDay);
  // console.log("habit schedule", habitSchedule);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: getHeightAnimHeight(),
      duration: screenLoaded ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [
    heightAnim,
    scheduleExpanded,
    habitSchedule.Repetition,
    getHeightAnimHeight,
    screenLoaded,
  ]);

  useEffect(() => {
    Animated.timing(heightAnimRepetition, {
      toValue: getheightAnimRepetitionHeight(),
      duration: screenLoaded ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [
    heightAnimRepetition,
    habitSchedule.Repetition,
    getheightAnimRepetitionHeight,
    screenLoaded,
  ]);

  const onTimeChange = (
    event: DateTimePickerEvent | undefined,
    selectedDate: Date | undefined,
  ) => {
    const _schedule = _.cloneDeep(habitSchedule);

    //when dates are process by axios and sent in a request they get toStringed()
    //... this is different for everyone : https://stackoverflow.com/a/17545854

    // console.log("selecting date");

    const _tm = moment(selectedDate);
    _schedule.DateTimeOfTheDay = _tm.format("YYYY-MM-DDTHH:mm:ss.SSS");

    setTimeSelectionText(
      selectedDate!
        .toLocaleTimeString("en-GB", {
          timeStyle: "short",
        })
        .substring(0, 5),
    );
    setHabitSchedule(_schedule);
  };

  useEffect(() => {
    formRef.current.setFieldValue(
      "Schedule",
      _.cloneDeep(habitSchedule),
      false,
    );
  }, [formRef, habitSchedule]);

  useEffect(() => {
    const _schedule = (habit as any)?.Schedule || _predefinedHabit?.Schedule;
    // console.log("_schedule", _schedule);
    let _dateTimeOfTheDay = "";
    if (_schedule?.DateTimeOfTheDay) {
      const t = moment(_schedule.DateTimeOfTheDay);
      _dateTimeOfTheDay = t.format("YYYY-MM-DDTHH:mm:ss.SSS");
    }

    if (_schedule) {
      const _habitSchedule: HabitSchedule = {
        Id: _schedule.Id,
        Habit: _schedule.Habit,
        Notifications: _schedule.Notifications,
        Repetition: _schedule.Repetition,
        DaySelection: _schedule.DaySelection?.split(","),
        DaysOfTheMonth: _schedule.DaysOfTheMonth?.split(",").map((d: string) =>
          Number(d),
        ),
        DateTimeOfTheDay: _dateTimeOfTheDay,
      };
      setHabitSchedule(_habitSchedule);
      const _mtime = moment(_habitSchedule.DateTimeOfTheDay);
      const _time = _mtime.format("HH:mm");
      setTimeSelectionText(_time);
    }
  }, [_predefinedHabit?.Schedule, habit]);

  useEffect(() => {
    if (_predefinedHabit?.readOnly) {
      navigation.setParams({ viewOnly: true });
    }
  }, [_predefinedHabit?.readOnly, navigation]);

  useEffect(() => {
    if (_predefinedHabit) {
      formRef.current?.setFieldValue("Title", _predefinedHabit.Name);
      formRef.current?.setFieldValue("Category", _predefinedHabit.Category);
      formRef.current?.setFieldValue(
        "Description",
        _predefinedHabit.Description,
      );
    }
  }, [_predefinedHabit, formRef]);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => setScreenLoaded(true), 1000);
    }, []),
  );

  return (
    <>
      <View style={styles.container} key={"schedule"}>
        {includeNotifcations && (
          <>
            <IconWithText
              testID="Notifications"
              text={"Notifications"}
              value={habitSchedule.Notifications}
              iconSource={require("../../../../assets/notification.png")}
              toggle={true}
              onToggle={(Notifications: boolean) => {
                const _schedule = _.cloneDeep(habitSchedule);
                _schedule.Notifications = Notifications;
                setHabitSchedule(_schedule);
              }}
            />
            <Typography
              text={"Turn this on to be reminded at the time below."}
              style={styles.reminderText}
            />
            <Divider />
          </>
        )}
        <IconWithText
          text={
            habitSchedule.Repetition
              ? habitSchedule.Repetition
              : "Choose schedule..."
          }
          actionTestID={`dropdown_${habitSchedule.Repetition}`}
          iconSource={require("../../../../assets/Calendar.png")}
          actionIcon={
            route?.params?.viewOnly || !!habit?.UserHabitPack
              ? undefined
              : require("../../../../assets/Expand_down.png")
          }
          actionIconStyle={scheduleExpanded ? styles.open : styles.closed}
          onAction={() => {
            setscheduleExpanded(!scheduleExpanded);
          }}
        />
        <Animated.View
          style={[
            {
              height: heightAnim,
            },
            styles.expandingSection,
          ]}
        >
          <RepetitionSelector
            disabled={!!habit?.UserHabitPack}
            value={habitSchedule.Repetition}
            onSelect={(rep: Repetition) => {
              const _schedule = _.cloneDeep(habitSchedule);
              _schedule.Repetition = rep;
              setHabitSchedule(_schedule);
            }}
          />
          <View>
            <Typography
              type={TypographyTypes.Body1}
              style={styles.text}
              text={"Day selection"}
            />
            {habitSchedule.Repetition === "weekly" && (
              <DaySelector
                disabled={!!habit?.UserHabitPack}
                value={habitSchedule.DaySelection}
                onDaySelected={(days: string[]) => {
                  const _schedule = _.cloneDeep(habitSchedule);
                  _schedule.DaySelection = days;
                  setHabitSchedule(_schedule);
                }}
              />
            )}
            {habitSchedule.Repetition === "monthly" && (
              <DateGrid
                disabled={!!habit?.UserHabitPack}
                value={habitSchedule.DaysOfTheMonth}
                onSelect={(d: number) => {
                  const _schedule = _.cloneDeep(habitSchedule);
                  if (_schedule.DaysOfTheMonth?.indexOf(d) === -1) {
                    _schedule.DaysOfTheMonth.push(d);
                  } else {
                    _.remove(_schedule.DaysOfTheMonth!, (v) => {
                      return v === d;
                    });
                  }
                  setHabitSchedule(_schedule);
                }}
              />
            )}
          </View>
        </Animated.View>
        <Divider />
        <IconWithText
          text={timeSelectionText}
          iconSource={require("../../../../assets/Time_progress.png")}
          actionIcon={
            route?.params?.viewOnly || !!habit?.UserHabitPack
              ? undefined
              : require("../../../../assets/Expand_down.png")
          }
          actionIconStyle={styles.nav}
          onAction={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            if (Platform.OS === "android") {
              DateTimePickerAndroid.open({
                value: moment(habitSchedule.DateTimeOfTheDay)
                  .utc(false)
                  .toDate(),
                onChange: (event, selectedDate) =>
                  onTimeChange(event, selectedDate),
                mode: "time",
                is24Hour: true,
              });
            } else if (Platform.OS === "ios") {
              setShowiOSPicker(!showiOSPicker);
            } else {
              setShowWebPicker(true);
            }
          }}
        />
        <Modal
          visible={showiOSPicker}
          acceptButton={
            <Button
              type={ButtonTypes.Primary}
              title={"Close"}
              onPress={() => setShowiOSPicker(false)}
            />
          }
        >
          <DateTimePicker
            testID="dateTimePicker"
            value={moment(habitSchedule.DateTimeOfTheDay).utc(false).toDate()}
            onChange={(event, selectedDate) => {
              onTimeChange(event, selectedDate);
            }}
            mode={"countdown"}
            is24Hour
            style={styles.iOSTimePicker}
          />
        </Modal>
        {/* https://github.com/web-ridge/react-native-paper-dates/blob/master/src/Time/TimePickerModal.tsx */}
        <TimePickerModal
          visible={showWebPicker}
          onDismiss={() => setShowWebPicker(false)}
          onConfirm={({
            hours,
            minutes,
          }: {
            hours: number;
            minutes: number;
          }) => {
            const selectedDateTime = new Date();
            selectedDateTime.setHours(hours);
            selectedDateTime.setMinutes(minutes);
            onTimeChange({} as unknown as any, selectedDateTime);
            setShowWebPicker(false);
          }}
          use24HourClock
          hours={new Date(habitSchedule.DateTimeOfTheDay!).getHours()}
          minutes={new Date(habitSchedule.DateTimeOfTheDay!).getMinutes()}
        />
      </View>
      {/* TODO: what started off as a "quick" idea to style the form is not the most efficient...
      these  blocks should be removed and styled instead */}
      <View style={styles.formCover}>
        <View
          style={{
            backgroundColor: constants.white,
            borderBottomLeftRadius: constants.radius,
            borderBottomRightRadius: constants.radius,
            height: 20,
            width: "100%",
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: constants.appBackground,
          position: "absolute",
          bottom: 0,
          height: 20,
          width: "100%",
        }}
      />
    </>
  );
};
