/* eslint-disable no-shadow */
import {
  createAsyncThunk,
  createSlice,
  createSelector,
  PayloadAction,
} from "@reduxjs/toolkit";
// REMOVED: import { fetchClient } from "src/utils/legacy-stubs";
import { AppState } from "../../reducer/root-reducer";
import { Credentials, AuthState } from "uiTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Firebase Auth
import { signIn as firebaseSignIn, signUp as firebaseSignUp } from "../../../services/firebase/auth";

const initialState: AuthState = {
  status: "idle",
  roles: undefined,
  user: undefined,
  userId: undefined,
  username: undefined,
  two_factor_auth: 0,
  otp_required: 0,
  language: undefined,
  pinAuthed: undefined,
  hasPin: undefined,
  firebaseUser: undefined,
  authInitialized: false,
};

// Firebase login - KEEP THIS
const authUser = createAsyncThunk(
  "auth",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      console.log("Attempting Firebase login...");
      
      const firebaseUser = await firebaseSignIn(
        credentials.email.trim(),
        credentials.password
      );

      console.log("Firebase login successful:", firebaseUser.uid);

      return {
        user: firebaseUser.email,
        userId: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email,
        roles: [],
        two_factor_auth: 0,
        otp_required: 0,
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        },
      };
    } catch (error: any) {
      console.error("Firebase login failed:", error?.message);
      return rejectWithValue(error?.message || "Authentication failed");
    }
  },
);

// Simple invalidate auth - KEEP THIS
const invalidateAuth = createAsyncThunk("auth/invalidate", async () => {
  console.log("Invalidating auth...");
  await AsyncStorage.removeItem("token");
  return null;
});

// ... rest of your selectors (keep all of them) ...

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state: AuthState) {
      console.log("Clearing auth state");
      Object.assign(state, initialState);
    },
    logOutAction(state) {
      console.log("Logging out");
      Object.assign(state, initialState);
    },
    setFirebaseUser(state, action: PayloadAction<any>) {
      state.firebaseUser = action.payload;
      state.user = action.payload.email;
      state.userId = action.payload.uid;
      state.username = action.payload.displayName || action.payload.email;
      state.status = "fulfilled";
      state.authInitialized = true;
    },
    clearFirebaseUser(state) {
      state.firebaseUser = undefined;
      state.user = undefined;
      state.userId = undefined;
      state.username = undefined;
      state.status = "idle";
      state.authInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // Only keep Firebase auth handlers
    builder.addCase(authUser.pending, (state) => {
      state.status = "pending";
      state.error = undefined;
    });
    builder.addCase(authUser.fulfilled, (state, action) => {
      state.roles = action.payload.roles || [];
      state.user = action.payload.user;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.firebaseUser = action.payload.firebaseUser;
      state.status = "fulfilled";
      state.error = undefined;
    });
    builder.addCase(authUser.rejected, (state, { payload }) => {
      state.user = undefined;
      state.userId = undefined;
      state.username = undefined;
      state.firebaseUser = undefined;
      state.status = "rejected";
      state.error = payload as string;
    });
  },
});

// Selectors
export const error = (state: AppState) => state.auth.error;
export const isTwoFactorAuthEnabled = (state: AppState) => state.auth.two_factor_auth === 1;
export const isOtpRequired = (state: AppState) => state.auth.otp_required === 1;
export const otpToken = (state: AppState) => state.auth.otp_token;
export const selectFirebaseUser = (state: AppState) => state.auth.firebaseUser;
export const selectUserId = (state: AppState) => state.auth.userId || state.auth.firebaseUser?.uid;
export const selectAuthInitialized = (state: AppState) => state.auth.authInitialized;

export { authUser, invalidateAuth };

export const { clearAuth, logOutAction, setFirebaseUser, clearFirebaseUser, setUser: setUserAction } = authSlice.actions;

// Alias setUser for backwards compatibility
export const setUser = setFirebaseUser;

export default authSlice.reducer;