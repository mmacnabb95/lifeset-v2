import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../../themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    changeEmailForm: {
      ...commonStyles.changeEmailForm,
    },
    personalDetails: {
      ...commonStyles.personalDetails,
    },
    personalDetailsForm: {
      ...commonStyles.personalDetailsForm,
      // marginTop: windowWidth > commonConstants.mobileBreak ? 150 : 80,
    },
    navList: {
      ...commonStyles.navList,
    },
    profileImage: {
      ...commonStyles.profileImage,
    },

    titleStyle: {
      ...commonStyles.titleStyle,
      marginTop: 0,
    },
    deleteButton: {
      ...commonStyles.deleteButton,
      marginTop: -25,
    },
  });
};

export default useStyles;
