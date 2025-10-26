/* eslint-disable no-shadow */
import {
  createAsyncThunk,
  createSlice,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import { fetchClient } from "src/utils/legacy-stubs";
import { AppState } from "../../reducer/root-reducer";

export interface SignUpCredentials {
  email?: string;
  password?: string;
  username?: string;
  fullname?: string;
  phone?: string;

  getNotification?: boolean;

  isTermsAccepted?: boolean;
}

export type SignUpState = {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  error?: string;
  credentials?: SignUpCredentials;
  registrationToken?: string;
};

const initialState: SignUpState = {
  status: "idle",
};

const signupUser = createAsyncThunk(
  "auth/signup",
  async (credentials: SignUpCredentials) => {
    try {
      const { data } = await (
        await fetchClient()
      ).post("auth/signup", {
        ...credentials,
      });
      return data;
    } catch ({ response }) {
      //@ts-ignore
      throw new Error((response as any)?.data?.message || "Error");
    }
  },
);

const resendSignUpMail = createAsyncThunk(
  "auth/signupresend",
  async (email: string) => {
    try {
      const { data } = await (
        await fetchClient()
      ).post("auth/signupresend", {
        email,
      });
      return data;
    } catch ({ response }) {
      //@ts-ignore
      throw new Error((response as any).data.message);
    }
  },
);

const checkUsername = createAsyncThunk(
  "auth/checkusername",
  async (username: string) => {
    try {
      const { data } = await (
        await fetchClient()
      ).get(`auth/checkusername/${username}`);
      return data;
    } catch ({ response }) {
      //@ts-ignore
      throw new Error((response as any).data.message);
    }
  },
);

export const signUpRegistrationToken = createSelector(
  (state: AppState) => state.signup.registrationToken,
  (signupState) => signupState,
);

export const signUpData = createSelector(
  (state: AppState) => state.signup.credentials,
  (signupState) => signupState,
);

export const isLoading = createSelector(
  (state: AppState) => state.signup.status,
  (status) => status === "pending",
);

export const isRejected = createSelector(
  (state: AppState) => state.signup.status,
  (status) => status === "rejected",
);

export const isFulfilled = createSelector(
  (state: AppState) => state.signup.status,
  (status) => status === "fulfilled",
);

export const error = createSelector(
  isRejected,
  (state: AppState) => state.signup.error,
  (rejected, error) => rejected && error,
);

const authSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    setData(state: SignUpState, action: PayloadAction<SignUpCredentials>) {
      Object.assign(state, { credentials: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signupUser.pending || resendSignUpMail.pending, (state) => {
      state.status = "pending";
    });

    builder.addCase(
      signupUser.fulfilled || resendSignUpMail.fulfilled,
      (state, action) => {
        state.registrationToken = action.payload.registrationToken;
        state.status = "fulfilled";
      },
    );

    builder.addCase(
      signupUser.rejected || resendSignUpMail.rejected,
      (state, { error }) => {
        state.status = "rejected";
        state.error = error.message;
      },
    );
  },
});

export { signupUser, checkUsername, resendSignUpMail };

export const { setData } = authSlice.actions;

export default authSlice.reducer;
