import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { error, setUser } from "../../../redux/features/auth/slice";
import {
  SignUpCredentials,
  checkUsername,
  isFulfilled,
  setData,
  signUpRegistrationToken,
  // REMOVE: signupUser - we'll use Firebase instead
} from "src/redux/features/signUp/slice";
import {
  Body,
  Button,
  Input,
  Typography,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";
import { languagePreference } from "src/redux/features/misc/slice";
import { passwordRegex, passwordStrengthMessage } from "../utils";

// ADD: Import Firebase Auth
import { signUp } from "src/services/firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "src/services/firebase/config";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export default function SignUpScreen1({ navigation }: { navigation: any }) {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();
  const { width: windowWidth } = useWindowDimensions();

  const _signUpRegistrationToken = useSelector(signUpRegistrationToken);
  const fulfilled = useSelector(isFulfilled);
  const language = useSelector(languagePreference);
  const passwordRequiredText = "Required";

  const dispatch = useDispatch();
  const err = useSelector(error);
  const [usernameAvailable, setUsernameAvailable] = useState<
    undefined | boolean
  >(undefined);
  const [signupError, setSignupError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const initialValues = {
    fullname: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  };

  // ADD: Firebase signup handler
  const handleSignup = async () => {
    try {
      setSignupError("");
      setLoading(true);
      
      console.log("Signing up with Firebase Auth:", {
        email: formik.values.email,
        username: formik.values.username,
      });

      // Create Firebase auth user
      const user = await signUp(
        formik.values.email.trim(),
        formik.values.password,
        formik.values.username
      );

      console.log("Firebase signup successful:", user.uid);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: formik.values.username,
        fullname: formik.values.fullname,
        phone: formik.values.phone || "",
        createdAt: new Date().toISOString(),
        language: language,
        xp: 0,
        level: 1,
      });

      // Update Redux with Firebase user data
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: formik.values.username,
        fullname: formik.values.fullname,
      }));

      // Navigate to email verification or dashboard
      // You can skip verification for now and go straight to the app
      navigation.navigate("Welcome");
      
      // OR if you want email verification:
      // navigation.navigate("EmailVerification");

    } catch (error: any) {
      console.error("Firebase signup error:", error);
      setSignupError(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      fullname: Yup.string()
        .max(50, "Must be 50 characters or less")
        .min(5, "Must be 5 characters or more")
        .required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      username: Yup.string()
        .max(30, "Must be 30 characters or less")
        .min(5, "Must be 5 characters or more")
        .required("Required")
        .matches(
          /^[a-zA-Z0-9_]*$/,
          "Username can only contain letters, numbers and underscores"
        ),
      password: Yup.string()
        .required("Required")
        .matches(passwordRegex, passwordStrengthMessage)
        .required(passwordRequiredText),
    }),
    onSubmit: async () => {
      if (usernameAvailable === true) {
        // Store email/password for any future use
        dispatch(
          setData({
            email: formik.values.email,
            password: formik.values.password,
          }),
        );
        
        // Call Firebase signup
        await handleSignup();
      }
    },
  });

  // Keep username availability check (you can integrate with Firestore later)
  const checkUserNameAvailability = async (text: string) => {
    if (text?.length < 5) {
      setUsernameAvailable(undefined);
      return;
    }
    
    // For now, use the old check if it still works
    // TODO: Later, check against Firestore users collection
    const result = await dispatch(checkUsername(text));
    if ((result as any).payload === true) {
      setUsernameAvailable(true);
    } else {
      setUsernameAvailable(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  // Remove or update the old signup flow
  // useEffect(() => {
  //   if (fulfilled && _signUpRegistrationToken) {
  //     navigation.navigate("SignUpConfirmation", {
  //       token: _signUpRegistrationToken,
  //       then: "login",
  //       source: "registration",
  //     });
  //   }
  // }, [_signUpRegistrationToken, fulfilled, navigation]);

  if (
    Platform.OS === "web" &&
    process.env.ENV !== "CI" &&
    process.env.ENV !== "local"
  ) {
    return navigation.navigate("Login");
  }

  return (
    <WebFadeIn>
      <Body style={{ minHeight: "100%", width: "100%" }}>
        <View
          style={[
            layoutStyles.authPage,
            {
              width: "100%",
              justifyContent: "space-between",
            },
          ]}
          testID="auth-page"
        >
          <View style={[formStyles.form]}>
            <Typography
              style={layoutStyles.pageTitle}
              type={TypographyTypes.H1}
              text={"Sign up"}
            />

            <Input
              testID="fullname"
              placeholder="Full name"
              onChangeText={formik.handleChange("fullname")}
              onBlur={formik.handleBlur("fullname")}
              value={formik.values.fullname}
              onKeyPress={handleKeyDown}
              autoComplete={"off"}
              errorMessage={
                formik.touched.fullname && formik.errors.fullname
                  ? formik.errors.fullname
                  : undefined
              }
            />
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
              errorMessage={
                formik.touched.email && formik.errors.email
                  ? "Invalid email"
                  : undefined
              }
            />
            <View style={{ width: "100%" }}>
              <Input
                testID="username"
                placeholder="Username"
                onChangeText={(e) => {
                  formik.handleChange("username")(e);
                  checkUserNameAvailability(e);
                }}
                onBlur={formik.handleBlur("username")}
                value={formik.values.username}
                onKeyPress={handleKeyDown}
                autoComplete={"off"}
                errorMessage={
                  formik.touched.username && formik.errors.username
                    ? formik.errors.username
                    : undefined
                }
              />
              {usernameAvailable === true && (
                <Typography
                  style={[
                    formStyles.underFieldMessage,
                    {
                      position: "absolute",
                      top: 25,
                      right: 16,
                      fontSize: 12,
                      color: "green",
                    },
                  ]}
                  type={TypographyTypes.InputSuccessText}
                  testID={"Available"}
                  text={"Available"}
                />
              )}
              {usernameAvailable === false && (
                <Typography
                  style={[
                    formStyles.underFieldMessage,
                    { position: "absolute", top: 28, right: 16, fontSize: 12 },
                  ]}
                  type={TypographyTypes.InputErrorText}
                  testID={"Unavailable"}
                  text={"Unavailable"}
                />
              )}
            </View>
            <Input
              testID="password"
              placeholder="Password"
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              value={formik.values.password}
              onKeyPress={handleKeyDown}
              autoComplete={"off"}
              secureTextEntry
              errorMessage={
                formik.touched.password &&
                formik.errors.password === passwordRequiredText
                  ? passwordRequiredText
                  : ""
              }
            />

            <View style={{ height: 60 }}>
              <Text style={{ color: 'red' }}>
                {formik.errors.password &&
                formik.errors.password !== passwordRequiredText
                  ? (formik.errors.password as string)
                  : ""}
              </Text>
            </View>

            <View style={[layoutStyles.spacedButton, { height: 80 }]}>
              <Button
                onPress={() => formik.handleSubmit()}
                testID={"SignUp"}
                title="Next"
                loading={loading}
              />
              <View>
                <Text style={{ color: 'red', marginTop: 10 }}>
                  {signupError || (err ? (err as string) : "")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Body>
    </WebFadeIn>
  );
}