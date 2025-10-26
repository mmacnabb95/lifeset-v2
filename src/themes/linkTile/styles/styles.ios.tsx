import { StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  return StyleSheet.create({
    tile: {
      ...commonStyles.tile,
    },
    tileText: {
      ...commonStyles.tileText,
    },
    pressable: {
      ...commonStyles.pressable,
    },
    icon: {
      ...commonStyles.icon,
    },
  });
};

export default useStyles;
