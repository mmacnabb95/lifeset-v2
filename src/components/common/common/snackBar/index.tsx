import React, { useState } from "react";
import { Snackbar } from "react-native-paper";
import { Typography, TypographyTypes } from "../typography";

const useCommonStyles =
  require("../../../../themes/snackbar/styles/styles").default;

export const useSnackBar = () => {
  const commonStyles = useCommonStyles();

  const [visible, setVisible] = useState<boolean>(false);
  const [ok, setOK] = useState<boolean>(true);
  const [_message, setMessage] = useState<string>("");

  const showSnackOk = ({ message }: { message: string }) => {
    setMessage(message);
    setOK(true);
    setVisible(true);
  };

  const showSnackError = ({ message }: { message: string }) => {
    setMessage(message);
    setOK(false);
    setVisible(true);
  };

  const Snack = () => {
    return (
      <Snackbar
        testID="snackbar"
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
        style={[commonStyles.snack, ok ? commonStyles.ok : commonStyles.error]}
      >
        {/* could put animated view in here... */}
        <Typography
          type={TypographyTypes.Body1}
          style={commonStyles.text}
          testID="snackMessage"
          text={_message}
        />
      </Snackbar>
    );
  };

  return {
    Snack,
    showSnackOk,
    showSnackError,
  };
};
