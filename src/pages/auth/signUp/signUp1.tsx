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
import { error } from "../../../redux/features/auth/slice";
import {
  SignUpCredentials,
  checkUsername,
  isFulfilled,
  setData,
  signUpRegistrationToken,
  signupUser,
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

  const initialValues = {
    fullname: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      fullname: Yup.string()
        .max(50, "Must be 50 characters or less")
        .min(5, "Must be 5 characters or more")
        .required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      // phone: Yup.string().required("Required"),
      username: Yup.string()
        .max(30, "Must be 50 characters or less")
        .min(5, "Must be 5 characters or more")
        .required("Required"),
      password: Yup.string()
        .required("Required")
        .matches(passwordRegex, passwordStrengthMessage)
        .required(passwordRequiredText),
    }),
    onSubmit: () => {
      if (usernameAvailable === true) {
        const signupCredentials: SignUpCredentials = {
          ...{ language },
          ...formik.values,
        };
        dispatch(
          setData({
            email: formik.values.email,
            password: formik.values.password,
          }),
        );
        dispatch(signupUser(signupCredentials));
      }
    },
  });

  const checkUserNameAvailability = async (text: string) => {
    if (text?.length < 5) {
      setUsernameAvailable(undefined);
      return;
    }
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

  useEffect(() => {
    if (fulfilled && _signUpRegistrationToken) {
      console.log("_signUpRegistrationToken", _signUpRegistrationToken);
      navigation.navigate("SignUpConfirmation", {
        token: _signUpRegistrationToken,
        then: "login",
        source: "registration",
      });
    }
  }, [_signUpRegistrationToken, fulfilled, navigation]);

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
          {/* <View style={[layoutStyles.authImageContainer, { width: "100%" }]}>
            <Image
              source={require("../../../../assets/in-app-icon-with-text.png")}
              style={{
                width: "100%",
                height: (windowWidth - 40) * 0.349,
              }}
            />
          </View> */}
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
            {/* <Input
              testID="phone"
              placeholder="Phone Number"
              onChangeText={formik.handleChange("phone")}
              onBlur={formik.handleBlur("phone")}
              value={formik.values.phone}
              onKeyPress={handleKeyDown}
              autoComplete={"off"}
              errorMessage={
                formik.touched.phone && formik.errors.phone
                  ? formik.errors.phone
                  : undefined
              }
            /> */}
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
              <Text>
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
              />
              <View>
                <Text>{err ? (err as string) : ""}</Text>
              </View>
            </View>
          </View>
        </View>
      </Body>
    </WebFadeIn>
  );
}
