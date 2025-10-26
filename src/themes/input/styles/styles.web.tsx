import { StyleSheet } from "react-native";
import constants from "../constants";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  return StyleSheet.create({
    ...{
      ...commonStyles,
      ...{
        // drawContainer: {
        //   ...commonStyles.drawContainer,
        //   backgroundColor: "blue",
        // },
        input: {
          ...commonStyles.input,
          // "-webkit-text-fill-color": "black",
          // "-webkit-box-shadow": "0 0 0px 1000px rgb(255 255 255) inset",
          // "background-color": "transparent",
          // "font-zise": "16px",
        },
      },
    },
  });
};

export default useStyles;
