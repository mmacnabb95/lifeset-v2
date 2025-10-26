import React from "react";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { View } from "react-native";
import { WebFadeIn } from "../webFadeIn";
import { Typography, TypographyTypes } from "../typography";
import moment from "moment";
import constants from "src/themes/constants";
import { PngIcon } from "../pngIcon/pngIcon";

export const DateBar = ({
  route,
  navigation,
  date,
}: {
  route: any;
  navigation: any;
  date: Date;
}) => {
  return (
    <DashboardTile style={{ height: 38, padding: 0, ...constants.shadowLarge }}>
      <WebFadeIn background={false} style={{}}>
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <PngIcon iconName="calendarBlack" height={24} width={24} />
          <Typography
            type={TypographyTypes.Body1}
            text={moment(date).format("dddd, MMMM DD YYYY")}
            style={{ justifyContent: "center", marginLeft: 7, fontSize: 13 }}
          />
        </View>
      </WebFadeIn>
    </DashboardTile>
  );
};
