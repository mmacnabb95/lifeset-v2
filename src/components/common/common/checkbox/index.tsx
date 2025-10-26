import {
  Button,
  ButtonTypes,
  PositionTypes,
} from "src/components/common/button";
import { View } from "react-native";
import React from "react";
import constants from "src/themes/checkbox/constants";

const useCommonStyles =
  require("../../../../themes/checkbox/styles/styles").default;

export interface CheckBoxItem {
  Id: number;
  Value: string | number;
  testID?: string;
}

interface CheckboxProps {
  readonly items: CheckBoxItem[];
  readonly selectedItems: CheckBoxItem[];
  readonly onSelect: (item: CheckBoxItem) => void;
  readonly theme?: ButtonTypes;
}

export const Checkbox = ({
  items,
  selectedItems,
  theme,
  onSelect,
}: CheckboxProps) => {
  const commonStyles = useCommonStyles();

  return (
    <View style={[commonStyles.container]}>
      {items &&
        items.length > 0 &&
        items.map((item: CheckBoxItem, key: number) => (
          <View key={key} style={commonStyles.checkboxContainer}>
            <Button
              title={item.Value.toString()}
              onPress={() => onSelect(item)}
              testID={item.testID}
              icon={
                selectedItems.find((i) => i.Id === item.Id)
                  ? "checked-filled"
                  : "checked-outline"
              }
              type={theme}
              position={PositionTypes.Left}
              withOpacity={false}
              titleStyle={
                selectedItems.find((i) => i.Id === item.Id)
                  ? commonStyles.textChecked
                  : commonStyles.textStyle
              }
              iconColor={
                selectedItems.find((i) => i.Id === item.Id)
                  ? constants.iconColor
                  : constants.checkedIconColor
              }
              style={
                selectedItems.find((i) => i.Id === item.Id)
                  ? commonStyles.checkboxBorder
                  : commonStyles.checkboxCheckedBorder
              }
            />
          </View>
        ))}
    </View>
  );
};
