import { StyleSheet } from "react-native";

import constants from "src/themes/addNew/constants";

const useStyles = () => {
  return StyleSheet.create({
    title: {},
    pressable: {
      height: constants.height,
      width: constants.width,
      borderRadius: constants.radius,
      marginLeft: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    addNew: {
      alignSelf: "flex-end",
      flexDirection: "row",
      alignItems: "center",
      height: 47,
      // marginBottom: 15,
      // top: 0,
      // position: "absolute",
    },
    disabled: {
      opacity: 0.2,
    },
    disabledPressable: {},
  });
};

export default useStyles;
