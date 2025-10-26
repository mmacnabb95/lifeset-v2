import React from "react";
import { View } from "react-native";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { Typography, TypographyTypes } from "../typography";
import constants from "src/themes/constants";
import { useRandomInspoQuoteCollection } from "src/redux/domain/features/randomInspoQuote/useRandomInspoQuoteCollection";
import { LinearGradient } from "expo-linear-gradient";

export const RandomInspoQuote = ({}: {}) => {
  const { results } = useRandomInspoQuoteCollection();
  const quote = results ? results?.[0]?.Quote : "";

  return (
    <DashboardTile
      style={{
        padding: 0,
        overflow: "hidden",
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        ...constants.shadowLarge,
      }}
    >
      <LinearGradient
        colors={["#FFE5B4", "#FFB347", "#FF8C00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.3, y: 0.1 }}
        style={{ height: '100%' }}
      >
        <View style={{
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
          <Typography
            type={TypographyTypes.H6}
            text={`"${quote}"`}
            style={{
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              lineHeight: 24,
              textAlign: "left",
              paddingTop: 5,
              paddingLeft: 10,
              paddingRight: 10,
              fontWeight: 800,
              width: "100%",
              color: "#2C3E50",
            }}
          />
        </View>
      </LinearGradient>
    </DashboardTile>
  );
};
