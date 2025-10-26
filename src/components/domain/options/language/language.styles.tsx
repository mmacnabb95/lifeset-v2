import { Platform, StyleSheet } from "react-native";

const iosPicker = () => {
  if (Platform.OS === "ios") {
    return {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }
  return {
    borderWidth: 0,
  };
};

const pickerPaddingVertical = () => {
  if (Platform.OS === "ios") {
    return 0;
  }
  if (Platform.OS === "android") {
    return 0;
  }
  if (Platform.OS === "web") {
    return 0;
  }
};

const styles = StyleSheet.create({
  label: {},
  pickerContainer: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingVertical: pickerPaddingVertical(),
    justifyContent: "center",
  },
  picker: iosPicker(),
});

export default styles;
