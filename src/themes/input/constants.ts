import constants from "../constants";
import { TextStyleProps } from "../types";
import typographyConstants from "../typography/constants";

const inputErrorText: TextStyleProps = {
  ...typographyConstants.caption1,
  color: constants.error,
};
const inputSuccessText: TextStyleProps = {
  ...typographyConstants.caption1,
  color: constants.success,
};
const input: TextStyleProps = {
  ...typographyConstants.caption1,
  color: constants.black,
};
const inputPlaceHolder: TextStyleProps = {
  ...typographyConstants.caption1,
  color: constants.grey600,
};
const inputLabel: TextStyleProps = {
  ...typographyConstants.caption1,
  color: constants.grey400,
};

export default {
  error: constants.error,

  fontSize: 18,
  errorFontSize: 14,
  // maxWidth: 400,
  radius: constants.radius,
  backgroundColor: constants.white,
  minHeight: 50,
  labelPaddingHorizontal: 14,
  inputPaddingHorizontal: 14,
  errorPaddingHorizontal: 14,
  borderColor: constants.grey300,
  placeHolderColor: constants.grey100,

  inputErrorText,
  inputSuccessText,
  input,
  inputPlaceHolder,
  inputLabel,
};
