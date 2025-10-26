import React, { useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFormik } from "formik";
import { Credentials } from "uiTypes";
import { useFocusEffect } from "@react-navigation/native";
import { authUser, error } from "src/redux/features/auth/slice";
import { CodeInput } from "./codeInput";
import { Header, Typography, WebFadeIn } from "src/components/common";
import { useTranslation } from "src/translations/useTranslation";
import { TypographyTypes } from "src/components/common/typography";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export const TwoFactor = ({ navigation }: { navigation: any }) => {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();
  const { t } = useTranslation();

  const err = useSelector(error);
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  const initialValues: Credentials = {
    show2fa: true,
    // username: "",
    email: "",
    password: "",
    code: "      ",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      show2fa: Yup.boolean(),
      // username: Yup.string().required("Required"),
      password: Yup.string().required("Required"),
      code: Yup.string().when("show2fa", {
        is: true,
        then: Yup.string().required("Required"),
      }),
    }),
    onSubmit: (credential) => {
      dispatch(authUser(credential));
    },
  });

  useFocusEffect(() => {
    if (!formik.values.email) {
      AsyncStorage.getItem("authFormik").then((af) => {
        if (!af) {
          navigation.navigate("Login");
          return;
        }
        const authFormik: any = JSON.parse(af as string);
        formik.setFieldValue("show2fa", true, false);
        formik.setFieldValue("email", authFormik.email, false);
        formik.setFieldValue("password", authFormik.password, false);
        AsyncStorage.removeItem("authFormik");
        setReady(true);
      });
    }
  });

  if (ready === false) {
    null;
  }

  return (
    <WebFadeIn>
      <View style={layoutStyles.authPage} testID="auth-page">
        <View style={[formStyles.form]}>
          <Typography
            type={TypographyTypes.Body1}
            style={[formStyles.form, { marginBottom: 20 }]}
            text={t("security.enterCode")}
          />
          <CodeInput formik={formik} navigation={navigation} error={err} />
        </View>
      </View>
    </WebFadeIn>
  );
};
