import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
    body: {
      ...commonStyles.body,
    },
    content: {
      ...commonStyles.content,
    },
    title: {
      ...commonStyles.title,
    },
    text: {
      ...commonStyles.text,
    },
    modalButton: {
      ...commonStyles.modalButton,
    },
  });
};

export default useStyles;
