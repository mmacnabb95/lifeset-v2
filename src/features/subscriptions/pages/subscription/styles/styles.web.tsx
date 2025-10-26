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
          marginVertical: 10,
        },
        drawerContentsAlignment: {
          ...commonStyles.drawerContentsAlignment,
          marginTop: -45,
        },
      },
    },
  });
};

export default useStyles;
