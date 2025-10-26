import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    title: {
      ...commonStyles.title,
    },
    pressable: {
      ...commonStyles.pressable,
    },
    addNew: {
      ...commonStyles.addNew,
    },
    disabled: {
      ...commonStyles.disabled,
    },
    disabledPressable: {
      ...commonStyles.disabledPressable,
    },
  });
};

export default useStyles;
