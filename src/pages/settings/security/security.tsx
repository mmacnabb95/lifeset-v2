import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getSettings,
  settingsSelector,
} from "src/redux/domain/features/settings/collection-slice";

import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { fetchClient } from "src/utils/legacy-stubs";
import { useTranslation } from "src/translations/useTranslation";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

import {
  Body,
  Header,
  NavOption,
  Toggle,
  Typography,
  useSnackBar,
  WebFadeIn,
} from "../../../components/common";
import { TypographyTypes } from "../../../components/common/typography";
import { clearAuthReset } from "src/redux/features/authReset/slice";

const Security = ({ navigation }: { navigation: any }) => {
  const pageStyles = useLayoutStyles();
  const formStyles = useFormStyles();
  const styles = useStyles();

  const dispatch = useDispatch();
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const { t } = useTranslation();
  const [apiTwoFactorEnabled, setApiTwoFactorEnabled] = useState(false);
  const { userId } = useUserInfo();

  const settings = useSelector(settingsSelector(userId));

  useEffect(() => {
    if (!settings && userId) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, settings, userId]);

  const changeTwoFactorAuth = async (isEnable: boolean) => {
    setApiTwoFactorEnabled(isEnable);
    const client = await fetchClient();
    await client
      .put("user/two-factor-auth", { enable: isEnable ? 1 : 0 })
      .then(() => {
        showSnackOk({
          message: isEnable
            ? t("security.twofaActive")
            : t("security.twofaDeactive"),
        });
      })
      .catch(() => {
        setApiTwoFactorEnabled(!isEnable);
        showSnackError({ message: t("common.error") });
      });
  };

  useEffect(() => {
    if (userId) {
      fetchClient().then((client) => {
        client.get("user/two-factor-auth").then((res: any) => {
          if (
            res.data &&
            res.data.two_factor_auth &&
            res.data.two_factor_auth === 1
          ) {
            setApiTwoFactorEnabled(true);
          }
        });
      });
    }
  }, [dispatch, userId]);

  return (
    <WebFadeIn background={false}>
      <View style={pageStyles.page}>
        <Header title={t("security.title")} navigation={navigation} />
        <Body>
          <View style={[formStyles.form]}>
            <NavOption
              text={t("security.changePasswordBtn")}
              destination="ForgottenPassword"
              beforeNav={() => dispatch(clearAuthReset())}
              params={{ a: "t" }}
              style={{
                width: "100%",
              }}
            />
            {/* <View style={styles.container}>
              <Toggle
                label={t("security.twofaBtn")}
                testID={"TwoFactorToggle"}
                enabled={apiTwoFactorEnabled}
                disabled={!settings?.PhoneNumber}
                onChange={(newState: boolean) => {
                  changeTwoFactorAuth(newState);
                }}
              />
            </View>
            {!settings?.PhoneNumber && (
              <>
                <View style={styles.container}>
                  <Typography
                    type={TypographyTypes.Body2}
                    text={t("security.registrationIntro")}
                  />
                </View>
                <NavOption
                  text={t("security.registerMobile")}
                  destination="PhoneNumber"
                  navigation={navigation}
                  params={{ returnpage: "Security" }}
                  style={{
                    width: "100%",
                  }}
                />
              </>
            )} */}
          </View>
        </Body>
        <Snack />
      </View>
    </WebFadeIn>
  );
};

export default Security;
