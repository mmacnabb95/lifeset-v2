import { Dimensions } from "react-native";
// import { mobileBreak } from "src/navigation/header/drawerNavOptions";
import commonConstants from "src/themes/constants";

const horizontalPadding = 0;

export const usePlayerDimensions = () => {
  const windowWidth = Dimensions.get("window").width;

  const getFormWidth = () => {
    if (windowWidth > commonConstants.avgDeviceSize) {
      if (windowWidth - horizontalPadding > commonConstants.maxPageWidth) {
        return commonConstants.maxPageWidth - horizontalPadding;
      }

      // if (windowWidth - 40 < commonConstants.maxPageWidth) {
      return commonConstants.maxPageWidth - horizontalPadding;
      // }

      // const max = commonConstants.maxPageWidth;
      // return windowWidth - 320 - 70 > max
      //   ? max - 40
      //   : windowWidth - 320 - 70; // -40 is scroll bar and padding ...will not be necessary post BAMEP-91
    } else {
      return windowWidth - horizontalPadding;
    }
  };

  const _playerHeight = (getFormWidth() / 16) * 9;
  const _playerWidth = getFormWidth();

  return {
    playerHeight: _playerHeight,
    playerWidth: _playerWidth,
  };
};
