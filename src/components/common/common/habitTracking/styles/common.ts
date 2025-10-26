import { Dimensions, StyleSheet } from "react-native";
import constants from "src/themes/constants";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      paddingLeft: 20,
      width: "100%",
      // height: 100,
      borderRadius: 12,
      backgroundColor: "white",
    },
    text: {
      color: commonConstants.black900,
      textTransform: "capitalize",
    },
    icon: {
      height: 24,
      width: 24,
      marginRight: 6,
    },
  });
};

export default useStyles;
