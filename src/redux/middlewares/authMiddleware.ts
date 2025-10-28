import { Middleware } from "@reduxjs/toolkit";
import { authUser, reAuth } from "../features/auth/slice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resendSignUpMail, signupUser } from "../features/signUp/slice";

const authMiddleware: Middleware = (store) => (next) => (action) => {
  if (action === undefined) {
    return;
  }

  console.log('🔧 authMiddleware - Action type:', action.type);

  if (
    action.type === authUser.fulfilled.toString() ||
    action.type === reAuth.fulfilled.toString()
  ) {
    console.log('✅ authMiddleware - Auth fulfilled, saving token');
    if (action?.payload?.token && !action?.payload?.otp_required) {
      AsyncStorage.setItem("token", action.payload.token).then(() =>
        next(action),
      );
      return;
    }
  }

  if (action.type === signupUser.fulfilled.toString()) {
    console.log('✅ authMiddleware - Signup fulfilled, saving token');
    if (action?.payload?.token) {
      AsyncStorage.setItem("signup", action.payload.token).then(() =>
        next(action),
      );
      return;
    }
  }

  if (
    action.type === authUser.rejected.toString() ||
    action.type === reAuth.rejected.toString() ||
    action.type === signupUser.rejected.toString() ||
    action.type === resendSignUpMail.rejected.toString()
  ) {
    console.log('❌ authMiddleware - Auth rejected! Clearing tokens and dispatching RESET_APP');
    console.log('❌ This might be causing the logout issue!');
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("signup");
    store.dispatch({ type: "RESET_APP" });
  }

  next(action);
};

export default authMiddleware;
