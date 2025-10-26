import { Dimensions, StyleSheet } from "react-native";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  const getFormWidth = () => {
    if (windowWidth > commonConstants.mobileBreak) {
      const max = commonConstants.maxPageWidth;
      return windowWidth - 320 - 70 > max ? max : windowWidth - 320 - 70;
    } else {
      return windowWidth - 40;
    }
  };

  const formWidth = getFormWidth();
  const playerHeight = (formWidth / 16) * 9;
  const playerWidth = formWidth;

  return StyleSheet.create({
    centeredView: {
      justifyContent: "center",
      alignItems: "center",
      minWidth: playerWidth,
      minHeight: playerHeight,
    },
    modalView: {
      backgroundColor: "white",
      alignItems: "center",
      elevation: 5,
      width: "100%",
      height: "100%",
    },
  });
};

export default useStyles;
