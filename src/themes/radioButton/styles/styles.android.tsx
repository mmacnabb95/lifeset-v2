import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    checkboxes: {
      ...commonStyles.checkboxes,
    },
    checkbox: {
      ...commonStyles.checkbox,
    },
    checkboxBorder: {
      ...commonStyles.checkboxBorder,
    },
    checkboxCheckedBorder: {
      ...commonStyles.checkboxCheckedBorder,
    },
    textStyle: {
      ...commonStyles.textStyle,
    },
    textChecked: {
      ...commonStyles.textChecked,
    },
  });
};

export default useStyles;
