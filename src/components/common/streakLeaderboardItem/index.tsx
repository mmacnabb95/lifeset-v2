import React from "react";
import { Linking, Pressable, View } from "react-native";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Typography, TypographyTypes } from "src/components/common/typography";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Button, ButtonTypes } from "../button";
import constants from "src/themes/resourceEditNavOption/constants";
import {
  Benefit,
  Streakleaderboard,
} from "../../../../../types/domain/flat-types";
import { ProfileImage } from "../profileImage";
import commonConstants from "src/themes/constants";
import { LinkTile } from "../linkTile";

const useCommonStyles =
  require("../../../themes/resourceEditNavOption/styles/styles").default;

interface ResourceEditNavOptionsProps {
  readonly navigation: NavigationProp<any>;
  readonly params?: Record<string, string | number | boolean>;
  readonly style?: Record<string, string | number>;
  // eslint-disable-next-line no-undef
  readonly subText?: string;
  readonly listItem?: Streakleaderboard;
  readonly descriptionLines?: number;
}

export const StreakleaderboardItem = ({
  navigation,
  params,
  destination,
  style,
  listItem,
  descriptionLines,
}: ResourceEditNavOptionsProps) => {
  const commonStyles = useCommonStyles();

  return (
    <View
      testID={`navOption_${destination}`}
      style={[
        {
          borderWidth: 1,
          borderColor: "rgba(80, 80, 80, 0.15)",
          paddingVertical: 0,
          padding: 5,
          borderRadius: 40,
          marginBottom: 8,
          marginTop: 8,
          minHeight: 68,
          justifyContent: "center",
          backgroundColor:
            params?.habitPackId || params?.companyId
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.1)",
        },
        commonConstants.shadowMedium,
        style,
      ]}
      key={listItem?.UserFullName}
    >
      <View
        style={[
          {
            flexBasis: "auto",
            flexDirection: "row",
            flexShrink: 1,
            flexGrow: 0,
          },
        ]}
      >
        <ProfileImage
          imageUrl={listItem?.Url || ""}
          imageMeta={listItem?.Meta || ""}
          resourceLoading={false}
          height={53}
          width={53}
          viewOnly
        />
        <View
          style={{
            flexBasis: "auto",
            flexShrink: 1,
            flexGrow: 0,
            marginLeft: 8,
            justifyContent: "center",
          }}
        >
          <Typography
            numberOfLines={1}
            ellipsizeMode="tail"
            text={`${listItem?.UserFullName}` || ""}
            style={[
              // commonStyles.text,
              {
                fontSize: 14,
                flexBasis: "auto",
                flexShrink: 1,
                flexGrow: 0,
                color: "#353535",
              },
            ]}
          />

          <View style={commonStyles.categoryView}>
            <Typography
              numberOfLines={descriptionLines || 1000}
              ellipsizeMode="tail"
              text={`${listItem?.MaxStreakThisMonth}`}
              type={TypographyTypes.Body1}
              style={[
                { fontSize: 14, opacity: 1, fontWeight: 700, color: "#353535" },
              ]}
            />
            <Typography
              numberOfLines={descriptionLines || 1000}
              ellipsizeMode="tail"
              text={` day streak record`}
              type={TypographyTypes.Body1}
              style={[
                // commonStyles.text,
                { fontSize: 14, opacity: 1, color: "#353535" },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
