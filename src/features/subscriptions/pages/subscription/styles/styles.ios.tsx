import { StyleSheet, useWindowDimensions } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // titleContainer: {
        //   ...commonStyles.titleContainer,
        //   marginBottom: 17,
        // },
      },
    },
  });
};

export default useStyles;
