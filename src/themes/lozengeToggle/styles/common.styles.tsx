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
      padding: 6,
      borderRadius: constants.borderRadius,
      backgroundColor: constants.background,
    },
    listItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    listItemActive: {
      borderRadius: constants.itemBorderRadius,
      backgroundColor: constants.activeBackground,
    },
    textStyle: {
      ...typographyStyles[TypographyTypes.Body2],
    },
    activeTextStyle: {
      ...typographyStyles[TypographyTypes.Body1],
    },
  });
};

export default useStyles;
