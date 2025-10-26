/* eslint-disable prettier/prettier */
import React, { } from "react";

import BenefitViewListScreen from "./benefit.viewList";
import { LinearGradient } from "expo-linear-gradient";

const BenefitViewListScreenOverride = ({
  navigation,
  route,
  showTitle = true,
  // showPreamble = true,
  hideGoBack,
  style,
  contentStyle,
  fadeIn = true,
  parentPageIsCloseToBottomOfScroll,
  scrollEnabled = true,
  destination = "BenefitView",
  customListComponent = false,

}: {
  navigation: any;
  route?: any;
  showTitle?: boolean;
  // showPreamble?: boolean;
  hideGoBack?: boolean;
  style?: any;
  contentStyle?: any;
  fadeIn?: boolean;
  parentPageIsCloseToBottomOfScroll?: boolean;
  scrollEnabled?: boolean;
  destination?: string;
  customListComponent?: any;

}) => {

  return (<LinearGradient
    colors={["#9BBAE9", "#FFFFFF"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1.3, y: 0.1 }}
    style={[
      {
        paddingVertical: 10,
        flex: 1,
        // paddingHorizontal: 20,
      },
    ]}
  >
    <BenefitViewListScreen
      navigation={navigation}
      route={route}
      showTitle={showTitle}
      hideGoBack={hideGoBack}
      style={style}
      contentStyle={contentStyle}
      fadeIn={fadeIn}
      parentPageIsCloseToBottomOfScroll={parentPageIsCloseToBottomOfScroll}
      scrollEnabled={scrollEnabled}
      destination={destination}
      customListComponent={customListComponent}
    />
  </LinearGradient>);
};

export default BenefitViewListScreenOverride;
