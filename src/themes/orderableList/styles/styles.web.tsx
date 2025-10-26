import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    rowItem: {
      ...commonStyles.rowItem,
    },
    text: {
      ...commonStyles.text,
    },
    iconButton: {
      ...commonStyles.iconButton,
    },
    icon: {
      ...commonStyles.icon,
    },
    textStyles: {
      ...commonStyles.textStyles,
    },
    buttonIconStyle: {
      ...commonStyles.buttonIconStyle,
    },
  });
};

export default useStyles;
