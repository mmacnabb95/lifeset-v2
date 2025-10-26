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
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { isAdmin } from "src/navigation/utils/roleCheck";

export const RejectUserHabitPack = ({
  userHabitPack,
}: {
  userHabitPack: Userhabitpack;
}) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const loading = useSelector(userHabitPackLoading);
  const navigation = useNavigation();
  const { roles } = useUserInfo();

  const { results: habits } = useUserHabitPackHabitCollection(
    userHabitPack?.Id,
    1,
  );

  useEffect(() => {
    if (
      userHabitPack &&
      userHabitPack.UserHabitPackStatus !== UserHabitPackStatus.Draft
    ) {
      navigation.setParams({ viewOnly: true });
    }
  }, [navigation, userHabitPack, userHabitPack?.UserHabitPackStatus]);

  if (
    !isAdmin(roles) ||
    userHabitPack?.UserHabitPackStatus === UserHabitPackStatus.Rejected
  ) {
    return null;
  }

  return (
    <>
      <View
        style={{ marginTop: 20, marginBottom: -8, zIndex: 10, width: "100%" }}
      >
        <Button
          type={ButtonTypes.Primary}
          title="Reject"
          onPress={() => {
            setShowModal(true);
          }}
        />
      </View>
      <Modal
        visible={showModal}
        title="Reject Habit Pack"
        text={
          "Rejecting a habit pack will remove it from the user based habit pack list. In addition the habit pack will be removed from any user's who are using it."
        }
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Reject"
            loading={loading}
            onPress={async () => {
              await dispatch(
                updateUserHabitPack({
                  Id: userHabitPack.Id,
                  UserHabitPackStatus: UserHabitPackStatus.Rejected,
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
