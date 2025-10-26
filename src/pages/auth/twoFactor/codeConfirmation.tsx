import React, { useEffect, useState } from "react";
import { Image, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Body,
  Button,
  Typography,
  useSnackBar,
  WebFadeIn,
} from "src/components/common";
import {
  error,
  resendSignUpMail,
  signUpData,
} from "src/redux/features/signUp/slice";
import { TypographyTypes } from "../../../components/common/typography";
import { ButtonTypes } from "../../../components/common/button";
// import { RightPanel } from "../rightPanel";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CodeInput } from "./codeInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchClient } from "src/utils/legacy-stubs";
import { useTranslation } from "src/translations/useTranslation";
import { authUser } from "src/redux/features/auth/slice";
import { Credentials } from "uiTypes";
import { resetCredentials } from "src/redux/features/authReset/slice";
import commonConstants from "src/themes/constants";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export default function CodeConfirmationScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  //credentials for then=login
  const credentials = useSelector(signUpData);
  const _resetCredentials = useSelector(resetCredentials);
  const [authed, setAuthed] = useState(false);
  const isFocused = useIsFocused();

  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();

  const dispatch = useDispatch();
  const err = useSelector(error);
  const { showSnackOk, showSnackError, Snack } = useSnackBar();

  const { t } = useTranslation();
  // const { returnpage } = route.params;

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
        .post("auth/verify/data", {
          token: route?.params?.token,
          code: verificationCode.code,
          email: credentials?.email || _resetCredentials?.email,
          source: route?.params?.source,
        })
        .then(async () => {
          showSnackOk({ message: t("security.codeAccepted") });
          setTimeout(() => {
            formik.setFieldValue("code", initialValues.code, false);
            switch (route?.params?.then) {
              case "login":
                dispatch(authUser(credentials as Credentials));
                break;
              case "reset":
                navigation.navigate("ResetPassword", {
                  token: `t=${route?.params?.token}&u=${_resetCredentials?.email}`,
                  a: route?.params?.a,
                });
                break;
            }
          }, 2000);
        })
        .catch((resp) => {
          if (resp === "Invalid code") {
            showSnackError({ message: resp });
          } else {
            showSnackError({ message: "An error has occured" });
            formik.resetForm();
          }
        });
    },
  });

  useEffect(() => {
    if (route?.params?.then === "login" && !credentials?.email) {
      navigation.navigate("Login");
    }
    if (route?.params?.then === "reset" && !_resetCredentials?.email) {
      navigation.navigate("Login");
    }
  }, [
    _resetCredentials?.email,
    credentials?.email,
    navigation,
    route?.params?.then,
  ]);

  useEffect(() => {
    if (route?.params?.a) {
      setAuthed(true); //style based on mode
    }
  }, [route?.params]);

  useEffect(() => {
    if (!isFocused && formik.values.code !== initialValues.code) {
      formik.resetForm();
    }
  }, [isFocused, formik, initialValues.code]);

  return (
    <WebFadeIn background={!authed}>
      {/* <View
        style={[
          layoutStyles.splitPane,
          { flex: 1 },
          authed
            ? {
                backgroundColor: "transparent",
                justifyContent: "flex-start",
                flex: 0,
              }
            : {},
        ]}
      > */}
      <KeyboardAwareScrollView
        style={layoutStyles.headerPageCompensation}
        contentContainerStyle={[
          layoutStyles.authPage,
          authed
            ? {
                backgroundColor: commonConstants.appBackground,
                // alignItems: "flex-start",
                // paddingLeft: 6,
                paddingTop: 10,
                justifyContent: "flex-start",
              }
            : {},
        ]}
        testID="auth-page"
        bounces={false}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        {/* <View style={layoutStyles.authImageContainer}>
            <Image
              source={require("../../../../assets/logo.png")}
              style={{
                width: 300,
                height: 300,
              }}
            />
          </View> */}
        <View
          style={[
            formStyles.form,
            authed
              ? {
                  backgroundColor: commonConstants.appBackground,
                }
              : {},
          ]}
          testID="auth-conf-form"
        >
          <Typography
            style={[
              layoutStyles.pageTitle,
              {
                color: commonConstants.black900,
                textAlign: "center",
                alignSelf: "center",
                marginBottom: 10
              },
              authed ? { color: commonConstants.black900 } : {},
            ]}
            type={TypographyTypes.H5}
            text={"Please enter the confirmation code sent to:"}
          />

<Typography
            style={[
              // layoutStyles.pageTitle,
              { width: "100%", marginBottom: 15 },
              { textAlign: "center" },
              { color: '#518EF8'}

            ]}
            type={TypographyTypes.H6}
            text={credentials?.email! || _resetCredentials?.email || ""}
          />

          <Typography
            style={[
              layoutStyles.pageTitle,
              {
                color: commonConstants.black900,
                textAlign: "center",
                alignSelf: "center",
              },
              authed ? { color: commonConstants.black900 } : {},
            ]}
            type={TypographyTypes.Body1}
            text={"Make sure to check your spam folder if you haven't received your code in a few minutes"}
          />
          {/* <Typography
              style={[
                layoutStyles.pageTitle,
                { color: "white", textAlign: "center" },
              ]}
              type={TypographyTypes.Body2}
              text={
                "Please check your email and click the link to complete your registration"
              }
            /> */}

          <View
            style={{
              width: "100%",
            }}
          >
            <CodeInput
              navigation={navigation}
              formik={formik}
              inputStyle={{
                color: authed ? "black" : "black",
                backgroundColor: "white",
              }}
            />
          </View>

          {/* <Typography
              style={[
                layoutStyles.pageTitle,
                { color: "white", textAlign: "center" },
              ]}
              type={TypographyTypes.Body2}
              text={
                "After receiving the email follow the link provided to complete your registration"
              }
            /> */}

          {/* <View style={[formStyles.fieldContainer]}>
              <Button
                onPress={() => navigation.navigate("Login")}
                testID={"Login"}
                title={"Log in"}
              />
            </View>
            <View style={[formStyles.fieldContainer]}>
              <Button
                onPress={() => {
                  dispatch(resendSignUpMail(credentials?.email!));
                }}
                testID={"ResendConfirmation"}
                title={"Send again"}
                type={ButtonTypes.LinkButton}
              />
            </View> */}
        </View>
      </KeyboardAwareScrollView>
      {/* {!authed && <RightPanel />} */}
      <Snack />
      {/* </View> */}
    </WebFadeIn>
  );
}
