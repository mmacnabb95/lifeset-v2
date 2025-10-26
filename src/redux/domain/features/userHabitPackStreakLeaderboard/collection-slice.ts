/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import {
  createSelector,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchClient } from "src/utils/legacy-stubs";
import { AppState } from "src/redux/reducer/root-reducer";
import _ from 'lodash'; 
import { UserHabitPackStreakLeaderboardCollectionState } from "./user-habit-pack-streak-leaderboard-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userhabitpackstreakleaderboard } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserHabitPackStreakLeaderboardCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserHabitPackStreakLeaderboard")?.thunkConfig();
export {thunks}; 


export const getUserHabitPackStreakLeaderboards = createAsyncThunk(
  "get/user-habit-pack-streak-leaderboards",
  async (options?: { userhabitpack?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-streak-leaderboard?userhabitpack=${options?.userhabitpack}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserHabitPackStreakLeaderboards = createAsyncThunk(
  "get/user-habit-pack-streak-leaderboards",
  async ({ userhabitpack, search, offset, limit, filter }: { userhabitpack?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-habit-pack-streak-leaderboard-search?userhabitpack=${userhabitpack}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserHabitPackStreakLeaderboard = createAsyncThunk(
    "post/user-habit-pack-streak-leaderboard",
    async (userHabitPackStreakLeaderboard: Partial<Userhabitpackstreakleaderboard>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-habit-pack-streak-leaderboard/`, { userHabitPackStreakLeaderboard });
      return data;
    }
  );


export const updateUserHabitPackStreakLeaderboard = createAsyncThunk(
  "put/user-habit-pack-streak-leaderboard",
  async (userHabitPackStreakLeaderboard: Partial<Userhabitpackstreakleaderboard>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-habit-pack-streak-leaderboard/`, { userHabitPackStreakLeaderboard });
    return data;
  }
);

export const getUserHabitPackStreakLeaderboard = createAsyncThunk(
  "get/user-habit-pack-streak-leaderboard",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-streak-leaderboard/${id}`);
    return data;
  }
);

export const deleteUserHabitPackStreakLeaderboard = createAsyncThunk(
  "delete/user-habit-pack-streak-leaderboard",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-habit-pack-streak-leaderboard/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserHabitPackStreakLeaderboardCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].UserHabitPack : undefined;

//   if(currentStateConstraint && actionArgs.userhabitpack && Number(actionArgs.userhabitpack) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].UserHabitPack : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: UserHabitPackStreakLeaderboardCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userHabitPackStreakLeaderboardsSlice = createSlice({
  name: "userHabitPackStreakLeaderboards",
  initialState,
  reducers: {
    clearUserHabitPackStreakLeaderboardItems(state: UserHabitPackStreakLeaderboardCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserHabitPackStreakLeaderboardError(state: UserHabitPackStreakLeaderboardCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserHabitPackStreakLeaderboards.pending || searchUserHabitPackStreakLeaderboards.pending, (state: UserHabitPackStreakLeaderboardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserHabitPackStreakLeaderboards.fulfilled || searchUserHabitPackStreakLeaderboards.fulfilled, (state: UserHabitPackStreakLeaderboardCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserHabitPackStreakLeaderboards.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserHabitPackStreakLeaderboard.pending, (state: UserHabitPackStreakLeaderboardCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserHabitPackStreakLeaderboard.pending, (state: UserHabitPackStreakLeaderboardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserHabitPackStreakLeaderboard.pending, (state: UserHabitPackStreakLeaderboardCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserHabitPackStreakLeaderboard.fulfilled, (state: UserHabitPackStreakLeaderboardCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserHabitPackStreakLeaderboard.fulfilled, (state: UserHabitPackStreakLeaderboardCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserHabitPackStreakLeaderboard.fulfilled, (state: UserHabitPackStreakLeaderboardCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserHabitPackStreakLeaderboard.pending, (state: UserHabitPackStreakLeaderboardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserHabitPackStreakLeaderboard.fulfilled, (state: UserHabitPackStreakLeaderboardCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserHabitPackStreakLeaderboard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserHabitPackStreakLeaderboard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserHabitPackStreakLeaderboard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserHabitPackStreakLeaderboard")?.reducerConfig(builder);
  },
});

export const userHabitPackStreakLeaderboardSelector = (id: number) => (state: AppState) => {
  return state.userHabitPackStreakLeaderboards?.items?.find((o) => o.Id === id);
}; 

export const userHabitPackStreakLeaderboardLoading = createSelector(
  (state: AppState) => state.userHabitPackStreakLeaderboards.status,
  status => status === 'pending'
);

export const userHabitPackStreakLeaderboardErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackStreakLeaderboards,
  status => status.error
);


export const userHabitPackStreakLeaderboardsSelector = (userHabitPack?: number) => (state: AppState) => {
  if (!userHabitPack) {
    return undefined;
  }
  return state.userHabitPackStreakLeaderboards?.items?.filter((q) => q.UserHabitPack === userHabitPack);
}; 

export const userHabitPackStreakLeaderboardsLoading = createSelector(
  (state: AppState) => state.userHabitPackStreakLeaderboards.status,
  status => status === 'pending'
);

export const userHabitPackStreakLeaderboardsErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackStreakLeaderboards,
  status => status.error
);

export const { clearUserHabitPackStreakLeaderboardItems, clearUserHabitPackStreakLeaderboardError } = userHabitPackStreakLeaderboardsSlice.actions;

export default userHabitPackStreakLeaderboardsSlice.reducer;
