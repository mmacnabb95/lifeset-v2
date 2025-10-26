import React from "react";
import { Linking, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography, TypographyTypes } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";
import { Benefit } from "../../../../../types/domain/flat-types";

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
  readonly listItem?: Benefit;
  readonly descriptionLines?: number;
}

export const ResourceViewNavOption = ({
  navigation,
  params,
  destination,
  text,
  showIcon,
  iconPath,
  style,
  subText,
  listItem,
  descriptionLines,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();

  return (
    <Pressable
      testID={`navOption_${destination}`}
      style={[
        {
          borderTopWidth: 1,
          borderTopColor: "rgba(80, 80, 80, 0.15)",
          paddingVertical: 7,
          // borderWidth: 1,
        },
        style,
      ]}
      onPress={() => {
        listItem?.Link ? Linking.openURL(listItem?.Link) : {};
      }}
      key={text.substring(0, 5)}
    >
      <View style={[{ flexBasis: "auto", flexShrink: 1, flexGrow: 0 }]}>
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
        <View style={{ flexBasis: "auto", flexShrink: 1, flexGrow: 0 }}>
          <Typography
            numberOfLines={1}
            ellipsizeMode="tail"
            text={text}
            style={[
              commonStyles.text,
              { fontSize: 14, flexBasis: "auto", flexShrink: 1, flexGrow: 0 },
            ]}
          />

          {!!subText && (
            <View style={commonStyles.categoryView}>
              <Typography
                numberOfLines={descriptionLines || 1000}
                ellipsizeMode="tail"
                text={subText}
                type={TypographyTypes.Body1}
                style={[
                  commonStyles.text,
                  { fontSize: 13, lineHeight: 18, opacity: 0.7 },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};
