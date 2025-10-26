import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        centeredText: {
          ...commonStyles.centeredText,
          marginBottom: -17,
        },
        centerDoughnutFont: {
          ...commonStyles.centerDoughnutFont,
          lineHeight: 48,
        },
        centerDoughnutDescFont: {
          ...commonStyles.centerDoughnutDescFont,
          marginTop: -10,
        },
        centeredTextNoTitle: {
          ...commonStyles.centeredTextNoTitle,
          marginBottom: -10,
        },
      },
    },
  });
};

export default useStyles;
