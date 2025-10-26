import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    toggle: {
      ...commonStyles.toggle,
    },
    label: {
      ...commonStyles.label,
    },
  });
};

export default useStyles;
