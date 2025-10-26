import {
  createAsyncThunk,
  createSlice,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AppState } from "../../reducer/root-reducer";
import { fetchClient } from "src/utils/legacy-stubs";
import { UserState } from "uiTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "src/translations/types";

const initialState: UserState = {
  status: "idle",
  userInfo: {},
  subscriptionstatus: undefined,
  other: undefined,
  error: undefined,
};

export const setUserInfo = createAsyncThunk(
  "set/user-info",
  async (params: {}) => {
    const { data } = await (
      await fetchClient()
    ).post("set-user-info", { ...params });
    return data;
  },
);

export const getUserInfo = createAsyncThunk("get/user-info", async () => {
  if (!(await AsyncStorage.getItem("token"))) {
    return;
  }

  let { data } = await (await fetchClient()).get("get-user-info", {});
  // clean db call
  return data;
});

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setLanguage(state: UserState, action: PayloadAction<Language>) {
      state.userInfo.language = action.payload;
    },
    clearUserInfoItems(state: UserState) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setUserInfo.pending, (state: UserState) => {
      state.status = "pending";
    });
    builder.addCase(setUserInfo.fulfilled, (state: UserState, action) => {
      state.userInfo = action.payload;
      state.status = "fulfilled";
    });

    builder.addCase(getUserInfo.pending, (state: UserState) => {
      state.status = "pending";
    });
    builder.addCase(getUserInfo.fulfilled, (state: UserState, action) => {
      state.userInfo = action.payload;
      state.status = "fulfilled";
    });
  },
});

const userStateSelector = (state: AppState): UserState => state.userInfo;

export const userInfoLoading = createSelector(
  (state: AppState) => state.userInfo.status,
  (status) => status === "pending",
);

export const getUserInfoSelector = createSelector(
  userStateSelector,
  (userInfo) => userInfo.userInfo,
);

export const getUserSubscriptionStatusSelector = createSelector(
  userStateSelector,
  (userInfo) => userInfo.subscriptionstatus,
);

export const { setLanguage, clearUserInfoItems } = userInfoSlice.actions;

export default userInfoSlice.reducer;
