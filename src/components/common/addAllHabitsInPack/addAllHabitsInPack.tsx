import React, { useState } from "react";
import { Button, ButtonTypes } from "../button";
import { View } from "react-native";
import { Modal } from "../modal";
import { useDispatch } from "react-redux";
import {
  createHabit,
  thunks,
} from "src/redux/domain/features/habit/collection-slice";
// Update the import path below to the correct location of Habit type, for example:
import { Habit } from "src/types/domain/flat-types";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import _ from "lodash";
import { getAllTimeStreaks } from "src/redux/domain/features/allTimeStreak/collection-slice";
import { Loading } from "../loading/loading";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { PredefinedHabit } from "src/pages/user/predefinedHabits/habitTile";
import { ScheduledHabit } from "src/pages/user/predefinedHabits/predefinedHabits";

export const AddAllHabitsInPack = ({
  habits,
}: {
  habits: PredefinedHabit[] | ScheduledHabit[];
}) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const { userId } = useUserInfo();
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={{
        marginTop: 5,
        marginBottom: 0,
        zIndex: 10,
        flexDirection: "row",
      }}
    >
      <Button
        onPress={async () => {
          setShowModal(true);
        }}
        title={"Add all"}
        style={{ width: 100, height: 40, minHeight: 0}}
        titleStyle={{fontSize: 14}}
      />
      <Modal
        visible={showModal}
        title="Add all habits in the pack"
        text={`You are about to add this habit pack to your schedule, this includes ${
          //TODO: extract to function
          habits && habits.length > 1
            ? habits
                .map((h) => h.Name)
                .slice(0, -1)
                .join(", ") +
              " and " +
              habits.map((h) => h.Name)[habits.length - 1] +
              "."
            : habits?.map((h) => h.Name) + "."
        } 

By adding this habit pack you will be added to the associated streak leaderboard. Removing a habit from this pack will also automatically remove you from the leaderboard.`}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="OK"
            loading={loading}
            onPress={async () => {
              const today = moment().format("YYYY-MM-DD");
              setLoading(true);
              for (const _habit of habits) {
                const habit: Habit = {
                  User: userId,
                  FromTemplate: true,
                  Title: _habit.Name,
                  ..._habit,
                };
                await dispatch(
                  createHabit(_.omit(habit, "Id", "readOnly", "Name")),
                );
              }
              await dispatch(
                thunks!.getHabitsByDate({
                  user: userId,
                  date: today,
                  offset: 0,
                  limit: 10000,
                }),
              );
              await dispatch(getAllTimeStreaks({ user: userId }));
              setLoading(false);
              navigation.goBack();
            }}
          />
        }
        declineButton={
          <Button
            type={ButtonTypes.Secondary}
            title="Cancel"
            onPress={() => {
              setShowModal(false);
            }}
          />
        }
      />
    </View>
  );
};

// Also add a default export for components that might be importing it that way
export default AddAllHabitsInPack; 