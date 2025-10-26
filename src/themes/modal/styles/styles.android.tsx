import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
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
