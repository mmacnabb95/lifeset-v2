import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    snack: {
      ...commonStyles.snack,
    },
    text: {
      ...commonStyles.text,
    },
    error: {
      ...commonStyles.error,
    },
    ok: {
      ...commonStyles.ok,
    },
  });
};

export default useStyles;
