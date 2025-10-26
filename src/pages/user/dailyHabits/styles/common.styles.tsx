import { StyleSheet } from "react-native";
import constants from "src/themes/constants";

const useStyles = () => {
  return StyleSheet.create({
    home: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      width: "100%",
      maxWidth: 400,
      padding: 20,
    },
    title: {
      color: constants.white,
    },
    homeText: {
      marginTop: 10,
      marginBottom: 40,
    },
    imageContainer: {
      marginTop: 20,
      marginBottom: 15,
    },
  });
};

export default useStyles;
