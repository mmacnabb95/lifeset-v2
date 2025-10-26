import React from "react";
import { Switch, View } from "react-native";
import { Typography, TypographyTypes } from "../typography";

const useCommonStyles =
  require("../../../../themes/toggle/styles/common.styles").default;

interface ToggleProps {
  readonly label: string;
  readonly onChange: (newState: boolean) => void;
  readonly disabled?: boolean;
  readonly enabled: boolean;
  readonly testID?: string;
  readonly labelStyle?: Record<string, string | number>;
  readonly style?: Record<string, string | number>;
}

export const Toggle = ({
  label,
  onChange,
  disabled,
  enabled,
  testID,
  labelStyle,
  style,
}: ToggleProps) => {
  const commonStyles = useCommonStyles();
  const toggleSwitch = () => {
    const newEnabled = !enabled;
    onChange(newEnabled);
  };

  return (
    <View style={[commonStyles.toggle, style]}>
      <Typography
        type={TypographyTypes.Body1}
        style={[commonStyles.label, labelStyle]}
        text={label}
      />
      <Switch
        trackColor={{ false: "#767577", true: "#cce4ff" }}
        thumbColor={enabled ? "#007AFF" : "#f4f3f4"}
        activeThumbColor={"#007AFF"} // web only https://github.com/facebook/react-native/issues/30429#issuecomment-752745032
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={enabled}
        disabled={disabled}
        testID={testID}
      />
    </View>
  );
};
