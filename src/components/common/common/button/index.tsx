import {
  TouchableOpacity,
  View,
  TouchableOpacityProps,
  GestureResponderEvent,
  Platform,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Typography, TypographyTypes } from "../typography";
import { IconTypes } from "src/components/common/icon";
import Icon from "src/components/common/icon";

import buttonConstants from "src/themes/button/constants";
import { isArray } from "lodash";
import * as Haptics from "expo-haptics";

const useCommonStyles =
  require("../../../../themes/button/styles/styles").default;

export enum PositionTypes {
  Left = "left",
  Right = "right",
  Center = "center",
}

export enum ButtonTypes {
  Primary = "primary",
  Secondary = "secondary",
  Danger = "danger",
  IconButton = "iconButton",

  LinkButton = "linkButton",

  BackButton = "backButton",

  ImageUploadButton = "imageUploadButton",

  Delete = "delete",
}

const ButtonTypographyThemeMap: {
  [key in ButtonTypes]: TypographyTypes;
} = {
  [ButtonTypes.Primary]: TypographyTypes.ButtonTextPrimary,
  [ButtonTypes.Secondary]: TypographyTypes.ButtonTextSecondary,
  [ButtonTypes.Danger]: TypographyTypes.ButtonTextError,
  [ButtonTypes.IconButton]: TypographyTypes.Default,
  [ButtonTypes.LinkButton]: TypographyTypes.Link,
  [ButtonTypes.BackButton]: TypographyTypes.Default,
  [ButtonTypes.ImageUploadButton]: TypographyTypes.ButtonTextPrimary,
  [ButtonTypes.Delete]: TypographyTypes.Default,
};

type Style = Record<string, string | number>;

export interface ButtonProps {
  readonly onPress: () => void;
  readonly title?: string;
  readonly type?: ButtonTypes;
  readonly testID?: string;
  readonly titleStyle?: Record<string, string | number>;
  readonly style?: Style | Style[];
  readonly children?: React.ReactNode;
  readonly icon?: IconTypes;
  readonly withOpacity?: boolean;
  readonly position?: PositionTypes;
  readonly iconColor?: string;
  readonly iconContainerStyle?: Record<string, string | number>;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly iconSize?: number;
}

export const Button = ({
  testID,
  children,
  onPress,
  style,
  type = ButtonTypes.Primary,
  titleStyle,
  title,
  withOpacity,
  position = PositionTypes.Center,
  icon,
  iconColor = buttonConstants.iconDefaultColor,
  iconContainerStyle,
  iconSize,
  disabled,
  loading,
}: ButtonProps & TouchableOpacityProps) => {
  const commonStyles = useCommonStyles();

  const Body =
    !children && (title || icon) ? (
      <View style={[commonStyles.body, commonStyles[position]]}>
        {icon && !title && (
          <View style={[commonStyles.icon, iconContainerStyle]}>
            <Icon
              iconSize={iconSize || 24}
              iconType={icon}
              iconColor={iconColor}
            />
          </View>
        )}
        {title && !icon && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              text={title}
              style={titleStyle}
              type={ButtonTypographyThemeMap[type ?? ButtonTypes.Primary]}
            />
            {loading && (
              <View
                style={{
                  flex: 1,
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  right: -35,
                }}
              >
                <ActivityIndicator
                  size={"small"}
                  color={
                    (titleStyle?.color as string) ||
                    commonStyles[type].color ||
                    "white"
                  }
                />
              </View>
            )}
          </View>
        )}
        {title && icon && (
          <>
            <View
              style={[
                commonStyles.icon,
                { marginRight: 6 },
                iconContainerStyle,
              ]}
            >
              <Icon
                iconSize={iconSize || 24}
                iconType={icon}
                iconColor={iconColor}
              />
            </View>
            <Typography
              text={title}
              style={[titleStyle, { paddingRight: 6 }]}
              type={ButtonTypographyThemeMap[type ?? ButtonTypes.Primary]}
            />
          </>
        )}
      </View>
    ) : (
      children
    );

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        commonStyles.button,
        commonStyles[position],
        type && commonStyles[type],
        ...(isArray(style) ? style : [style]),
        disabled ? { opacity: 0.5 } : {},
      ]}
      onPress={
        !disabled
          ? (event: GestureResponderEvent) => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onPress(event);
            }
          : undefined
      }
      testID={testID}
      activeOpacity={withOpacity ? 0.5 : 1}
    >
      {Body}
    </TouchableOpacity>
  );
};
