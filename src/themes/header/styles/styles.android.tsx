import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    header: {
      ...commonStyles.header,
    },
    headerTopBar: {
      ...commonStyles.headerTopBar,
    },
    backButton: {
      ...commonStyles.backButton,
    },
    title: {
      ...commonStyles.title,
    },
    preamble: {
      ...commonStyles.preamble,
    },
  });
};

export default useStyles;
