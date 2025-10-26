import { StyleSheet } from "react-native";
import { ButtonTypes } from "../../../components/common/button";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    button: {
      ...commonStyles.button,
    },

    body: {
      ...commonStyles.body,
    },

    flex: {
      ...commonStyles.flex,
    },

    center: {
      ...commonStyles.center,
    },

    left: {
      ...commonStyles.left,
    },
    disabled: {
      ...commonStyles.disabled,
    },

    right: {
      ...commonStyles.right,
    },

    [ButtonTypes.Primary]: {
      ...commonStyles[ButtonTypes.Primary],
    },

    [ButtonTypes.Secondary]: {
      ...commonStyles[ButtonTypes.Secondary],
    },

    [ButtonTypes.Danger]: {
      ...commonStyles[ButtonTypes.Danger],
    },

    [ButtonTypes.Delete]: {
      ...commonStyles[ButtonTypes.Delete],
    },

    [ButtonTypes.IconButton]: {
      ...commonStyles[ButtonTypes.IconButton],
    },
    [ButtonTypes.BackButton]: {
      ...commonStyles[ButtonTypes.BackButton],
    },
    [ButtonTypes.ImageUploadButton]: {
      ...commonStyles[ButtonTypes.ImageUploadButton],
    },
    [ButtonTypes.LinkButton]: {
      ...commonStyles[ButtonTypes.LinkButton],
    },
  });
};

export default useStyles;
