import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";
import constants from "src/themes/modal/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    body: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
      // width: windowWidth > commonConstants.mobileBreak ? 502 : "90%",
      margin: 30,
      backgroundColor: constants.white,
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
    },
    title: {
      marginBottom: 10,
    },
    text: {
      textAlign: "center",
      marginBottom: 40,
    },
    modalButton: {
      width: "100%",
      marginVertical: 5,
    },
  });
};

export default useStyles;
