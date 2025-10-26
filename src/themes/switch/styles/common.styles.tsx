import { StyleSheet } from "react-native";

import constants from "../constants";
import { TypographyTypes } from "../../../components/common/typography";

const useTypographyStyles = require("../../typography/styles/styles").default;

const useStyles = () => {
  const typographyStyles = useTypographyStyles();

  return StyleSheet.create({
    list: {
      flexDirection: "row",
      alignItems: "center",
      margin: "auto",
      borderRadius: constants.borderRadius,
      backgroundColor: constants.background,
      ...constants.shadow,
    },
    listItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    listItemDivider: {
      backgroundColor: constants.dividerColor,
      width: 1,
      height: "100%",
    },
    listItemActive: {
      backgroundColor: constants.activeBackground,
    },
    textStyle: {
      ...typographyStyles[TypographyTypes.Body2],
      fontFamily: constants.activeItemFont,
    },
    activeTextStyle: {
      ...typographyStyles[TypographyTypes.Body1],
      fontFamily: constants.itemFont,
    },
  });
};

export default useStyles;
