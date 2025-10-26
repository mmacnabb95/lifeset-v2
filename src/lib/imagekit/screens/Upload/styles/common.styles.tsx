import { StyleSheet } from "react-native";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import { useSelector } from "react-redux";

const useStyles = () => {
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
    },
    scrollViewContainer: {
      width: "100%",
    },
    inputContainer: {
      width: "100%",
      height: videoFullScreen ? "100%" : undefined,
    },
    buttonCssProps: {
      width: 150,
    },
    captionView: {
      marginTop: 10,
    },
    uploader: {
      backgroundColor: "rgba(255,255,255,0)",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      minHeight: 80,
    },
    Hero: {},
    Icon: {
      maxWidth: 100,
      maxHeight: 100,
    },
    uploadInputContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      flex: 1,
      minHeight: 80,
    },
    uploadButton: {
      height: "auto",
    },
    imageContainer: {
      marginVertical: 10,
    },
    editButton: {
      width: 40,
      height: 40,
      minHeight: 40,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.5)",
      backgroundColor: "rgba(255,255,255, 0.9)",
      marginRight: 10,
    },
    deleteButton: {
      width: 40,
      height: 40,
      minHeight: 40,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.5)",
      backgroundColor: "rgba(255,255,255, 0.9)",
    },
  });
};

export default useStyles;
