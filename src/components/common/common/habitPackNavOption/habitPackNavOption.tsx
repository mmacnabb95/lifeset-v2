import React from "react";
import { NavOption } from "../navOption";
import { useRoute } from "@react-navigation/native";

export const HabitPackNavOption = () => {
  const route = useRoute();
  const { companyId } = route.params as any;

  return (
    <NavOption
      key={`habit_pack_nav__${companyId}`}
      icon="habit-packs"
      text={"Habit packs"}
      destination="HabitPack"
      disabled={!companyId || companyId === "new"}
    />
  );
};
