import React from "react";
import { Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography, TypographyTypes } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";

const useCommonStyles =
  require("../../../themes/resourceEditNavOption/styles/styles").default;

interface ResourceEditNavOptionsProps {
  readonly navigation: NavigationProp<any>;
  readonly params?: Record<string, string | number | boolean>;
  readonly destination: string;
  readonly text: string;
  readonly showIcon?: boolean;
  readonly iconPath?: string;
  readonly iconPlaceHolder?: string;
  readonly style?: Record<string, string | number>;
  // eslint-disable-next-line no-undef
  readonly subText?: string;
}

export const ResourceEditNavOption = ({
  navigation,
  params,
  destination,
  text,
  showIcon,
  iconPath,
  style,
  subText,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();

  return (
    <Pressable
      testID={`navOption_${destination}`}
      style={[commonStyles.container, style]}
      onPress={() => navigation.navigate(destination, params)}
      key={text.substring(0, 5)}
    >
      <View style={[commonStyles.row]}>
        {!!showIcon && (
          <>
            {!!iconPath && (
              <IkImageViewer
                style={commonStyles.thumbnail}
                imagePath={iconPath}
                // height={constants.thumbnailHeight}
                width={constants.thumbnailWidth}
                transform
              />
            )}
          </>
        )}
        <View
          style={[
            commonStyles.textContainer,
            !!showIcon && iconPath ? {} : commonStyles.textContainerPadding,
          ]}
        >
          <Typography
            numberOfLines={1}
            ellipsizeMode="tail"
            text={text}
            style={[commonStyles.text, { fontSize: 14 }]}
          />

          {!!subText && (
            <View style={commonStyles.categoryView}>
              <Typography
                numberOfLines={2}
                ellipsizeMode="tail"
                text={subText}
                type={TypographyTypes.Body1}
                style={[commonStyles.text, { fontSize: 13, opacity: 0.7 }]}
              />
            </View>
          )}
        </View>
      </View>
      <Button
        icon={"chevron-right"}
        type={ButtonTypes.IconButton}
        iconColor={constants.icon}
        onPress={() => navigation.navigate(destination, params)}
        style={commonStyles.icon}
      />
    </Pressable>
  );
};
