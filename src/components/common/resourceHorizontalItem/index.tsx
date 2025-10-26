import React from "react";
import { Pressable, View } from "react-native";
import { setRouteName } from "src/redux/features/misc/slice";
import { useDispatch } from "react-redux";
import { NavigationProp } from "@react-navigation/native";
import { Typography, TypographyTypes } from "../typography";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";

import constants from "src/themes/resourceHorizontalItem/constants";
import { Button, ButtonTypes } from "../button";

const useCommonStyles =
  require("../../../themes/resourceHorizontalItem/styles/styles").default;

interface ResourceViewNavOptionProps {
  readonly navigation: NavigationProp<any>;

  readonly params?: Record<string, string | number | boolean>;
  readonly destination: string;
  readonly text: string;
  readonly iconPath?: string;
  readonly showIcon?: boolean;
  // eslint-disable-next-line no-undef
  readonly subText?: string | JSX.Element;

  readonly label?: string | JSX.Element;

  readonly style?: Record<string, string | number>;

  readonly handleDrawerOpen?: () => void;
}

export const ResourceHorizontalItem = ({
  navigation,
  params,
  destination,
  text,
  iconPath,
  showIcon,
  subText,
  style,
  label,
  handleDrawerOpen,
}: ResourceViewNavOptionProps) => {
  const dispatch = useDispatch();
  const commonStyles = useCommonStyles();

  return (
    <Pressable
      testID={`navOption_${destination}`}
      style={[commonStyles.container, style]}
      onPress={() => {
        if (handleDrawerOpen) {
          handleDrawerOpen();
          navigation.setParams(params);
          return;
        }

        dispatch(setRouteName(destination));
        navigation.navigate(destination, params);
      }}
    >
      <View style={commonStyles.row}>
        <View style={commonStyles.left}>
          <View style={commonStyles.thumbnailContainer} testID="thumb">
            {showIcon && (
              <>
                {iconPath ? (
                  <IkImageViewer
                    style={commonStyles.thumbnail}
                    imagePath={iconPath}
                    height={constants.thumbnailHeight}
                    width={constants.thumbnailWidth}
                    transform
                  />
                ) : (
                  <View style={[commonStyles.thumbnail]} />
                )}
              </>
            )}
          </View>

          <Typography
            type={TypographyTypes.Link}
            style={commonStyles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={text}
          />

          <View style={commonStyles.line} />

          {subText && (
            <View style={commonStyles.categoryView}>
              <>
                {subText}
                <View style={commonStyles.line} />
              </>
            </View>
          )}
          {label && (
            <View style={commonStyles.label}>
              <>
                {label}
                <View style={commonStyles.line} />
              </>
            </View>
          )}
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            icon={"book-outline"}
            title={"Add to basket"}
            type={ButtonTypes.Primary}
            iconColor={constants.icon}
            onPress={() => {}}
          />
        </View>
      </View>
    </Pressable>
  );
};
