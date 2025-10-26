import React, { ReactNode } from "react";
import { WebFadeIn } from "src/components/common";
import { LinearGradient } from "expo-linear-gradient";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const FullScreenWithBackground = ({
  children,
  headerCompenstation = true,
  colours = ["#A596D8", "#2E8CF2", "#95DDCB"],
}: {
  children: ReactNode;
  headerCompenstation?: boolean;
  colours?: string[];
}) => {
  const layoutStyles = useLayoutStyles();

  return (
    <LinearGradient
      colors={colours}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.3, y: 0.1 }}
      style={[
        { height: "100%", flexGrow: 1, width: "100%" },
        headerCompenstation ? layoutStyles.headerPageCompensation : {},
      ]}
    >
      <WebFadeIn background={false}>{children}</WebFadeIn>
    </LinearGradient>
  );
};

export default FullScreenWithBackground;
