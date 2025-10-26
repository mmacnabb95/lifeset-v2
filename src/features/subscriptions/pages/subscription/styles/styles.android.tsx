import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        container: {
          ...commonStyles.container,
          paddingBottom: 10,
          // paddingTop: 0,
        },
      },
    },
  });
};

export default useStyles;
