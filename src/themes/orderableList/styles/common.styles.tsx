import { StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  return StyleSheet.create({
    rowItem: {
      flex: 1,
      flexDirection: "row",
      marginVertical: 10,
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 1,
    },
    text: {
      color: commonConstants.white,
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "center",
      lineHeight: 21,
    },
    iconButton: {
      flexDirection: "row",
      alignItems: "center",
      height: "100%",
      minWidth: 30,
      textAlign: "center",
    },
    icon: {
      color: commonConstants.primaryColor,
    },
    textStyles: {
      flex: 1,
      backgroundColor: commonConstants.white,
      borderRadius: 12,
      marginHorizontal: 4,
      padding: 10,
    },
    buttonIconStyle: {
      paddingRight: 0,
    },
  });
};

export default useStyles;
