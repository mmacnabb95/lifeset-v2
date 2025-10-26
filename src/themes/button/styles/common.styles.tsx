import { Dimensions, StyleSheet } from "react-native";

import { ButtonTypes } from "../../../components/common/button";
import constants from "src/themes/button/constants";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
  return StyleSheet.create({
    button: {
      borderRadius: constants.radius,
      paddingHorizontal: constants.paddingHorizontal,
      borderWidth: constants.borderWidth,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      minHeight: constants.minHeight,
      maxWidth: constants.maxWidth,
    },

    flex: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    body: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 2,
      minHeight: constants.minHeight,
    },

    left: {
      justifyContent: "flex-start",
      textAlign: "left",
    },

    disabled: {
      opacity: 0.5,
    },

    center: { justifyContent: "center", textAlign: "center" },

    right: { justifyContent: "flex-end", textAlign: "right" },

    [ButtonTypes.Primary]: {
      backgroundColor: constants.primaryColor,
      borderColor: constants.primaryColor,
    },

    [ButtonTypes.Delete]: {
      marginTop: 12,
      backgroundColor: commonConstants.appBackground,
    },

    [ButtonTypes.Secondary]: {
      backgroundColor: constants.secondaryColor,
      borderColor: constants.primaryColor,
    },

    [ButtonTypes.Danger]: {
      backgroundColor: constants.error,
      borderColor: constants.error,
    },

    [ButtonTypes.IconButton]: {
      backgroundColor: constants.transparent,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    [ButtonTypes.BackButton]: {
      maxWidth: windowWidth > commonConstants.mobileBreak ? 96 : 40,
      borderWidth: 0,
      backgroundColor: "#ffffff",
      zIndex: 1,
      ...commonConstants.shadowSmall,
    },
    [ButtonTypes.ImageUploadButton]: {
      backgroundColor: commonConstants.white,
      position: "absolute",
      flexDirection: "row",
      justifyContent: "center",
      zIndex: 2,
      width: 44,
      height: 44,
      borderRadius: 12,
      bottom: -22,
      ...commonConstants.shadowSmall,
    },
    [ButtonTypes.LinkButton]: {
      borderWidth: 0,
    },
  });
};

export default useStyles;
