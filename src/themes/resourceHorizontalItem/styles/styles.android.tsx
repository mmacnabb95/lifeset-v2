import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    row: {
      ...commonStyles.row,
    },
    title: {
      ...commonStyles.title,
    },
    label: {
      ...commonStyles.label,
    },
    text: {
      ...commonStyles.text,
    },
    thumbnail: {
      ...commonStyles.thumbnail,
    },
    categoryView: {
      ...commonStyles.categoryView,
    },
    left: {
      ...commonStyles.left,
    },
    buttonContainer: {
      ...commonStyles.buttonContainer,
    },
    line: {
      ...commonStyles.line,
    },
  });
};

export default useStyles;
