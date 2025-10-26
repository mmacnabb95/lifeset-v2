import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        exerciseEditPage: {
          ...commonStyles.exerciseEditPage,
          paddingTop: 120,
        },
      },
    },
  });
};
export default useStyles;
