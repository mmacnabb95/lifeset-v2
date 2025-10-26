import React, { useState } from "react";
import {
  InputAccessoryView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { TouchableOpacity } from "react-native-gesture-handler";
import { randomStr } from "../../../utils";
import { Typography, TypographyTypes } from "../typography";
import inputConstants from "src/themes/input/constants";
import constants from "src/themes/constants";
import { Button, ButtonTypes } from "../button";
import moment from "moment";
import { Modal } from "../modal";
import { PngIcon } from "../pngIcon/pngIcon";

const useCommonStyles = require("../../../themes/input/styles/styles").default;

type Style = Record<string, string | number>;

interface InputProps {
  readonly style?: Style | Style[];
  readonly inputStyle?: Style | Style[];
  readonly multilineStyle?: Style | Style[];
  readonly inputContainerStyle?: Style | Style[];
  readonly fieldContainerStyle?: Style | Style[];
  readonly errorMessage?: string;
  readonly inputAccessoryViewID?: string;
  readonly numberOfLines?: number;
  readonly multiline?: boolean;
  readonly value?: string;
  readonly onChange: (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
  ) => void;

  readonly label?: string;

  readonly errorPlace?: "bottomRight" | "centerRight";
}

export const DateInput = ({
  style,
  inputStyle,
  multilineStyle,
  inputContainerStyle,
  fieldContainerStyle,
  errorMessage,
  inputAccessoryViewID,
  multiline,
  label,
  errorPlace = "centerRight",
  numberOfLines,
  value,
  onChange,
  ...restProps
}: InputProps & TextInputProps) => {
  const commonStyles = useCommonStyles();
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const customInputAccessoryViewID =
    multiline && Platform.OS === "ios" ? randomStr() : inputAccessoryViewID;

  // console.log("show", show);

  return (
    <View
      style={[
        commonStyles.fieldContainer,
        fieldContainerStyle,
        inputContainerStyle,
      ]}
    >
      <View style={[{ width: "100%" }, style]}>
        <View>
          {!!label && (
            <View style={commonStyles.labelView}>
              <Text style={commonStyles.label}>{`${label} date`}</Text>
            </View>
          )}
          <Pressable
            onPress={showDatepicker}
            style={{
              height: 50,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderRadius: 10,
              borderColor: "#EDEDED",
              paddingLeft: 10,
            }}
          >
            <PngIcon iconName="calendar" />
            {!!value && (
              <Typography
                type={TypographyTypes.Body1}
                text={moment(value).format("DD/MM/YYYY")}
                style={{ paddingLeft: 20 }}
              />
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 15 }}>
          {!!label && (
            <View style={commonStyles.labelView}>
              <Text style={commonStyles.label}>{`${label} time`}</Text>
            </View>
          )}
          <Pressable
            onPress={showTimepicker}
            style={{
              height: 50,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderRadius: 10,
              borderColor: "#EDEDED",
              paddingLeft: 10,
            }}
          >
            <PngIcon iconName="clock" />
            {!!value && (
              <Typography
                type={TypographyTypes.Body1}
                text={moment(value).format("HH:mm")}
                style={{ paddingLeft: 20 }}
              />
            )}
          </Pressable>
        </View>

        {Platform.OS === "ios" && (
          <Modal
            visible={show}
            acceptButton={
              <Button
                title="Close"
                onPress={() => {
                  setShow(false);
                }}
              />
            }
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={value ? new Date(value) : new Date()}
              mode={mode}
              is24Hour={true}
              accentColor={constants.primaryColor}
              // textColor={constants.black}
              themeVariant={"light"}
              onChange={(event, selectedDate) => {
                setTimeout(() => onChange(event, selectedDate), 0);
              }}
              display={mode === "time" ? "spinner" : "inline"}
            />
          </Modal>
        )}
        {Platform.OS === "android" && show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={value ? new Date(value) : new Date()}
            mode={mode}
            is24Hour={true}
            accentColor={constants.primaryColor}
            onChange={(event, selectedDate) => {
              setTimeout(() => onChange(event, selectedDate), 0);
              setShow(false);
            }}
          />
        )}

        {!!errorMessage && errorPlace === "centerRight" ? (
          <Typography
            type={TypographyTypes.InputErrorText}
            text={errorMessage}
            style={commonStyles.errorMessage}
          />
        ) : null}

        {!!multiline && Platform.OS === "ios" && (
          <InputAccessoryView
            nativeID={customInputAccessoryViewID}
            backgroundColor="#FFFFFF"
          >
            {/* <View style={commonStyles.container}> */}
            <TouchableOpacity>
              <Typography
                type={TypographyTypes.InputSuccessText}
                text={"Done"}
                style={{
                  padding: 20,
                  color: constants.primaryColor,
                  textAlign: "right",
                }}
              />
            </TouchableOpacity>
            {/* </View> */}
          </InputAccessoryView>
        )}
      </View>
      {errorPlace === "bottomRight" && !!errorMessage && (
        <Typography
          style={commonStyles.underFieldMessage}
          type={TypographyTypes.InputErrorText}
          text={errorMessage}
        />
      )}
    </View>
  );
};
