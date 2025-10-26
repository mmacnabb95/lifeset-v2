import { useWindowDimensions, StyleSheet } from "react-native";

import constants from "src/themes/layout/constants";
import commonConstants from "src/themes/constants";
import { TypographyTypes } from "../../../components/common/typography";

const useTypographyStyles = require("../../typography/styles/styles").default;

const useStyles = () => {
  const typographyStyles = useTypographyStyles();

  const { width: windowWidth } = useWindowDimensions();
  const isBiggerThanMobile = windowWidth > commonConstants.mobileBreak;

  return StyleSheet.create({
    tile: {
      width: "100%",
      maxWidth: isBiggerThanMobile ? "31%" : "47.5%",
      maxHeight: 170,
      alignItems: "center",
      justifyContent: "space-between",
      margin: 0,
      marginBottom: 20,
      backgroundColor: commonConstants.white,
      borderRadius: 16,
      paddingVertical: 10,
      borderWidth: 1,
    },
    tileText: {
      ...typographyStyles[TypographyTypes.Body1],
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    pressable: {
      display: "flex",
      alignItems: "center",
      textAlign: "center",
      height: "100%",
      width: "100%",
      padding: 10,
      justifyContent: "space-between",
    },
    icon: {
      height: constants.iconHeight,
      width: constants.iconWidth,
      marginBottom: 10,
    },
  });
};

export default useStyles;
