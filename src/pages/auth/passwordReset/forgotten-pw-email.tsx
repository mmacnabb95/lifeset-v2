import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// ADD: Import Firebase Auth
import { resetPassword } from "src/services/firebase/auth";

const useFormStyles = require("../../../themes/form/styles/styles").default;
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

export default function ForgottenPasswordScreen({ navigation }: { navigation: any }) {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        console.log("Sending password reset email to:", values.email);
        
        // Send password reset email via Firebase
        await resetPassword(values.email.trim());
        
        console.log("Password reset email sent successfully");
        
        // Show success message
        setSuccess(
          "Password reset email sent! Check your inbox and follow the instructions."
        );
        
        // Optionally navigate back to login after a delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 3000);

      } catch (err: any) {
        console.error("Password reset error:", err);
        
        // Show user-friendly error message
        if (err.message.includes("user-not-found")) {
          setError("No account found with this email address");
        } else if (err.message.includes("invalid-email")) {
          setError("Invalid email address");
        } else if (err.message.includes("too-many-requests")) {
          setError("Too many attempts. Please try again later");
        } else {
          setError(err.message || "Failed to send reset email. Please try again");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  return (
    <WebFadeIn>
      <KeyboardAwareScrollView
        style={{ height: "100%" }}
        contentContainerStyle={[layoutStyles.authPage, { paddingTop: 20 }]}
        testID="forgot-password-page"
        bounces={false}
        keyboardShouldPersistTaps="handled"
        extraHeight={100}
      >
        <View style={[formStyles.form, { flex: 1, justifyContent: "center" }]}>
          <Typography
            type={TypographyTypes.H1}
            style={layoutStyles.pageTitle}
            text={"Reset Password"}
          />
          <Typography
            type={TypographyTypes.Body1}
            style={layoutStyles.pagePreamble}
            text={"Enter your email to receive a password reset link"}
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

          <View style={[formStyles.fieldContainer, formStyles.authfieldContainer]}>
            <Button
              onPress={() => formik.handleSubmit()}
              title={"Send Reset Link"}
              testID="send-reset-email"
              loading={loading}
            />
            
            {/* Success message */}
            {success && (
              <View style={{ marginTop: 15, padding: 10, backgroundColor: '#e8f5e9', borderRadius: 8 }}>
                <Text style={{ color: '#2e7d32', textAlign: 'center' }}>
                  {success}
                </Text>
              </View>
            )}
            
            {/* Error message */}
            {error && (
              <View style={{ marginTop: 15 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            )}
          </View>

          <View style={[layoutStyles.authAction, { justifyContent: "center", marginTop: 20 }]}>
            <Typography
              type={TypographyTypes.Caption2}
              text={"Remember your password? "}
            />
            <Pressable
              testID="BackToLogin"
              onPress={() => navigation.navigate("Login")}
            >
              <Typography
                type={TypographyTypes.Caption2}
                style={[layoutStyles.link]}
                text={"Back to Login"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </WebFadeIn>
  );
}
