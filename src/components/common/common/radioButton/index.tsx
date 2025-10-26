import React from "react";
import { View } from "react-native";
import {
  Button,
  ButtonTypes,
  PositionTypes,
} from "src/components/common/button";
import { toString } from "lodash";
import constants from "src/themes/radioButton/constants";

const useStyles =
  require("../../../../themes/radioButton/styles/styles").default;

interface RadioButtonProps {
  readonly items: (string | number)[];
  readonly selectedItem: string | number;
  readonly onSelect: (item: string | number) => void;
  readonly type: ButtonTypes;
}

export const RadioButton = ({
  items,
  selectedItem,
  type,
  onSelect,
}: RadioButtonProps) => {
  const commonStyles = useStyles();
  return (
    <View style={[commonStyles.checkboxes]}>
      {items.map((item: string | number, key: number) => (
        <View key={key} style={commonStyles.checkbox}>
          <Button
            title={toString(item)}
            onPress={() => onSelect(item)}
            icon={
              selectedItem === item
                ? "checked-radio-filled"
                : "checked-radio-outline"
            }
            type={type}
            position={PositionTypes.Left}
            withOpacity={false}
            titleStyle={
              selectedItem === item
                ? commonStyles.textChecked
                : commonStyles.textStyle
            }
            iconColor={
              selectedItem === item
                ? constants.checkedColor
                : constants.unCheckedColor
            }
            style={
              selectedItem === item
                ? commonStyles.checkboxBorder
                : commonStyles.checkboxCheckedBorder
            }
          />
        </View>
      ))}
    </View>
  );
};
