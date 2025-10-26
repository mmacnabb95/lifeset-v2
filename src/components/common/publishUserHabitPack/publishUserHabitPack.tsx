import React, { useEffect, useState } from "react";
import { Button, ButtonTypes } from "../button";
import { View } from "react-native";
import { Modal } from "../modal";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserHabitPack,
  userHabitPackLoading,
} from "src/redux/domain/features/userHabitPack/collection-slice";
import { UserHabitPackStatus } from "src/redux/customTypes/types";
import { Userhabitpack } from "../../../../../types/domain/flat-types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserHabitPackHabitCollection } from "src/redux/domain/features/userHabitPackHabit/useUserHabitPackHabitCollection";
import { clearPublishedUserHabitPackItems } from "src/redux/domain/features/publishedUserHabitPack/collection-slice";

export const PublishUserHabitPack = ({
  userHabitPack,
}: {
  userHabitPack: Userhabitpack;
}) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const loading = useSelector(userHabitPackLoading);
  const navigation = useNavigation();

  const { results: habits } = useUserHabitPackHabitCollection(
    userHabitPack?.Id,
    1,
  );

  useEffect(() => {
    if (userHabitPack && userHabitPack.UserHabitPackStatus !== UserHabitPackStatus.Draft) {
      navigation.setParams({ viewOnly: true });
    }
  }, [navigation, userHabitPack, userHabitPack?.UserHabitPackStatus]);

  if (
    userHabitPack?.UserHabitPackStatus !== UserHabitPackStatus.Draft ||
    !habits ||
    habits.length === 0
  ) {
    return null;
  }

  return (
    <>
      <View
        style={{ marginTop: 20, marginBottom: -8, zIndex: 10, width: "100%" }}
      >
        <Button
          disabled={userHabitPack?.UserHabitPackStatus !== UserHabitPackStatus.Draft}
          type={ButtonTypes.Primary}
          title="Publish"
          onPress={() => {
            setShowModal(true);
          }}
        />
      </View>
      <Modal
        visible={showModal}
        title="Publish Habit Pack"
        text={
          "Once published a Habit Pack cannot be updated or deleted and will be sent for review by the LifeSet team."
        }
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Publish"
            loading={loading}
            onPress={async () => {
              await dispatch(
                updateUserHabitPack({
                  Id: userHabitPack.Id,
                  UserHabitPackStatus: UserHabitPackStatus.Published,
                }),
              );
              setShowModal(false);
              await dispatch(clearPublishedUserHabitPackItems());
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
    </>
  );
};
