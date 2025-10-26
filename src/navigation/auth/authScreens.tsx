import React from "react";
import {
  LazyChangeEmail,
  LazyChangePassword,
  LazyChangeUsername,
  LazyConfirmNumber,
  LazyPersonalDetails,
  LazyPhoneNumber,
  LazySecurity,
  LazySettings,
} from "../lazy/loader";
import ForgottenPasswordScreen from "src/pages/auth/passwordReset/forgotten-pw-email";
import ResetPWScreen from "src/pages/auth/passwordReset/reset-pw-page";
// REMOVED: ChangeEmailVerification - Firebase handles email verification automatically
// import ChangeEmailVerificationScreen from "src/pages/auth/signUp/changeEmailVerification";
import CodeConfirmationScreen from "src/pages/auth/twoFactor/codeConfirmation";

export const AuthScreens = ({ Navigator }: { Navigator: any }) => {
  return (
    <React.Fragment>
      <Navigator.Screen name="Settings" component={LazySettings} />
      <Navigator.Screen
        name="PersonalDetails"
        component={LazyPersonalDetails}
      />
      <Navigator.Screen name="Security" component={LazySecurity} />
      <Navigator.Screen name="ChangePassword" component={LazyChangePassword} />
      <Navigator.Screen name="ChangeEmail" component={LazyChangeEmail} />
      <Navigator.Screen name="ChangeUsername" component={LazyChangeUsername} />
      <Navigator.Screen name="PhoneNumber" component={LazyPhoneNumber} />
      <Navigator.Screen name="ConfirmNumber" component={LazyConfirmNumber} />
      <Navigator.Screen
        name="ForgottenPassword"
        component={ForgottenPasswordScreen}
      />
      {/* REMOVED: Firebase handles email verification automatically */}
      {/* <Navigator.Screen
        name="ChangeEmailVerification"
        component={ChangeEmailVerificationScreen}
      /> */}
      <Navigator.Screen
        name="ForgottenPasswordConfirmation"
        component={CodeConfirmationScreen}
      />
      <Navigator.Screen name="ResetPassword" component={ResetPWScreen} />
    </React.Fragment>
  );
};
