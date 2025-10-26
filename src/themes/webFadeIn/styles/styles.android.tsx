import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    backgroundImage: {
      ...commonStyles.backgroundImage,
    },
  });
};

export default useStyles;
