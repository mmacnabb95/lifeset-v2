import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
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
    },
    navList: {
      ...commonStyles.navList,
    },
    profileImage: {
      ...commonStyles.profileImage,
    },
    titleStyle: {
      ...commonStyles.titleStyle,
    },
    deleteButton: {
      ...commonStyles.deleteButton,
      marginTop: -10,
    },
  });
};

export default useStyles;
