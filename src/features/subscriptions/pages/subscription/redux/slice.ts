/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-shadow */
import { createSlice, createSelector } from "@reduxjs/toolkit";
import { AppState } from "../../../../../redux/reducer/root-reducer";
import { Package } from "../types/revenuCatTypes";

interface SubsState {
  packages: Package[];
}

const initialState: SubsState = {
  packages: [],
};

export const subscriptionPackages = createSelector(
  (state: AppState) => state.subscriptionPackages.packages,
  (packages) => packages,
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearPackages(state: SubsState) {
      Object.assign(state, initialState);
    },
    setPackages(state: SubsState, action) {
      Object.assign(state.packages, action.payload);
    },
  },
});

export const { clearPackages, setPackages } = authSlice.actions;
export default authSlice.reducer;
