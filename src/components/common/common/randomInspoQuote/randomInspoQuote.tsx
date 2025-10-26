import React from "react";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { Typography, TypographyTypes } from "../typography";
import constants from "src/themes/constants";
import { useRandomInspoQuoteCollection } from "src/redux/domain/features/randomInspoQuote/useRandomInspoQuoteCollection";

export const RandomInspoQuote = ({}: {}) => {
  const { results } = useRandomInspoQuoteCollection();
  const quote = results ? results?.[0]?.Quote : "";

  return (
    <DashboardTile
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 10,
        paddingRight: 10,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        ...constants.shadowLarge,
      }}
    >
      <>
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
            color: "#5E5E5E",
          }}
        />
      </>
    </DashboardTile>
  );
};
