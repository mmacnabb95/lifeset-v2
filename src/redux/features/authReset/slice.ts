/* eslint-disable no-shadow */
import {
  createAsyncThunk,
  createSlice,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
import { fetchClient } from "../../../utils/legacy-stubs"; // DEPRECATED: Replace with Firebase password reset
import { AppState } from "../../reducer/root-reducer";

export interface AuthResetCredentials {
  email: string;
}

export type AuthResetState = {
  status: "idle" | "pending" | "fulfilled" | "rejected";
  error?: string;
  credentials?: AuthResetCredentials;
  resetToken?: string;
};

const initialState: AuthResetState = {
  status: "idle",
};

const authReset = createAsyncThunk(
  "auth/reset",
  async (credentials: AuthResetCredentials) => {
    try {
      const { data } = await (
        await fetchClient()
      ).post("auth/reset", {
        ...credentials,
      });
      return data;
    } catch ({ response }) {
      //@ts-ignore
      throw new Error((response as any).data.message);
    }
  },
);

export const resetCredentials = createSelector(
  (state: AppState) => state.authreset.credentials,
  (signupState) => signupState,
);

export const passwordResetToken = createSelector(
  (state: AppState) => state.authreset.resetToken,
  (signupState) => signupState,
);

export const isLoading = createSelector(
  (state: AppState) => state.authreset.status,
  (status) => status === "pending",
);

export const isRejected = createSelector(
  (state: AppState) => state.authreset.status,
  (status) => status === "rejected",
);

export const isFulfilled = createSelector(
  (state: AppState) => state.authreset.status,
  (status) => status === "fulfilled",
);

export const error = createSelector(
  isRejected,
  (state: AppState) => state.authreset.error,
  (rejected, error) => rejected && error,
);

const authSlice = createSlice({
  name: "authreset",
  initialState,
  reducers: {
    setData(
      state: AuthResetState,
      action: PayloadAction<AuthResetCredentials>,
    ) {
      Object.assign(state, { credentials: action.payload });
    },
    clearAuthReset(state: AuthResetState) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authReset.pending, (state) => {
      state.status = "pending";
    });

    builder.addCase(authReset.fulfilled, (state, action) => {
      state.resetToken = action.payload.resetToken;
      state.status = "fulfilled";
    });

    builder.addCase(authReset.rejected, (state, { error }) => {
      state.status = "rejected";
      state.error = error.message;
    });
  },
});

export { authReset };

export const { setData, clearAuthReset } = authSlice.actions;

export default authSlice.reducer;
