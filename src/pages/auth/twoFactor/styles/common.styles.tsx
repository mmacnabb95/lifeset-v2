import { StyleSheet } from "react-native";

const useStyles = () => {
  return StyleSheet.create({
    titleStyle: {
      marginTop: 20,
    },
    changeEmailForm: {
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      // backgroundColor: "#FFFFFF",
    },
  });
};

export default useStyles;
