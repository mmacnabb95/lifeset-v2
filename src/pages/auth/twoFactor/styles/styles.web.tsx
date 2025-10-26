import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    titleStyle: {
      ...commonStyles.titleStyle,
    },
    changeEmailForm: {
      ...commonStyles.changeEmailForm,
    },
  });
};

export default useStyles;
