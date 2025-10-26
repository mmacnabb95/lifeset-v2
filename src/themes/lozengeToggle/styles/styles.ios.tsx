import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    list: {
      ...commonStyles.list,
    },
    listItem: {
      ...commonStyles.listItem,
    },
    listItemActive: {
      ...commonStyles.listItemActive,
    },
    textStyle: {
      ...commonStyles.textStyle,
    },
    activeTextStyle: {
      ...commonStyles.activeTextStyle,
    },
  });
};

export default useStyles;
