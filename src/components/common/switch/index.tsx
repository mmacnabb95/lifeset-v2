import React, { SetStateAction } from "react";
import { Pressable, ViewStyle, TextStyle, View } from "react-native";

import { Typography, TypographyTypes } from "../typography";
const useCommonStyles = require("../../../themes/switch/styles/styles").default;

export interface SwitchOption {
  value: number | string;
  label: string;
}

interface Props {
  active?: number | string;
  options: SwitchOption[];
  onChange: (active: number | string) => void | SetStateAction<number | string>;
  style?: ViewStyle;
  activeStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const Switch: React.FC<Props> = ({
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
      {options.map((option: SwitchOption, key: number) => (
        <>
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
          {options[key + 1] && <View style={commonStyles.listItemDivider} />}
        </>
      ))}
    </View>
  );
};

export default Switch;
