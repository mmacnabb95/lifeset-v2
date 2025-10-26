import React, { useEffect, useState } from "react";
import { ButtonTypes } from "../../../../components/common/button";
import { Button, Input, Modal } from "src/components/common";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { authUser, pinAuthUser } from "src/redux/features/auth/slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  getSettings,
  settingsSelector,
} from "src/redux/domain/features/settings/collection-slice";
import {
  closeAuthModal,
  setAuthModalAuthAbandoned,
} from "src/redux/features/misc/slice";
import { useAdminModeTimer } from "../adminModeTimer/useAdminModeTimer";
const useInputStyles =
  require("../../../../themes/input/styles/styles").default;

export const AuthModal = ({
  setCanProceed,
}: {
  setCanProceed?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const title = "Permission needed";
  const message = `\r\nPlease enter your pin to proceed`;
  const LinkButtonText = "Submit";
  const [open, setOpen] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const settings = useSelector(settingsSelector(userId));
  const [_pin, setPin] = useState("");
  const [_error, setError] = useState("");
  const [_loading, setLoading] = useState(false);
  const inputStyle = useInputStyles();
  const { startAdminModeTimer } = useAdminModeTimer();

  useEffect(() => {
    if (userId && !settings) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, settings, userId]);

  const doAuth = async () => {
    setLoading(true);
    const resp: any = await dispatch(pinAuthUser(_pin));
    // console.log("auth resp", resp);
    if (resp?.type === "pin-auth/fulfilled") {
      if (setCanProceed) {
        setCanProceed(true);
        startAdminModeTimer();
      }
      dispatch(setAuthModalAuthAbandoned(false));
      closeAuthModal();
    }
    if (resp?.type === "auth/rejected") {
      setError("Password incorrect");
      if (setCanProceed) {
        setCanProceed(false);
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      testID="AuthModal"
      visible={open}
      title={title}
      text={message}
      acceptButton={
        <Button
          testID="SubmitAuthModal"
          disabled={_pin === "" || _loading}
          style={{ opacity: _pin === "" ? 0.5 : 1 }}
          title={LinkButtonText}
          onPress={doAuth}
          loading={_loading}
        />
      }
      declineButton={
        <Button
          testID="CancelAuthModal"
          title="Cancel"
          type={ButtonTypes.Secondary}
          onPress={() => {
            setOpen(false);
            dispatch(setAuthModalAuthAbandoned(true));
            closeAuthModal();
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        />
      }
    >
      {/* prevent chrome auto populate on email */}
      {Platform.OS === "web" && (
        <input
          type="text"
          style={{ pointerEvents: "none", opacity: 0, position: "absolute" }}
          name={"email"}
        />
      )}
      <Input
        testID="modalPin"
        placeholder=""
        onChangeText={setPin}
        value={_pin}
        onSubmitEditing={doAuth}
        secureTextEntry
        autoFocus
        inputContainerStyle={[{ marginTop: -30 }]}
        errorPlace="centerRight"
        inputStyle={[{ height: 40 }, inputStyle.authInputLight]}
        errorMessage={_error}
        textContentType="oneTimeCode"
        autoComplete="off"
      />
    </Modal>
  );
};
