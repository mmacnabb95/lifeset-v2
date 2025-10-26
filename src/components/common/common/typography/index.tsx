import { Text, TextProps } from "react-native";
import React from "react";

const useCommonStyles =
  require("../../../../themes/typography/styles/styles").default;

export enum TypographyTypes {
  Default = "default",

  ButtonText = "buttonText",
  ButtonTextPrimary = "buttonTextPrimary",
  ButtonTextSecondary = "buttonTextSecondary",
  ButtonTextError = "buttonTextError",
  ButtonTextDanger = "buttonTextDanger",

  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  H6 = "h6",

  Body1 = "body1",
  Body2 = "body2",

  Caption1 = "caption1",
  Caption2 = "caption2",

  MenuText = "menuText",

  Subtitle1 = "subtitle1",
  Subtitle2 = "subtitle2",

  InputErrorText = "inputErrorText",
  InputSuccessText = "inputSuccessText",
  Input = "input",
  InputPlaceHolder = "inputPlaceHolder",
  InputLabel = "inputLabel",

  Link = "link",

  LinkUnderline = "linkUnderline",
}

type Style = Record<string, string | number>;

interface TypographyProps {
  readonly text: string;
  readonly style?: Style | Array<Style | undefined>;
  readonly type?: TypographyTypes;
}

export const Typography = ({
  style,
  type = TypographyTypes.Default,
  text,
  ...restProps
}: TypographyProps & TextProps) => {
  const commonStyles = useCommonStyles();

  return (
    <Text
      style={[commonStyles.text, type && commonStyles[type], style]}
      allowFontScaling={false}
      {...restProps}
    >
      {text}
    </Text>
  );
};
