import { StyleSheet } from "react-native";
import constants from "src/themes/webFadeIn/constants";

const useStyles = () => {
  return StyleSheet.create({
    container: {
      height: "100%",
      width: "100%",
    },
    backgroundImage: {
      height: "100%",
    },
  });
};

export default useStyles;
