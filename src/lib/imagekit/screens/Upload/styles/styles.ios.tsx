import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const windowWidth = Dimensions.get("window").width;
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        editButton: {
          ...commonStyles.editButton,
          alignItems: "flex-start",
        },
        deleteButton: {
          ...commonStyles.deleteButton,
          alignItems: "flex-start",
        },
      },
    },
  });
};

export default useStyles;
