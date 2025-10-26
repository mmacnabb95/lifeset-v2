import { StyleSheet } from "react-native";
import useCommonStyles from "./common";
import commonConstants from "src/themes/constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        toggleContainer: {
          ...commonStyles.toggleContainer,
          width: 80,
        },
        formCover: {
          ...commonStyles.formCover,
          height: 170,
        },
      },
    },
  });
};

export default useStyles;
