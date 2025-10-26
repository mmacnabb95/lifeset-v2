import { StyleSheet } from "react-native";

import constants from "src/themes/snackbar/constants";

const useStyles = () => {
  return StyleSheet.create({
    snack: {
      position: "absolute",
      bottom: 30,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      padding: 0,
    },
    text: {
      paddingTop: 0,
    },
    error: {
      backgroundColor: constants.error,
    },
    ok: {
      backgroundColor: constants.success,
    },
  });
};

export default useStyles;
