import { StyleSheet } from "react-native";
import constants from "src/themes/constants";

const useStyles = () => {
  return StyleSheet.create({
    doughnutContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    doughnutRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      flexWrap: "wrap",
    },
    circularBackgrond: {
      height: 152,
      width: 152,
      position: "absolute",
      backgroundColor: constants.blue100,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    centeredText: {
      marginBottom: -18,
      marginRight: -7,
    },
    centeredTextNoTitle: {
      marginBottom: 0,
    },
    centerDoughnutFont: {
      textAlign: "center",
      color: "#3C3C3C",
      opacity: 0.7,
      fontSize: 42,
      lineHeight: 36,
    },
    centerDoughnutDescFont: {
      color: "#3C3C3C",
      opacity: 0.7,
    },
    ring: {
      position: "absolute",
      backgroundColor: constants.transparent,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: constants.black,
      opacity: 0.05,
      alignItems: "center",
      justifyContent: "center",
    },
    ring1: {
      height: 120,
      width: 120,
    },
    ring2: {
      height: 96,
      width: 96,
    },
    ring3: {
      height: 72,
      width: 72,
    },
    ring4: {
      height: 52,
      width: 52,
    },
    ring5: {
      height: 32,
      width: 32,
    },
    tickContainer: {
      height: 30,
      width: 30,
      position: "absolute",
      backgroundColor: constants.transparent,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};

export default useStyles;
