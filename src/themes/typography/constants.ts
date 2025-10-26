import constants from "src/themes/constants";
import { TextStyleProps } from "../types";

const fontLight = constants.font400;
const fontRegular = constants.font500;
const fontMedium = constants.font600;
const fontSemiBold = constants.font700;
const fontBold = constants.font800;
const fontBlack = constants.font900;

const defaultText: TextStyleProps = {
  fontFamily: fontRegular,

  fontWeight: "500",
  fontSize: 16,
  lineHeight: 21,
};

const h1: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 32,
  lineHeight: 40,
};
const h2: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 30,
  lineHeight: 35,
};
const h3: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 28,
  lineHeight: 33,
};
const h4: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 26,
  lineHeight: 31,
};
const h5: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 24,
  lineHeight: 30,
};
const h6: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 22,
  lineHeight: 28,
};

const body1: TextStyleProps = {
  fontFamily: fontLight,

  fontWeight: "400",
  fontSize: 14,
  lineHeight: 20,
};
const body2: TextStyleProps = {
  fontFamily: fontRegular,

  fontWeight: "500",
  fontSize: 14,
  lineHeight: 21,
};

const caption1: TextStyleProps = {
  fontFamily: fontSemiBold,

  fontWeight: "500",
  fontSize: 14,
  lineHeight: 21,
};
const caption2: TextStyleProps = {
  fontFamily: fontRegular,

  fontWeight: "400",
  fontSize: 13,
  lineHeight: 18,
};

const menuText: TextStyleProps = {
  fontFamily: fontLight,
  fontSize: 12,
  fontWeight: "400",
  lineHeight: 18,
  letterSpacing: 0.5,
};

const subtitle1: TextStyleProps = {
  fontFamily: fontMedium,

  fontWeight: "500",
  fontSize: 18,
  lineHeight: 22,
};
const subtitle2: TextStyleProps = {
  fontFamily: fontMedium,

  fontWeight: "500",
  fontSize: 16,
  lineHeight: 21,
};

const link: TextStyleProps = {
  fontFamily: fontMedium,

  fontWeight: "500",
  fontSize: 18,
  lineHeight: 21,
  color: constants.link,
};

export default {
  default: defaultText,

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,

  body1,
  body2,

  caption1,
  caption2,

  menuText,

  subtitle1,
  subtitle2,

  link,

  fontLight: constants.font400,
  fontRegular: constants.font500,
  fontMedium: constants.font600,
  fontSemiBold: constants.font700,
  fontBold: constants.font800,
  fontBlack: constants.font900,
};
