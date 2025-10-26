import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // centeredText: {
        //   ...commonStyles.centeredText,
        //   marginBottom: -17,
        // },
      },
    },
  });
};

export default useStyles;
