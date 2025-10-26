import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";
const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
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
      // paddingTop: 20,
      // marginTop: windowWidth < commonConstants.mobileBreak ? 0 : 30,
    },

    preamble: {
      ...commonStyles.preamble,
    },
  });
};

export default useStyles;
