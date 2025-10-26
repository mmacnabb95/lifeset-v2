import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";
import constants from "../constants";
import { TypographyTypes } from "src/components/common/typography";

const useTypographyStyles = require("../../typography/styles/styles").default;

const useStyles = () => {
  const typographyStyles = useTypographyStyles();

  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      backgroundColor: constants.backgroundColor,
      maxWidth: constants.maxWidth,
      borderRadius: constants.radius,
      borderWidth: 0,
      borderColor: constants.borderColor,
    },

    fieldContainer: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems:
        windowWidth > commonConstants.mobileBreak ? "flex-start" : "center",
      width: "100%",
      backgroundColor: commonConstants.transparent,
      borderRadius: constants.radius,
      marginVertical: 10,
      minHeight: constants.minHeight,
      paddingHorizontal: 0,
    },

    authFieldContainer: {
      paddingHorizontal: 0,
    },

    labelView: {
      width: "100%",
      alignSelf: "flex-start",
      marginTop: 10,
      marginBottom: 4,
    },

    label: {
      ...typographyStyles[TypographyTypes.InputLabel],
      paddingHorizontal: constants.labelPaddingHorizontal,
    },

    input: {
      ...typographyStyles[TypographyTypes.Input],
      width: "100%",
      borderWidth: 0,
      borderRadius: constants.radius,
      backgroundColor: "transparent",
      minHeight: constants.minHeight,
      paddingHorizontal: constants.inputPaddingHorizontal,
    },

    inputCover: {
      top: 0,
      right: 0,
      position: "absolute",
      height: 50,
      width: "100%",
      backgroundColor: "rgba(0, 0, 0, 0)",
      zIndex: 1,
    },

    inputCoverContainer: {
      zIndex: 1,
      width: "100%",
      height: 60,
      top: -61,
      marginBottom: -60,
    },

    underFieldMessage: {
      position: "absolute",
      bottom: -22,
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      zIndex: -1,
      fontSize: 12,
      marginRight: 24,
    },

    inputMultiLine: {
      paddingTop: 11,
      minHeight: 90,
      height: 90,
    },

    errorMessage: {
      ...typographyStyles[TypographyTypes.InputErrorText],
      paddingHorizontal: constants.errorPaddingHorizontal,
      marginBottom: 6,
      justifyContent: "flex-end", //not working android
      textAlign: "right", //android ok
      display: "flex",
      fontSize: 12,
      position: "absolute",
      zIndex: 100,
      backgroundColor: commonConstants.transparent,
      width: "auto",
      maxWidth: 400,
      right: 0,
      top: 10,
    },

    phoneInputContainer: {
      marginTop: 30,
      marginBottom: 30,
    },

    inputAccessory: {
      flexDirection: "row",
      paddingHorizontal: 10,
      paddingVertical: 10,
      justifyContent: "flex-end",
      borderTopColor: "#e4e4e4",
      borderTopWidth: 1,
    },

    codeInput: {
      width: 44,
      height: 60,
      marginRight: 14,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#DCD1D1",
      fontSize: 30,
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 38,
    },

    code: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      marginBottom: 30,
    },
  });
};

export default useStyles;
