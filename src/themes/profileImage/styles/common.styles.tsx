import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      width: windowWidth > commonConstants.mobileBreak ? 200 : 61,
      height: windowWidth > commonConstants.mobileBreak ? 200 : 61,
      borderRadius: windowWidth > commonConstants.mobileBreak ? 200 : 140,
      backgroundColor: commonConstants.white,
      justifyContent: "center",
      alignItems: "center",
      // overflow: "hidden"
    },
    imageContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    imageStyles: {
      position: "relative",
      borderRadius: windowWidth > commonConstants.mobileBreak ? 200 : 140,
      justifyContent: "center",
      alignItems: "center",
    },
    imageUploadButton: {
      backgroundColor: commonConstants.white,
      position: "absolute",
      flexDirection: "row",
      justifyContent: "center",
      zIndex: 2,
      width: 44,
      height: 44,
      borderRadius: 12,
      bottom: -22,
      shadowColor: "rgba(13, 12, 45, 0.08)",
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    loading: {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
  });
};

export default useStyles;
