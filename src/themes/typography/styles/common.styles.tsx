import { StyleSheet } from "react-native";

import { TypographyTypes } from "../../../components/common/typography";
import constants from "../constants";
import commonConstants from "../../constants";

const useStyles = () => {
  return StyleSheet.create({
    [TypographyTypes.Default]: {
      ...constants.default,
      color: commonConstants.black,
    },

    [TypographyTypes.ButtonTextPrimary]: {
      ...constants.default,
      color: commonConstants.white,
    },

    [TypographyTypes.ButtonTextDanger]: {
      ...constants.caption1,
      color: commonConstants.black,
      lineHeight: 21,
      fontSize: 16,
      opacity: 0.7, //todo: fix this with the correct color
    },

    [TypographyTypes.ButtonTextSecondary]: {
      ...constants.caption1,
      color: commonConstants.primaryColor,
    },

    [TypographyTypes.ButtonTextError]: {
      ...constants.caption1,
      color: commonConstants.white,
    },

    [TypographyTypes.ButtonText]: {
      ...constants.caption1,
    },

    [TypographyTypes.H1]: {
      ...constants.h1,
    },
    [TypographyTypes.H2]: {
      ...constants.h2,
    },
    [TypographyTypes.H3]: {
      ...constants.h3,
    },
    [TypographyTypes.H4]: {
      ...constants.h4,
    },
    [TypographyTypes.H5]: {
      ...constants.h5,
    },
    [TypographyTypes.H6]: {
      ...constants.h6,
    },

    [TypographyTypes.Body1]: {
      ...constants.body1,
    },
    [TypographyTypes.Body2]: {
      ...constants.body2,
    },

    [TypographyTypes.Caption1]: {
      ...constants.caption1,
    },
    [TypographyTypes.Caption2]: {
      ...constants.caption2,
    },
    [TypographyTypes.MenuText]: {
      ...constants.menuText,
    },

    [TypographyTypes.Subtitle1]: {
      ...constants.subtitle1,
    },
    [TypographyTypes.Subtitle2]: {
      ...constants.subtitle2,
    },

    [TypographyTypes.InputErrorText]: {
      ...constants.caption1,
      color: commonConstants.error,
    },
    [TypographyTypes.InputSuccessText]: {
      ...constants.caption1,
    },
    [TypographyTypes.Input]: {
      ...constants.body1,
    },

    [TypographyTypes.InputLabel]: {
      ...constants.caption1,
      color: commonConstants.grey400,
    },

    [TypographyTypes.Link]: {
      ...constants.link,
    },

    selectPlaceholderText: {
      ...constants.body1,
      color: commonConstants.black900,
    },
    selectText: {
      ...constants.body1,
      color: commonConstants.black900,
    },
  });
};

export default useStyles;
