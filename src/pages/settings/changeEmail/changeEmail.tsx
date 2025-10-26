import React, { useState } from "react";
import { SafeAreaView, View, useWindowDimensions } from "react-native";
import { fetchClient } from "src/utils/legacy-stubs";
import { AxiosResponse } from "axios";
import { useTranslation } from "src/translations/useTranslation";
import {
  Body,
  Button,
  Header,
  Input,
  Typography,
  useSnackBar,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ButtonTypes } from "../../../components/common/button";
import commonConstants from "src/themes/constants";
import { CodeInput } from "src/pages/auth/twoFactor/codeInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { clearSettingsItems } from "src/redux/domain/features/settings/collection-slice";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeArea } from "src/components/common/safeArea/safeArea";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

const ChangeEmailScreen: React.FunctionComponent<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();
  const styles = useStyles();
  const dispatch = useDispatch();

  //TODO: factor out to styles
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > commonConstants.avgDeviceSize;

  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const { t } = useTranslation();
  const [emailValue, setEmailValue] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const client = await fetchClient();
    client
      .post("user/change-email", {
        email: emailValue,
      })
      .then((res: AxiosResponse) => {
        setMessage(t("changeEmail.emailChangeMessage"));
        if (res.data?.success) {
          showSnackOk({ message: t("changeEmail.saveSuccess") });
        }
      })
      .catch((err: AxiosResponse) => {
        if (err.data?.message) {
          showSnackError({ message: err.data.message });
        }
      });
  };

  const initialValues = {
    code: "      ",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      code: Yup.string()
        .required("Required")
        .test("is_valid", "Required", (value) => {
          return value!.trim().length === 6;
        }),
    }),
    onSubmit: async (verificationCode) => {
      const client = await fetchClient();
      client
        .post("auth/verify/email-change", {
          code: verificationCode.code,
          email: emailValue,
          source: "ChangeEmail",
        })
        .then(async () => {
          showSnackOk({ message: t("security.codeAccepted") });
          dispatch(clearSettingsItems());
          setTimeout(() => {
            formik.setFieldValue("code", initialValues.code, false);
            navigation.goBack();
          }, 2000);
        })
        .catch((resp) => {
          if (resp === "Invalid code") {
            showSnackError({ message: resp });
          } else {
            showSnackError({ message: "An error has occured" });
          }
        });
    },
  });

  return (
    <WebFadeIn>
      <View style={[layoutStyles.page]}>
        <Body style={[styles.changeEmailForm]}>
          <>
            <View style={{ flex: 1 }}>
              {!message && (
                <View style={{ width: "100%" }}>
                  <Typography
                    type={TypographyTypes.Body1}
                    style={[
                      formStyles.form,
                      { color: commonConstants.black900 },
                    ]}
                    text={t("changeEmail.preamble")}
                  />

                  <Input
                    multiline={false}
                    numberOfLines={1}
                    style={[{ marginTop: 10, width: "100%" }]}
                    testID="email-field"
                    placeholder={t("changeEmail.fields.email")}
                    onChangeText={setEmailValue}
                    value={emailValue}
                    maxLength={45}
                    inputContainerStyle={[{ width: "100%" }]}
                    inputStyle={[{ width: "100%" }]}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {message ? (
                <>
                  <Typography
                    style={{
                      marginBottom: 30,
                      color: commonConstants.black900,
                    }}
                    type={TypographyTypes.Body1}
                    text={message}
                  />
                  <View
                    style={{
                      width: "100%",
                    }}
                  >
                    <CodeInput
                      navigation={navigation}
                      formik={formik}
                      inputStyle={{ color: "black", backgroundColor: "white" }}
                    />
                  </View>
                </>
              ) : (
                <Button
                  style={{ marginTop: 20 }}
                  title={t("changeEmail.saveBtn")}
                  testID="change-email-button"
                  type={ButtonTypes.Primary}
                  onPress={handleSubmit}
                />
              )}
            </View>
            {/* <Snack /> */}
          </>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default ChangeEmailScreen;
