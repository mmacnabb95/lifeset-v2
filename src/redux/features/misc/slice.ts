import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { PredefinedHabit } from "src/pages/user/predefinedHabits/habitTile";

import { AppState } from "../../reducer/root-reducer";
import { ScheduledHabit } from "src/pages/user/predefinedHabits/predefinedHabits";
import store from "src/redux/stores/store";
import _ from "lodash";

export interface Progress {
  total: number;
  progress: number;
  show: boolean;
}

export type MiscState = {
  error?: string;
  pendingNumber?: string;
  language?: number;
  forceNav?: boolean;
  videoPlayerFullScreen?: boolean;
  progress?: Progress;
  routeName?: string;
  headerTitle?: string | undefined;
  predefinedHabit?: PredefinedHabit | ScheduledHabit | undefined;
  showAuthModal?: boolean;
  authModalAuthAbandoned?: boolean;
  adminMode?: boolean;
  habitApiBusy?: number[];
};

export const habitApiBusy = (id: number) => (state: AppState) => {
  return state.misc.habitApiBusy?.includes(id);
};

export const adminMode = createSelector(
  (state: AppState) => state.misc.adminMode,
  (num) => num,
);

export const showAuthModal = createSelector(
  (state: AppState) => state.misc.showAuthModal,
  (num) => num,
);

export const predefinedHabit = createSelector(
  (state: AppState) => state.misc.predefinedHabit,
  (num) => num,
);

export const headerTitle = createSelector(
  (state: AppState) => state.misc.headerTitle,
  (num) => num,
);

export const progress = createSelector(
  (state: AppState) => state.misc.progress,
  (num) => num,
);

export const videoPlayerFullScreen = createSelector(
  (state: AppState) => state.misc.videoPlayerFullScreen,
  (num) => num,
);

export const pendingNumber = createSelector(
  (state: AppState) => state.misc.pendingNumber,
  (num) => num,
);

export const languagePreference = createSelector(
  (state: AppState) => state.misc.language,
  (num) => num,
);

export const forceNav = createSelector(
  (state: AppState) => state.misc.forceNav,
  (num) => num,
);

export const routeName = createSelector(
  (state: AppState) => state.misc.routeName,
  (num) => num,
);

const initialState: MiscState = {
  pendingNumber: "",
};

const miscSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setHabitApiBusy(state: MiscState, action: PayloadAction<number>) {
      if (!state.habitApiBusy) {
        state.habitApiBusy = [];
      }
      state.habitApiBusy?.push(action.payload);
    },
    setHabitApiNotBusy(state: MiscState, action: PayloadAction<number>) {
      state.habitApiBusy = _.remove(
        state.habitApiBusy as number[],
        action.payload,
      );
    },
    setPendingNumber(state: MiscState, action: PayloadAction<string>) {
      state.pendingNumber = action.payload;
    },
    setForceNav(state: MiscState, action: PayloadAction<boolean>) {
      state.forceNav = action.payload;
    },
    setRouteName(state: MiscState, action: PayloadAction<string | undefined>) {
      state.routeName = action.payload;
    },
    clearPendingNumber(state: MiscState) {
      state.pendingNumber = "";
    },
    setLanguage(state: MiscState, action: PayloadAction<number>) {
      state.language = action.payload;
    },
    setVideoPlayerFullScreen(state: MiscState, action: PayloadAction<boolean>) {
      state.videoPlayerFullScreen = action.payload;
    },
    setProgress(state: MiscState, action: PayloadAction<Progress>) {
      state.progress = action.payload;
    },
    setHeaderTitle(state: MiscState, action: PayloadAction<string>) {
      state.headerTitle = action.payload;
    },
    setPredefinedHabit(
      state: MiscState,
      action: PayloadAction<PredefinedHabit | ScheduledHabit | undefined>,
    ) {
      state.predefinedHabit = action.payload;
    },
    setAdminMode(state: MiscState, action: PayloadAction<boolean>) {
      state.adminMode = action.payload;
    },
    _setShowAuthModal(state: MiscState, action: PayloadAction<boolean>) {
      state.showAuthModal = action.payload;
    },
    setAuthModalAuthAbandoned(
      state: MiscState,
      action: PayloadAction<boolean>,
    ) {
      state.authModalAuthAbandoned = action.payload;
    },
  },
});

export const closeAuthModal = () => {
  store.dispatch(miscSlice.actions._setShowAuthModal(false));
};

export const openAuthModal = async (): Promise<boolean> => {
  await store.dispatch(miscSlice.actions._setShowAuthModal(true));
  while (store.getState().misc.showAuthModal === true) {
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (store.getState().misc.authModalAuthAbandoned === true) {
    //modal closed and we're not authed
    //TODO: find a less sledge hammer based approach
    //this is currently the only way I can see of halting any intercepted drawer opening.
    // throw Error("Auth modal closed without auth");
    return false;
  }
  return true;
};

export const {
  setPendingNumber,
  clearPendingNumber,
  setLanguage,
  setForceNav,
  setVideoPlayerFullScreen,
  setProgress,
  setRouteName,
  setHeaderTitle,
  setPredefinedHabit,
  setAuthModalAuthAbandoned,
  setAdminMode,
  setHabitApiBusy,
  setHabitApiNotBusy,
} = miscSlice.actions;

export default miscSlice.reducer;
