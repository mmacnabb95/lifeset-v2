import { StyleSheet, useWindowDimensions } from "react-native";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLargeScreen = windowWidth > commonConstants.avgDeviceSize;

  return StyleSheet.create({
    container: {
      paddingTop: 80, //header
      marginTop: 30,
      paddingRight: 20,
      paddingLeft: isLargeScreen ? 10 : 20,
      flexGrow: 1,
      flex: 1,
    },
    titleContainer: {
      marginBottom: 25,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttons: {
      marginBottom: 32,
      flexDirection: "row",
    },
    button: {
      width: 92,
      maxHeight: 44,
      minHeight: 44,
      marginRight: 10,
    },
    scrollContainer: {
      flexGrow: 1,
      flexShrink: 0,
      maxWidth: "100%",
    },
  });
};

export default useStyles;
