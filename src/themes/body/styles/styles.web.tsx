import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    fullScreenContainer: {
      ...commonStyles.fullScreenContainer,
    },
    body: {
      ...commonStyles.body,
    },
    fullScreenBody: {
      ...commonStyles.fullScreenBody,
    },
    parentSubContainer: {
      ...commonStyles.parentSubContainer,
    },
    centerAligned: {
      ...commonStyles.centerAligned,
    },
  });
};

export default useStyles;
