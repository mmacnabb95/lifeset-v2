import { StyleSheet } from "react-native";

import constants from "src/themes/radioButton/constants";

const useStyles = () => {
  return StyleSheet.create({
    checkboxes: {
      paddingVertical: 10,
      maxWidth: constants.maxWidth,
      minWidth: constants.minWidth,
    },
    checkbox: {
      paddingVertical: 6,
    },
    checkboxBorder: {
      borderColor: constants.unCheckedColor,
    },
    checkboxCheckedBorder: {
      borderColor: constants.checkedColor,
    },
    textStyle: {
      color: constants.text,
    },
    textChecked: {
      color: constants.checkedColor,
    },
  });
};

export default useStyles;
