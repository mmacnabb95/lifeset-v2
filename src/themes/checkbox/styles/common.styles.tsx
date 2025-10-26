import { StyleSheet } from "react-native";

import constants from "src/themes/checkbox/constants";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  return StyleSheet.create({
    container: {
      paddingVertical: 10,
      maxWidth:
        commonConstants.maxPageWidth > commonConstants.mobileBreak
          ? commonConstants.maxPageWidth
          : undefined,
      minWidth: 100,
      width: "100%",
    },
    checkboxContainer: {
      paddingVertical: 6,
    },
    checkboxBorder: {
      borderColor: constants.primaryColor,
      alignItems: "flex-start",
    },
    checkboxCheckedBorder: {
      borderColor: "#EEF1F5",
      alignItems: "flex-start",
    },
    textStyle: {
      color: constants.textColor,
    },
    textChecked: {
      color: constants.checkedTextColor,
    },
  });
};

export default useStyles;
