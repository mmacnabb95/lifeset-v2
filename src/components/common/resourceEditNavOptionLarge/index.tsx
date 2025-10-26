import React from "react";
import { Linking, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography, TypographyTypes } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";
import { Benefit } from "../../../../../types/domain/flat-types";

const useCommonStyles = require("./styles/styles").default;

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
  readonly listItem: Benefit;
}

export const ResourceEditNavOptionLarge = ({
  navigation,
  params,
  destination,
  text,
  showIcon,
  iconPath,
  style,
  subText,
  listItem,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();

  return (
    <Pressable
      testID={`navOption_${destination}`}
      style={({ pressed }) => [
        commonStyles.container,
        pressed ? { backgroundColor: "rgba(255,255,255,0.8)" } : {},
      ]}
      onPress={() => {
        listItem?.Link ? Linking.openURL(listItem?.Link) : {};
      }}
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
          <View style={commonStyles.categoryView}>
            <Typography
              numberOfLines={2000}
              ellipsizeMode="tail"
              text={listItem?.Description || ""}
              type={TypographyTypes.Body1}
              style={[commonStyles.text, { fontSize: 13, opacity: 1 }]}
            />
          </View>
        </View>
      </View>
      <Button
        icon={"chevron-right"}
        type={ButtonTypes.IconButton}
        iconColor={constants.icon}
        onPress={() => {
          listItem?.Link ? Linking.openURL(listItem?.Link) : {};
        }}
        style={commonStyles.icon}
      />
    </Pressable>
  );
};
