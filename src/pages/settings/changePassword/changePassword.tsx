import React from "react";
import { View } from "react-native";
import { fetchClient } from "src/utils/legacy-stubs";
import ResetPWScreen from "src/pages/auth/passwordReset/reset-pw-page";
import { useTranslation } from "src/translations/useTranslation";
import { Body, Button, useSnackBar, WebFadeIn } from "src/components/common";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
  const layoutStyles = useLayoutStyles();
  const styles = useStyles();

  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const { t } = useTranslation();

  const getResetToken = async () => {
    const client = await fetchClient();
    const resp: any = await client.post("auth/reset-secure");
    return resp.data;
  };

  const handleSubmit = async (
    resetPWSubmit: {
      (token: string): Promise<void>;
      (arg0: any): Promise<any>;
    },
    resetPWValidation: { (): Promise<boolean | undefined>; (): any },
  ) => {
    const result = await resetPWValidation();
    if (result === true) {
      const token = await getResetToken();
      resetPWSubmit(token)
        .then(() => {
          showSnackOk({ message: t("changePassword.saveSuccess") });
        })
        .catch(() => {
          showSnackError({ message: t("common.error") });
        });
    }
  };

  const SubmitButtonOverride = ({
    resetPWValidation,
    resetPWSubmit,
  }: {
    resetPWValidation: () => Promise<boolean | undefined>;
    resetPWSubmit: (token: string) => Promise<void>;
    ref?: any;
  }) => {
    return (
      <Button
        title={t("changePassword.saveBtn")}
        testID="Reset"
        style={{
          marginTop: 20,
        }}
        onPress={() => handleSubmit(resetPWSubmit, resetPWValidation)}
      />
    );
  };

  return (
    <WebFadeIn background={false}>
      <View style={[layoutStyles.page, layoutStyles.noMobPadding]}>
        <Body style={[styles.changeEmailForm]}>
          <ResetPWScreen
            navigation={navigation}
            SubmitButtonOverride={SubmitButtonOverride}
            handleSubmitOverride={handleSubmit}
          />
        </Body>
        <Snack />
      </View>
    </WebFadeIn>
  );
};

export default ChangePasswordScreen;
