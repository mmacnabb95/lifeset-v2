import React from "react";
import { Image, Pressable, View } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { Typography, TypographyTypes } from "../typography";

const useCommonStyles =
  require("../../../themes/linkTile/styles/styles").default;

interface LinkTileProps {
  title: string;
  iconSrc?: string;
  navigation: NavigationProp<any>;
  destinationScreen: string;
  params?: Record<string, string | number>;
  testID?: string;
}
export const LinkTile = ({
  title,
  iconSrc,
  navigation,
  destinationScreen,
  params = {},
  testID,
}: LinkTileProps) => {
  const commonStyles = useCommonStyles();

  return (
    <View style={commonStyles.tile}>
      <Pressable
        testID={testID}
        style={commonStyles.pressable}
        onPress={() => {
          navigation.navigate("Main", { screen: destinationScreen, params });
        }}
      >
        <Image
          style={commonStyles.icon}
          source={iconSrc || require("../../../../assets/folder.png")}
        />
        <Typography
          type={TypographyTypes.Body1}
          style={commonStyles.tileText}
          text={title}
        />
      </Pressable>
    </View>
  );
};
