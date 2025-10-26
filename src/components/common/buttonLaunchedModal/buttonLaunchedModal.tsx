import React, { useState } from "react";
import { View } from "react-native";
import { Button, ButtonTypes } from "../button";
import { Modal } from "../modal";
import { fireMediumHapticFeedback } from "src/utils/haptics";

export const ButtonLaunchedModal = ({
  disabled,
  buttonText,
  modalTitle,
  modalText,
  modalAcceptButtonText,
  modalRejectButtonText,
  onAccept,
}: {
  disabled?: boolean;
  buttonText: string;
  modalTitle: string;
  modalText: string;
  modalAcceptButtonText: string;
  modalRejectButtonText?: string;
  onAccept: () => Promise<void>;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <View style={{ width: "100%" }}>
      <Button
        type={ButtonTypes.Primary}
        title={buttonText}
        disabled={disabled}
        style={[disabled ? { opacity: 0.5 } : {}]}
        onPress={() => {
          fireMediumHapticFeedback();
          setShowModal(true);
        }}
      />
      <Modal
        visible={showModal}
        title={modalTitle}
        text={modalText}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title={modalAcceptButtonText}
            loading={loading}
            onPress={async () => {
              fireMediumHapticFeedback();
              setLoading(true);
              await onAccept();
              setShowModal(false);
            }}
          />
        }
        declineButton={
          <>
            {!!modalRejectButtonText && (
              <Button
                type={ButtonTypes.Secondary}
                title={modalRejectButtonText}
                onPress={() => {
                  fireMediumHapticFeedback();
                  setShowModal(false);
                }}
              />
            )}
          </>
        }
      />
    </View>
  );
};
