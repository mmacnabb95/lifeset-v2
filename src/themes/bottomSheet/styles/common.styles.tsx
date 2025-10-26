import { Dimensions, StyleSheet } from "react-native";

const useStyles = () => {
  return StyleSheet.create({
    container: {
      width: "100%",
      justifyContent: "center",
    },
    contentContainer: {
      width: "100%",
      alignItems: "center",
      padding: 24,
    },
  });
};

export default useStyles;
