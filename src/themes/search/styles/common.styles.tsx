import { StyleSheet } from "react-native";

const useStyles = () => {
  return StyleSheet.create({
    inputContainer: {
      width: "100%",
      padding: 0,
      paddingHorizontal: 0,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      borderWidth: 1,
    },
    searchInput: {
      paddingHorizontal: 0,
    },
  });
};

export default useStyles;
