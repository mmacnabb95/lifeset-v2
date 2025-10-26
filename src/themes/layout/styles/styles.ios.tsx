import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const windowWidth = Dimensions.get("window").width;
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // page: {
        //   ...commonStyles.page,
        //   // paddingTop: windowWidth > commonConstants.avgDeviceSize ? 30 : 0,
        // },
      },
    },
  });
};

export default useStyles;
