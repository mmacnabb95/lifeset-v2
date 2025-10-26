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
        headerPageCompensation: {
          ...commonStyles.headerPageCompensation,
          paddingTop: 80,
        },
        scrollPageCompensation: {
          ...commonStyles.scrollPageCompensation,
          paddingBottom: 80,
        },
        page: {
          ...commonStyles.page,
          paddingTop: 80,
        },
        authPage: {
          ...commonStyles.authPage,
          paddingTop: 80,
        },
        subList: {
          ...commonStyles.subList,
          // height: "unset",
          // paddingBottom: 20,
        },
      },
    },
  });
};

export default useStyles;
