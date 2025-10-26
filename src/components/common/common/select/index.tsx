/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleProp,
  Text,
  View,
  ViewStyle,
  Image,
} from "react-native";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import constants from "src/themes/select/constants";

import { IconTypes } from "src/components/common/icon";
import Icon from "src/components/common/icon";
import { Typography, TypographyTypes } from "../typography";

const useCommonStyles =
  require("../../../../themes/select/styles/styles").default;

const useCommonTypographyStyles =
  require("../../../../themes/typography/styles/styles").default;

export type CustomValueType = ValueType;

interface SelectProps {
  readonly icon?: IconTypes;
  readonly title?: string;
  readonly theme?: "primary" | "secondary" | "red";
  readonly value: CustomValueType;
  readonly items: any[];
  readonly setValue: (value: CustomValueType) => void;
  readonly loading?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly testID?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly dropdownStyle?: StyleProp<ViewStyle>;
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
  readonly iconColor?: string;
  readonly iconSize?: number;

  readonly label?: string;

  readonly errorMessage?: string;

  readonly errorPlace?: "centerRight" | "bottomRight";
}

export const Select = ({
  value,
  items,
  style,
  dropdownStyle,
  testID,
  setValue,
  disabled,
  placeholder,
  loading = false,
  onOpen,
  onClose,
  iconColor,
  iconSize,
  label,
  errorMessage,
  errorPlace,
}: SelectProps) => {
  const commonStyles = useCommonStyles();
  const typographyStyles = useCommonTypographyStyles();

  const dropdownRef = useRef<View & Element>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [zIndex, setZIndex] = useState<number>(1);

  const onValueChange = (_setValue: any) => {
    // eslint-disable-next-line no-shadow
    const _value: ValueType = _setValue();
    if (_value !== value) {
      setValue(_value);
    } else if (_value === value) {
      setValue(-1);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const listener = (event: any) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          onClose ? onClose() : setZIndex(1);
        }
      };
      document.addEventListener("mousedown", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
      };
    }
  }, [dropdownRef, onClose]);

  return (
    <View style={[commonStyles.fieldContainer]}>
      {!!label && (
        <View style={commonStyles.labelView}>
          <Text style={commonStyles.label}>{label}</Text>
        </View>
      )}
      <View style={[commonStyles.input, commonStyles.pickerContainer]}>
        <View
          ref={dropdownRef}
          style={[commonStyles.dropdown, { zIndex }, style]}
        >
          <DropDownPicker
            loading={loading}
            open={isOpen}
            value={value}
            items={items}
            setOpen={setIsOpen}
            setValue={onValueChange}
            ArrowUpIconComponent={() => (
              <Image
                source={require("../../../../../assets/Expand_right.png")}
                style={{
                  height: 24,
                  width: 24,
                }}
              />
            )}
            ArrowDownIconComponent={
              disabled
                ? () => <View />
                : () => (
                    <Image
                      source={require("../../../../../assets/Expand_down.png")}
                      style={{
                        height: 24,
                        width: 24,
                      }}
                    />
                  )
            }
            modalProps={{
              presentationStyle: "pageSheet",
              animationType: "slide",
            }}
            CloseIconComponent={undefined}
            stickyHeader={false}
            style={[commonStyles.dwopdown, dropdownStyle]}
            labelStyle={typographyStyles.selectText}
            textStyle={typographyStyles.selectText}
            placeholderStyle={typographyStyles.selectPlaceholderText}
            dropDownContainerStyle={commonStyles.dropdownContainerStyle}
            listItemContainerStyle={commonStyles.listItemContainerStyle}
            listItemLabelStyle={commonStyles.listItemLabelStyle}
            listMode={Platform.OS === "web" ? "FLATLIST" : "MODAL"}
            placeholder={placeholder}
            testID={testID}
            disabled={disabled}
            multiple={false}
            onOpen={onOpen || (() => setZIndex(7000))}
            onClose={onClose || (() => setZIndex(1))}
          />
        </View>
      </View>
      {!!errorMessage && errorPlace === "centerRight" ? (
        <Typography
          type={TypographyTypes.InputErrorText}
          text={errorMessage}
          style={commonStyles.errorMessage}
        />
      ) : null}

      {errorPlace === "bottomRight" && !!errorMessage && (
        <Typography
          style={
            (commonStyles.underFieldMessage,
            {
              textAlign: "right",
              fontSize: 12,
              width: "100%",
              paddingRight: 14,
            })
          }
          type={TypographyTypes.InputErrorText}
          text={errorMessage}
        />
      )}
    </View>
  );
};
