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
        formCover: {
          ...commonStyles.formCover,
          height: 170,
        },
        toggleContainer: {
          ...commonStyles.toggleContainer,
          width: 80,
        },
      },
    },
  });
};

export default useStyles;
