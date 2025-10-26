import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useUserHabitPackUseCollection } from "src/redux/domain/features/userHabitPackUse/useUserHabitPackUseCollection";
import { Userhabitpackuse } from "../../../../../types/domain/flat-types";
import _ from "lodash";
import { HabitPackLeaderboardDashboard } from "./habitPackLeaderboardDashboard";

export const HabitPackLeaderBoards = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { userId } = useUserInfo();

  //get all habit packs where the user has created habits from (and not deleted any!)
  const { results: habitPackUses, Refresh } = useUserHabitPackUseCollection(
    userId,
    100,
  );

  useFocusEffect(
    React.useCallback(() => {
      Refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const habitPacks = _.uniq(
    habitPackUses?.map((hpu: Userhabitpackuse) => hpu.UserHabitPack),
  );

  return (
    <View style={{ width: "100%" }}>
      {habitPacks.map((habitPackId: number) => {
        return (
          <HabitPackLeaderboardDashboard
            key={`dashlead_${habitPackId}`}
            habitPackId={habitPackId}
          />
        );
      })}
    </View>
  );
};
