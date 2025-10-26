import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    form: {
      width: "100%",
      // maxWidth: 400,
      alignItems: "flex-start",
    },
    buttons: {
      width: "100%",
      flexDirection: "column",
      justifyContent: "flex-end",
      paddingTop: 20,
      paddingBottom: 20,
      // flex: 1,
      bottom: 0,
      backgroundColor: commonConstants.appBackground,
    },
    fieldContainer: {
      width: "100%",
    },
    authFieldContainer: {
      padding: 0,
    },
  });
};

export default useStyles;
