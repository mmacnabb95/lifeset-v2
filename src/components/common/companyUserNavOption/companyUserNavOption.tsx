import React from "react";
import { NavOption } from "../navOption";
import { useRoute } from "@react-navigation/native";

export const CompanyUserNavOption = () => {
  const route = useRoute();
  const { companyId } = route.params as any;

  return (
    <NavOption
      key={`company_nav__${companyId}`}
      icon="user-edit"
      text={"Company users"}
      destination="CompanyUser"
      disabled={!companyId || companyId === "new"}
    />
  );
};
