import React from "react";
import { Image, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Body, Button, Typography, WebFadeIn } from "src/components/common";
import { resendSignUpMail, signUpData } from "src/redux/features/signUp/slice";
import { TypographyTypes } from "../../../components/common/typography";
import { ButtonTypes } from "../../../components/common/button";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export default function SignUpConfirmationScreen({
  navigation,
}: {
  navigation: any;
}) {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();

  const dispatch = useDispatch();
  const credentials = useSelector(signUpData);

  return (
    <WebFadeIn>
      <Body>
        <View style={[layoutStyles.authPage]} testID="auth-page">
          <View style={layoutStyles.authImageContainer}>
            <Image
              source={require("../../../../assets/logo.png")}
              style={{
                width: 120,
                height: 120,
              }}
            />
          </View>
          <View style={[formStyles.form]} testID="auth-conf-form">
            <Typography
              style={layoutStyles.pageTitle}
              type={TypographyTypes.H1}
              text={"Confirmation sent"}
            />

            <Button
              onPress={() => navigation.navigate("Login")}
              testID={"Login"}
              title={"Log in"}
              style={{ marginBottom: 10 }}
            />
            <Button
              onPress={() => {
                dispatch(resendSignUpMail(credentials?.email!));
              }}
              testID={"ResendConfirmation"}
              title={"Send again"}
              type={ButtonTypes.LinkButton}
            />
          </View>
        </View>
      </Body>
    </WebFadeIn>
  );
}
