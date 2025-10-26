import React from "react";
import { Pressable, View } from "react-native";
import { IconTypes } from "src/components/common/icon";
import Icon from "src/components/common/icon";
import { Typography, TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/navOption/constants";
import { NavigationProp } from "@react-navigation/core/src/types";
import { useNavigation, useRoute } from "@react-navigation/native";

const useCommonStyles =
  require("../../../themes/navOption/styles/styles").default;

type Style = Record<string, string | number>;

interface NavOptionProps {
  readonly params?: Record<string, string | number | boolean>;
  readonly destination: string;
  readonly text: string;
  readonly icon?: IconTypes;
  readonly style?: Style;
  readonly beforeNav?: () => void;
  readonly disabled?: boolean;
  onPressOverride?: () => void;
}

export const NavOption = ({
  params,
  destination,
  icon,
  text,
  style,
  beforeNav,
  disabled,
  onPressOverride
  
}: NavOptionProps) => {
  const commonStyles = useCommonStyles();
  const navigation = useNavigation();
  const route = useRoute();

  const allParams = { ...params, ...route.params };

  return (
    <Pressable
      testID={`navOption_${destination}`}
      style={[commonStyles.container, disabled ? { opacity: 0.5 } : {}, style]}
      onPress={async () => {
        if (onPressOverride) {
          await onPressOverride();
          return;
        }
        if (disabled) {
          return;
        }
        if (beforeNav) {
          beforeNav();
        }
        navigation.navigate(destination, allParams);

      }}
    >
      <View style={commonStyles.left}>
        {icon && (
          <View style={commonStyles.icon}>
            <Icon iconType={icon} iconSize={20} iconColor={constants.icon} />
          </View>
        )}
        <Typography type={TypographyTypes.Body1} text={text} />
      </View>
      <Icon iconSize={20} iconType="chevron-right" iconColor={constants.icon} />
    </Pressable>
  );
};
