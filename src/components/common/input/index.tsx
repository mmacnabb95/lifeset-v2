import React, { useState } from "react";
import {
  InputAccessoryView,
  Platform,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { randomStr } from "../../../utils";
import { Typography, TypographyTypes } from "../typography";
import inputConstants from "src/themes/input/constants";
import constants from "src/themes/constants";
import Icon from "../icon";

const useCommonStyles = require("../../../themes/input/styles/styles").default;

type Style = Record<string, string | number>;

interface InputProps {
  readonly style?: Style | Style[];
  readonly inputStyle?: Style | Style[];
  readonly multilineStyle?: Style | Style[];
  readonly fieldContainerStyle?: Style | Style[];
  readonly errorMessage?: string;
  readonly inputAccessoryViewID?: string;
  readonly numberOfLines?: number;
  readonly multiline?: boolean;
  readonly label?: string;
  readonly errorPlace?: "bottomRight" | "centerRight";
  readonly secureTextEntry?: boolean;
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChangeText?: (text: string) => void;
  readonly onBlur?: (e: any) => void;
  readonly testID?: string;
  readonly onKeyPress?: (e: any) => void;
  readonly onSubmitEditing?: () => void;
}

export const Input = ({
  style,
  inputStyle,
  multilineStyle,
  fieldContainerStyle,
  errorMessage,
  inputAccessoryViewID,
  multiline,
  label,
  errorPlace = "centerRight",
  numberOfLines,
  secureTextEntry,
  placeholder,
  value,
  onChangeText,
  onBlur,
  testID,
  onKeyPress,
  onSubmitEditing,
  ...rest
}: InputProps & TextInputProps) => {
  const commonStyles = useCommonStyles();
  const [showPassword, setShowPassword] = useState(false);

  const customInputAccessoryViewID =
    multiline && Platform.OS === "ios" ? randomStr() : inputAccessoryViewID;

  return (
    <View style={[commonStyles.fieldContainer, fieldContainerStyle]}>
      {!!label && (
        <View style={commonStyles.labelView}>
          <Text style={commonStyles.label}>{label}</Text>
        </View>
      )}
      <View style={[commonStyles.container, style]}>
        <TextInput
          multiline={multiline}
          numberOfLines={numberOfLines || 1}
          inputAccessoryViewID={customInputAccessoryViewID}
          style={[
            commonStyles.input,
            multiline ? [commonStyles.inputMultiLine, multilineStyle] : {},
            inputStyle,
            secureTextEntry && { paddingRight: 40 }, // Add padding for the eye icon
          ]}
          textAlignVertical={multiline ? "top" : "center"}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          testID={testID}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor={inputConstants.placeHolderColor}
          onKeyPress={onKeyPress}
          onSubmitEditing={onSubmitEditing}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: [{ translateY: -8 }],
            }}
          >
            <Icon
              iconType={showPassword ? "eye-outline" : "eye-off"}
              iconSize={16}
              iconColor={constants.black900}
            />
          </Pressable>
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
