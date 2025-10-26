import { Dimensions, StyleSheet } from "react-native";

import constants from "src/themes/select/constants";
import commonConstants from "src/themes/constants";

const useInputStyles = require("../../input/styles/styles").default;

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
  const inputStyles = useInputStyles();

  return StyleSheet.create({
    fieldContainer: {
      ...inputStyles.fieldContainer,
      zIndex: constants.zIndex,
      paddingHorizontal: 0,
    },
    labelView: {
      ...inputStyles.labelView,
    },
    label: {
      ...inputStyles.label,
    },
    input: {
      ...inputStyles.input,
      paddingRight: 0,
      paddingLeft: 0,
      justifyContent: "center",
      borderRadius: constants.radius,
      borderWidth: constants.borderWidth,
      borderColor: constants.dropdownBorderColor,
      backgroundColor: constants.dropdownBackgroundColor,
    },
    underFieldMessage: {
      ...inputStyles.underFieldMessage,
    },
    errorMessage: {
      ...inputStyles.errorMessage,
    },

    dwopdown: {
      borderWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },
    dropdown: {
      minWidth: 100,
      // borderWidth: 0,
    },

    dropdownContainerStyle: {
      borderWidth: constants.borderWidth,
      borderColor: constants.dropdownBorderColor,
      backgroundColor: constants.dropdownBackgroundColor,
      paddingHorizontal: 10,
      zIndex: 1000,
      elevation: 1000,
    },
    listItemContainerStyle: {
      flexDirection: "row",
      minHeight: 20,
    },
    listItemLabelStyle: {
      flex: 0,
      flexBasis: "auto",
      flexDirection: "row",
      marginRight: 10,
      paddingTop: 2,
    },
    pickerContainer: {
      // borderWidth: 0,
    },
  });
};

export default useStyles;
