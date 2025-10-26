import {
  createSelector,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchClient } from "src/utils/legacy-stubs";
import { AppState } from "src/redux/reducer/root-reducer";

export interface Account {
  userId: number;
  suspended?: boolean;
}

export interface AccountItemState {
  item?: Account;
  status: string;
  error?: string;
}

const initialState: AccountItemState = {
  item: undefined,
  status: "idle",
};

export const getAccount = createAsyncThunk(
  "get/account",
  async (id: number) => {
    const { data } = await (await fetchClient()).get(`account/${id}`);
    return data;
  },
);

export const updateAccount = createAsyncThunk(
  "put/account-update",
  async (account: Partial<Account>) => {
    const { data } = await (
      await fetchClient()
    ).put("account-update", {
      account: account,
    });
    return data;
  },
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAccount.pending || updateAccount.pending,
      (state: AccountItemState) => {
        state.status = "pending";
      },
    );
    builder.addCase(
      getAccount.fulfilled || updateAccount.fulfilled,
      (state: AccountItemState, action) => {
        state.item = action.payload;
        state.status = "fulfilled";
      },
    );
    builder.addCase(
      getAccount.rejected || updateAccount.rejected,
      (state, { error }) => {
        state.status = "rejected";
        state.error = error.message;
      },
    );
  },
});

export const accountSelector = createSelector(
  (state: AppState) => state.account,
  (state) => state.item,
);

export const accountLoading = createSelector(
  (state: AppState) => state.account.status,
  (status) => status !== "fulfilled",
);

export const accountErrorSelector = createSelector(
  (state: AppState) => state.account,
  (status) => status.error,
);

export default accountSlice.reducer;
