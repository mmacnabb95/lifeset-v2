import { createSlice, createSelector } from "@reduxjs/toolkit";
import { AppState } from "../../reducer/root-reducer";

export interface Files {
  [key: string]: string;
}

export interface FileCacheState {
  files: Files;
}

const initialState: FileCacheState = {
  files: {},
};

const fileCacheSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    addToCache(state: FileCacheState, action) {
      state.files[action.payload.key] = action.payload.value;
    },
  },
});

export const fileCacheSelector = createSelector(
  (state: AppState) => state.fileCache,
  (state) => state.files,
);

export const { addToCache } = fileCacheSlice.actions;
export default fileCacheSlice.reducer;
