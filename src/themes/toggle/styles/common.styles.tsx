import { Dimensions, StyleSheet } from "react-native";

import constants from "src/themes/select/constants";

const useStyles = () => {
  return StyleSheet.create({
    toggle: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      maxWidth: constants.maxWidth,
      height: 40,
      paddingLeft: 15,
    },
    label: {
      marginRight: 10,
    },
  });
};

export default useStyles;
