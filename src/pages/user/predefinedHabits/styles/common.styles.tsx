import { StyleSheet } from "react-native";
import constants from "src/themes/constants";

const useStyles = () => {
  return StyleSheet.create({
    container: {
      height: "100%",
      flexGrow: 1,
    },
    title: {
      color: constants.primaryColor,
    },
    predfeinedHabitTypeContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    predefinedTiles: {
      flexGrow: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 18,
    },
    tile: {
      height: 56,
      width: "48%",
      borderRadius: 12,
      backgroundColor: constants.white,
      marginBottom: "4%",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 15,
    },
    habitIcon: {
      height: 44,
      width: 44,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: constants.primaryColor,
      opacity: 0.5,
      marginBottom: 10,
    },
    habitText: {
      maxWidth: 132,

    },
  });
};

export default useStyles;
