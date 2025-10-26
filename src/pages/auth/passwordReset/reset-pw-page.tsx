import React, { useState } from "react";
import { View, Text } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Firebase handles password reset via email links
// This screen is for confirming a new password with the oobCode from the email

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export default function ResetPWScreen({ 
  navigation, 
  route 
}: { 
  navigation: any; 
  route?: any;
}) {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // Get the oobCode from route params (passed from deep link)
  const oobCode = route?.params?.oobCode || route?.params?.token || "";

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        // TODO: Implement Firebase confirmPasswordReset when deep linking is set up
        // For now, just show a message
        console.log("Password reset with code:", oobCode);
        
        if (!oobCode) {
          setError("Invalid or expired reset link. Please request a new password reset.");
          return;
        }

        // Import dynamically to avoid bundling issues
        const { getAuth, confirmPasswordReset } = await import('firebase/auth');
        const auth = getAuth();
        
        await confirmPasswordReset(auth, oobCode, values.password);
        
        console.log("Password reset successful");
        setSuccess(true);
        
        // Navigate to login after a delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);

      } catch (err: any) {
        console.error("Password reset error:", err);
        
        // Show user-friendly error message
        if (err.code === "auth/expired-action-code") {
          setError("Reset link has expired. Please request a new one.");
        } else if (err.code === "auth/invalid-action-code") {
          setError("Invalid reset link. Please request a new one.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. Please use a stronger password.");
        } else {
          setError(err.message || "Failed to reset password. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return (
      <WebFadeIn>
        <View style={[layoutStyles.authPage, { justifyContent: "center", alignItems: "center" }]}>
          <View style={{ padding: 20, backgroundColor: '#e8f5e9', borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ color: '#2e7d32', textAlign: 'center', fontSize: 16 }}>
              Password reset successful! Redirecting to login...
            </Text>
          </View>
        </View>
      </WebFadeIn>
    );
  }

  if (!oobCode) {
    return (
      <WebFadeIn>
        <View style={[layoutStyles.authPage, { justifyContent: "center", alignItems: "center" }]}>
          <View style={{ padding: 20 }}>
            <Typography
              type={TypographyTypes.H1}
              style={layoutStyles.pageTitle}
              text={"Invalid Reset Link"}
            />
            <Typography
              type={TypographyTypes.Body1}
              style={{ marginTop: 20, textAlign: 'center' }}
              text={"This password reset link is invalid or has expired. Please request a new one."}
            />
            <Button
              onPress={() => navigation.navigate("ForgottenPassword")}
              title={"Request New Link"}
              testID="request-new-link"
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </WebFadeIn>
    );
  }

  return (
    <WebFadeIn>
      <KeyboardAwareScrollView
        style={{ height: "100%" }}
        contentContainerStyle={[layoutStyles.authPage, { paddingTop: 20 }]}
        testID="reset-password-page"
        bounces={false}
        keyboardShouldPersistTaps="handled"
        extraHeight={100}
      >
        <View style={[formStyles.form, { flex: 1, justifyContent: "center" }]}>
          <Typography
            type={TypographyTypes.H1}
            style={layoutStyles.pageTitle}
            text={"Set New Password"}
          />
          <Typography
            type={TypographyTypes.Body1}
            style={layoutStyles.pagePreamble}
            text={"Enter your new password below"}
          />

          <View style={formStyles.fieldContainer}>
            <Input
              testID="password"
              placeholder="New Password"
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              value={formik.values.password}
              secureTextEntry
              textContentType="newPassword"
              fieldContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
              errorMessage={
                formik.touched.password && formik.errors.password
                  ? formik.errors.password
                  : ""
              }
            />
          </View>

          <View style={formStyles.fieldContainer}>
            <Input
              testID="confirmPassword"
              placeholder="Confirm Password"
              onChangeText={formik.handleChange("confirmPassword")}
              onBlur={formik.handleBlur("confirmPassword")}
              value={formik.values.confirmPassword}
              secureTextEntry
              textContentType="newPassword"
              onSubmitEditing={() => formik.handleSubmit()}
              fieldContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
              errorMessage={
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? formik.errors.confirmPassword
                  : ""
              }
            />
          </View>

          <View style={[formStyles.fieldContainer, formStyles.authfieldContainer]}>
            <Button
              onPress={() => formik.handleSubmit()}
              title={"Reset Password"}
              testID="reset-password-submit"
              loading={loading}
            />
            
            {/* Error message */}
            {error && (
              <View style={{ marginTop: 15 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </WebFadeIn>
  );
}
