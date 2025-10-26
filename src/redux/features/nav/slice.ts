import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";

import { AppState } from "../../reducer/root-reducer";

export type NavState = {
  error?: string;
  keyHistory?: string[];
};

export const keyHistory = createSelector(
  (state: AppState) => state.nav.keyHistory,
  (hist) => hist,
);

const initialState: NavState = {
  keyHistory: [],
};

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    historyPush(state: NavState, action: PayloadAction<string>) {
      state.keyHistory?.push(action.payload);
    },
    historyPop(state: NavState) {
      state.keyHistory?.pop();
    },
  },
});

export const { historyPush, historyPop } = navSlice.actions;

export default navSlice.reducer;
