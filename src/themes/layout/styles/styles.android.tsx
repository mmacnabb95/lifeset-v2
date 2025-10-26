import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // drawContainer: {
        //   ...commonStyles.drawContainer,
        //   backgroundColor: "blue",
        // },
      },
    },
  });
};

export default useStyles;
