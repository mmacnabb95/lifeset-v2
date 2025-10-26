import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const windowWidth = Dimensions.get("window").width;
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // toggleContainer: {
        //   ...commonStyles.toggleContainer,
        //   width: 50,
        // },
      },
    },
  });
};

export default useStyles;
