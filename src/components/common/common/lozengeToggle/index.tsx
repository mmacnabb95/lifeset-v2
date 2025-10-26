import React, { SetStateAction } from "react";
import { Pressable, ViewStyle, TextStyle, View } from "react-native";

import { Typography, TypographyTypes } from "../typography";
const useCommonStyles =
  require("../../../../themes/lozengeToggle/styles/styles").default;

export interface LozengeToggleOption {
  value: number | string;
  label: string;
}

interface Props {
  active?: number | string;
  options: LozengeToggleOption[];
  onChange: (active: number | string) => void | SetStateAction<number | string>;
  style?: ViewStyle;
  activeStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const LozengeToggle: React.FC<Props> = ({
  active,
  options,
  onChange,
  style,
  activeStyle,
  textStyle,
}) => {
  const commonStyles = useCommonStyles();

  return (
    <View style={commonStyles.list}>
      {options.map((option: LozengeToggleOption, key: number) => (
        <Pressable
          key={key}
          style={[
            commonStyles.listItem,
            style,
            active === option.value && [
              commonStyles.listItemActive,
              activeStyle,
            ],
          ]}
          onPress={() => onChange(option.value)}
        >
          <Typography
            type={TypographyTypes.Body2}
            text={option.label}
            style={[
              commonStyles.textStyle,
              active === option.value && [
                commonStyles.activeTextStyle,
                textStyle,
              ],
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
};

export default LozengeToggle;
