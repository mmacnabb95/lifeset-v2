import { combineReducers } from "@reduxjs/toolkit";
import auth from "../features/auth/slice";
import authreset from "../features/authReset/slice";
import signup from "../../redux/features/signUp/slice";
// import leftMenu from "../features/leftMenu/slice";
// import users from "../features/users/slice";
import domain from "../domain/features";
import userInfo from "../features/userInfo/slice";
// import notifications from "../features/notificationCenter/slice";
// import subscriptionsInfo from "../features/subscriptionTypeInformations/slice";
import account from "../features/auth/account-slice";
import fileCache from "../features/fileCache/slice";
import uploadFile from "../features/uploadFile/slice";
import nav from "../features/nav/slice";
import misc from "../features/misc/slice";
// import adminSignup from "../../redux/features/adminSignUp/slice";
import subscriptionViews from "../../features/subscriptions/redux/domain/features/subscriptionView/collection-slice";
import subscriptionPackages from "../../features/subscriptions/pages/subscription/redux/slice";
import xp from "../domain/features/xp/collection-slice";

const reducers = {
  auth,
  account,
  authreset,
  signup,
  userInfo,
  fileCache,
  uploadFile,
  nav,
  misc,
  subscriptionViews,
  subscriptionPackages,
  xp,
};

const allReducers = { ...reducers, ...domain };

const appReducer = combineReducers(allReducers);

const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    state = undefined;
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
