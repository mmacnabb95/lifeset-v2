import { Platform, StyleSheet } from "react-native";
import { usePlayerDimensions } from "./usePlayerDimensions";

const useStyles = () => {
  const { playerHeight, playerWidth } = usePlayerDimensions();
  return StyleSheet.create({
    containerFullScreen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: 100,
    },
    container: {
      flex: 1,
      flexShrink: 1,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "rgb(0,0,0,0)",
      width: playerWidth,
      maxWidth: "100%",
      marginBottom: 19,
      // borderRadius: 12,
      // overflow: "hidden",
      height: playerHeight,
      maxHeight: playerHeight,
    },
    portraitView: {
      paddingTop: Platform.OS === "ios" ? 30 : 0,
      paddingBottom: Platform.OS === "ios" ? 30 : 0,
      backgroundColor: "black",
      width: "100%",
      // height: "100%",
      //transform: [{ rotate: "90deg" }],
    },
    video: {
      alignSelf: "center",
      // maxWidth: 400,
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
  });
};

export default useStyles;
