import React, { useEffect } from "react";
import { Image, Platform, ScrollView, Text, View } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";

import {
  error,
  isFulfilled,
  setData,
  SignUpCredentials,
  signUpData,
  signUpRegistrationToken,
  signupUser,
} from "src/redux/features/signUp/slice";
import { passwordRegex, passwordStrengthMessage } from "../utils";
import { languagePreference } from "src/redux/features/misc/slice";
import {
  AuthHeader,
  Body,
  Button,
  Input,
  Typography,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import commonConstants from "src/themes/constants";
// import { RightPanel } from "../rightPanel";
import { SafeArea } from "src/components/common/safeArea/safeArea";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;

export default function SignUpScreen2({ navigation }: { navigation: any }) {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();
  const inputStyles = useInputStyles();

  const dispatch = useDispatch();
  const err = useSelector(error);
  const signUp1Data = useSelector(signUpData);
  const _signUpRegistrationToken = useSelector(signUpRegistrationToken);
  const language = useSelector(languagePreference);
  const fulfilled = useSelector(isFulfilled);
  const passwordRequiredText = "Required";

  const initialValues = {
    email: "",
    fullname: "",
    password: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      fullname: Yup.string().required("Required"),
      password: Yup.string()
        .required("Required")
        .matches(passwordRegex, passwordStrengthMessage)
        .required(passwordRequiredText),
    }),
    onSubmit: () => {
      const signupCredentials: SignUpCredentials = {
        ...{ language },
        ...(signUp1Data as SignUpCredentials),
        ...formik.values,
      };
      dispatch(
        setData({
          email: formik.values.email,
          password: formik.values.password,
        }),
      );
      dispatch(signupUser(signupCredentials));
    },
  });

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  useEffect(() => {
    if (fulfilled && _signUpRegistrationToken) {
      // console.log("_signUpRegistrationToken", _signUpRegistrationToken);
      navigation.navigate("SignUpConfirmation", {
        token: _signUpRegistrationToken,
        then: "login",
        source: "registration",
      });
    }
  }, [_signUpRegistrationToken, fulfilled, navigation]);

  return (
    <WebFadeIn>
      <SafeArea>
        <View style={layoutStyles.splitPane}>
          <KeyboardAwareScrollView
            contentContainerStyle={[layoutStyles.authPage]}
            testID="auth-page"
            bounces={true}
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            {/* <View style={layoutStyles.authImageContainer}>
            <Image
              style={{ height: 300, width: 300 }}
              source={require("../../../../assets/logo.png")}
            />
          </View> */}
            <View style={[formStyles.form]}>
              <View style={{ height: 100, marginTop: 30 }} />
              <AuthHeader title={"Sign up"} />

              <View style={[formStyles.fieldContainer, { width: "100%" }]}>
                <Input
                  testID="fullName"
                  placeholder="Name"
                  onChangeText={formik.handleChange("fullname")}
                  onBlur={formik.handleBlur("fullname")}
                  value={formik.values.fullname}
                  onKeyPress={handleKeyDown}
                  autoComplete={"off"}
                  errorMessage={
                    formik.touched.fullname && formik.errors.fullname
                      ? "Required"
                      : undefined
                  }
                  inputStyle={[
                    inputStyles.authInput,
                    {
                      color: commonConstants.white,
                    },
                  ]}
                />
              </View>

              <View style={[formStyles.fieldContainer, { width: "100%" }]}>
                <Input
                  testID="email-signup"
                  placeholder="Email"
                  autoCapitalize="none"
                  onChangeText={formik.handleChange("email")}
                  onBlur={formik.handleBlur("email")}
                  value={formik.values.email}
                  onKeyPress={handleKeyDown}
                  autoComplete={"off"}
                  errorMessage={
                    formik.touched.email && formik.errors.email
                      ? "Invalid email"
                      : undefined
                  }
                  inputStyle={[
                    inputStyles.authInput,
                    {
                      color: commonConstants.white,
                    },
                  ]}
                />
              </View>
              <View style={[formStyles.fieldContainer, { width: "100%" }]}>
                <Input
                  testID="password-signup"
                  placeholder="Password"
                  onChangeText={formik.handleChange("password")}
                  onBlur={formik.handleBlur("password")}
                  value={formik.values.password}
                  onKeyPress={handleKeyDown}
                  secureTextEntry
                  errorMessage={
                    formik.touched.password &&
                    formik.errors.password === passwordRequiredText
                      ? passwordRequiredText
                      : ""
                  }
                  inputStyle={[
                    {
                      color: commonConstants.white,
                    },
                  ]}
                  autoComplete={"off"}
                />
              </View>

              <View
                style={[formStyles.fieldContainer, layoutStyles.spacedButton]}
              >
                <Button
                  onPress={() => formik.handleSubmit()}
                  testID={"SignUp"}
                  title={"Sign up"}
                />
                <View style={{ height: 100, marginTop: 30 }}>
                  <Typography
                    type={TypographyTypes.Body1}
                    text={
                      err
                        ? (err as string)
                        : formik.touched.password &&
                          formik.errors.password &&
                          formik.errors.password !== "Required"
                        ? formik.errors.password
                        : ""
                    }
                    style={{ color: "white" }}
                  />
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
          {/* <RightPanel /> */}
        </View>
      </SafeArea>
    </WebFadeIn>
  );
}
