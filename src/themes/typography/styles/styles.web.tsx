import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import { TypographyTypes } from "../../../components/common/typography";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    [TypographyTypes.Default]: {
      ...commonStyles[TypographyTypes.Default],
    },

    [TypographyTypes.ButtonTextPrimary]: {
      ...commonStyles[TypographyTypes.ButtonTextPrimary],
    },

    [TypographyTypes.ButtonTextDanger]: {
      ...commonStyles[TypographyTypes.ButtonTextDanger],
    },

    [TypographyTypes.ButtonTextSecondary]: {
      ...commonStyles[TypographyTypes.ButtonTextSecondary],
    },

    [TypographyTypes.ButtonTextError]: {
      ...commonStyles[TypographyTypes.ButtonTextError],
    },

    [TypographyTypes.ButtonText]: {
      ...commonStyles[TypographyTypes.ButtonText],
    },

    [TypographyTypes.H1]: {
      ...commonStyles[TypographyTypes.H1],
    },
    [TypographyTypes.H2]: {
      ...commonStyles[TypographyTypes.H2],
    },
    [TypographyTypes.H3]: {
      ...commonStyles[TypographyTypes.H3],
    },
    [TypographyTypes.H4]: {
      ...commonStyles[TypographyTypes.H4],
    },
    [TypographyTypes.H5]: {
      ...commonStyles[TypographyTypes.H5],
    },
    [TypographyTypes.H6]: {
      ...commonStyles[TypographyTypes.H6],
    },

    [TypographyTypes.Body1]: {
      ...commonStyles[TypographyTypes.Body1],
    },
    [TypographyTypes.Body2]: {
      ...commonStyles[TypographyTypes.Body2],
    },

    [TypographyTypes.Caption1]: {
      ...commonStyles[TypographyTypes.Caption1],
    },
    [TypographyTypes.Caption2]: {
      ...commonStyles[TypographyTypes.Caption2],
    },

    [TypographyTypes.Subtitle1]: {
      ...commonStyles[TypographyTypes.Subtitle1],
    },
    [TypographyTypes.Subtitle2]: {
      ...commonStyles[TypographyTypes.Subtitle2],
    },

    [TypographyTypes.InputErrorText]: {
      ...commonStyles[TypographyTypes.InputErrorText],
    },
    [TypographyTypes.InputSuccessText]: {
      ...commonStyles[TypographyTypes.InputSuccessText],
    },
    [TypographyTypes.Input]: {
      ...commonStyles[TypographyTypes.Input],
    },

    [TypographyTypes.InputLabel]: {
      ...commonStyles[TypographyTypes.InputLabel],
    },

    [TypographyTypes.Link]: {
      ...commonStyles[TypographyTypes.Link],
    },
    selectPlaceholderText: {
      ...commonStyles.selectPlaceholderText,
    },
    selectText: {
      ...commonStyles.selectText,
      "-webkit-text-fill-color": commonConstants.black900
    },
  });
};

export default useStyles;
