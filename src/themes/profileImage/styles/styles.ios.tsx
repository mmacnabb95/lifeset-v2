import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    imageContainer: {
      ...commonStyles.imageContainer,
    },
    imageStyles: {
      ...commonStyles.imageStyles,
    },
    imageUploadButton: {
      ...commonStyles.imageUploadButton,
    },
    loading: {
      ...commonStyles.loading,
    },
  });
};

export default useStyles;
