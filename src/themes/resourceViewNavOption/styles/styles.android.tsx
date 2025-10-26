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
    textContainer: {
      ...commonStyles.textContainer,
    },
    textContainerPadding: {
      ...commonStyles.textContainerPadding,
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
  });
};

export default useStyles;
