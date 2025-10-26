import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  // Remove authUser - we'll replace with Firebase
  error,
  invalidateAuth,
  isOtpRequired,
  isTwoFactorAuthEnabled,
  otpToken,
  setUser, // Add this if not already imported
} from "../../../redux/features/auth/slice";
import { Credentials } from "uiTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Input, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import commonConstants from "src/themes/constants";
import { setData } from "src/redux/features/signUp/slice";
import { isAdmin, isCompanyManager } from "src/navigation/utils/roleCheck";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// REMOVE: import { API_BASE_URL } from "src/config/api";
import { useXP } from "src/useXP";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

// ADD: Import Firebase Auth
import { signIn } from "src/services/firebase/auth";

const useFormStyles = require("../../../themes/form/styles/styles").default;
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

export default function LoginScreen({ navigation }: { navigation: any }) {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();
  const dispatch = useDispatch();
  let isTwoFactorEnabled = useSelector(isTwoFactorAuthEnabled);
  let _otpRequired = useSelector(isOtpRequired);
  const _otpToken = useSelector(otpToken);
  const err = useSelector(error);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>("");

  const initialValues: Credentials = {
    show2fa: false,
    email: "",
    password: "",
    code: "",
  };

  // REPLACE: Old handleLogin with Firebase Auth
  const handleLogin = async () => {
    try {
      setLoginError("");
      console.log("Login attempt with Firebase Auth:", {
        email: formik.values.email,
      });

      // Sign in with Firebase
      const user = await signIn(
        formik.values.email.trim(),
        formik.values.password
      );

      console.log("Firebase login successful:", user.uid);

      // Update Redux with Firebase user data
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || formik.values.email,
      }));

      // Navigate to main app
      navigation.navigate("Welcome");

    } catch (error: any) {
      console.error("Firebase login error:", error);
      setLoginError(error.message || "Login failed");
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (credential) => {
      setLoading(true);
      
      // Store email/password for 2FA if needed (keep this for now)
      dispatch(
        setData({
          email: formik.values.email,
          password: formik.values.password,
        }),
      );

      // Call Firebase login
      await handleLogin();

      setLoading(false);

      // Note: Admin/manager checks can be added later
      // For now, all authenticated users can access the app
    },
  });

  // Keep your 2FA logic if you're using it
  useFocusEffect(() => {
    if (isTwoFactorEnabled && formik.values.show2fa === false) {
      AsyncStorage.setItem("authFormik", JSON.stringify(formik.values)).then(
        () => {
          setTimeout(() => {
            dispatch({ type: "RESET_APP" });
            dispatch(invalidateAuth());
          }, 0);
          navigation.navigate("TwoFactor");
        },
      );
    }
  });

  // Keep OTP logic if you're using it
  useEffect(() => {
    if (_otpRequired) {
      console.log("_otpToken", _otpToken);
      navigation.navigate("LoginNeedsOtp", {
        token: _otpToken,
        then: "login",
        source: "login",
      });
    }
  }, [_otpRequired, _otpToken, navigation]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  // Keep XP restoration
  const { restoreUserXP } = useXP();
  const { userId } = useUserInfo();

  useEffect(() => {
    if (userId) {
      restoreUserXP(userId);
    }
  }, [userId]);

  return (
    <WebFadeIn>
      <KeyboardAwareScrollView
        style={{ height: "100%" }}
        contentContainerStyle={[layoutStyles.authPage, { paddingTop: 20 }]}
        testID="auth-page"
        bounces={false}
        keyboardShouldPersistTaps="handled"
        extraHeight={100}
      >
        <View
          style={[
            layoutStyles.authImageContainer,
            { alignSelf: "center", flex: 0 },
          ]}
        ></View>
        <View style={[formStyles.form, { flex: 1, justifyContent: "center" }]}>
          <Typography
            type={TypographyTypes.H1}
            style={layoutStyles.pageTitle}
            text={"Login"}
          />
          <Typography
            type={TypographyTypes.Body1}
            style={layoutStyles.pagePreamble}
            text={"Enter your details to login"}
          />

          <View style={formStyles.fieldContainer}>
            <Input
              testID="email"
              placeholder="Email"
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              value={formik.values.email}
              onKeyPress={handleKeyDown}
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              fieldContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
              errorMessage={
                formik.touched.email && formik.errors.email
                  ? formik.errors.email
                  : ""
              }
            />
          </View>
          <View style={formStyles.fieldContainer}>
            <Input
              testID="password"
              placeholder="Password"
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              value={formik.values.password}
              onKeyPress={handleKeyDown}
              onSubmitEditing={() => formik.handleSubmit()}
              fieldContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
              secureTextEntry
              errorMessage={
                formik.touched.password && formik.errors.password
                  ? formik.errors.password
                  : ""
              }
              textContentType="password"
            />
          </View>

          <View style={[layoutStyles.authAction, { alignItems: "center" }]}>
            <Typography
              type={TypographyTypes.Caption2}
              style={[
                layoutStyles.forgottenPassword,
                { color: commonConstants.black900 },
              ]}
              text={"Forgotten your password? "}
            />
            <Pressable
              testID="ForgottenPassword"
              onPress={() => navigation.navigate("ForgottenPassword")}
            >
              <Typography
                type={TypographyTypes.Caption2}
                style={[layoutStyles.forgottenPassword, layoutStyles.link]}
                text={"Reset password"}
              />
            </Pressable>
          </View>

          <View
            style={[formStyles.fieldContainer, formStyles.authfieldContainer]}
          >
            <Button
              onPress={() => formik.handleSubmit()}
              title={"Login"}
              testID="login"
              loading={loading}
            />
            {/* Show Firebase error messages */}
            <View>
              <Text style={{ color: 'red', marginTop: 10 }}>
                {loginError || (err ? err.toString() : "")}
              </Text>
            </View>
          </View>
          {(Platform.OS !== "web" ||
            process.env.ENV === "CI" ||
            process.env.ENV === "local") && (
            <View
              style={[
                layoutStyles.authAction,
                { justifyContent: "center", width: "100%" },
              ]}
            >
              <Typography
                type={TypographyTypes.Caption2}
                style={[
                  layoutStyles.forgottenPassword,
                  { color: commonConstants.black900 },
                ]}
                text={"Don't have an account? "}
              />
              <Pressable
                testID="SignUp"
                onPress={() => navigation.navigate("SignUp1")}
              >
                <Typography
                  type={TypographyTypes.Caption2}
                  style={[layoutStyles.forgottenPassword, layoutStyles.link]}
                  text={"Sign up "}
                />
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </WebFadeIn>
  );
}