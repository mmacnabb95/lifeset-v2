import { StyleSheet, useWindowDimensions } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLargeScreen = windowWidth > commonConstants.avgDeviceSize;

  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        settingsForm: {
          ...commonStyles.settingsForm,
          paddingTop: 0,
        },
        habitEditPage: {
          ...commonStyles.habitEditPage,
          paddingTop: 80,
        },
        habitForm: {
          ...commonStyles.habitForm,
          minHeight: isLargeScreen ? windowHeight : windowHeight - 80,
          // marginBottom: 350, //offset abs buttons
          // position: "absolute",
        },
      },
    },
  });
};
export default useStyles;
