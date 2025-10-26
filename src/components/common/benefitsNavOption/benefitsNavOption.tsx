import React from "react";
import { NavOption } from "../navOption";
import { useRoute } from "@react-navigation/native";

export const BenefitsNavOption = () => {
  const route = useRoute();
  const { companyId } = route.params as any;

  return (
    <NavOption
      key={`benefits_nav__${companyId}`}
      icon="verify-outline"
      text={"Benefits"}
      destination="Benefits"
      disabled={!companyId || companyId === "new"}
    />
  );
};
