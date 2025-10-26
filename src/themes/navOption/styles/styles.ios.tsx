import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    icon: {
      ...commonStyles.icon,
    },
    left: {
      ...commonStyles.left,
    },
  });
};

export default useStyles;
