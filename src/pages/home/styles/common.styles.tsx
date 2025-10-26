import { StyleSheet, useWindowDimensions } from "react-native";

const useStyles = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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
    appName: {
      marginTop: 30,
    },
    homeText: {
      marginTop: 10,
      marginBottom: 40,
    },
    splash: {
      position: "absolute",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    imageContainer: {
      position: "absolute",
      marginTop: 0,
      marginBottom: 0,
      width: windowWidth / 2,
      maxWidth: windowHeight * 0.65,
      minWidth: 300,
      height: windowWidth / 2,
      maxHeight: windowHeight * 0.65,
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
    },
    absoluteButton: {
      position: "absolute",
      bottom: 30,
      marginBottom: 0,
      backgroundColor: "#4e8fea",
      borderColor: "#4e8fea",
      maxWidth: windowWidth - 40,
    },
  });
};

export default useStyles;
