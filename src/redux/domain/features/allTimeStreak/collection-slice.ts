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
import { AllTimeStreakCollectionState } from "./all-time-streak-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Alltimestreak } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: AllTimeStreakCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("AllTimeStreak")?.thunkConfig();
export {thunks}; 


export const getAllTimeStreaks = createAsyncThunk(
  "get/all-time-streaks",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`all-time-streak?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchAllTimeStreaks = createAsyncThunk(
  "get/all-time-streaks",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`all-time-streak-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createAllTimeStreak = createAsyncThunk(
    "post/all-time-streak",
    async (allTimeStreak: Partial<Alltimestreak>) => {
      const client = await fetchClient();
      const { data } = await client.post(`all-time-streak/`, { allTimeStreak });
      return data;
    }
  );


export const updateAllTimeStreak = createAsyncThunk(
  "put/all-time-streak",
  async (allTimeStreak: Partial<Alltimestreak>) => {
    const client = await fetchClient();
    const { data } = await client.put(`all-time-streak/`, { allTimeStreak });
    return data;
  }
);

export const getAllTimeStreak = createAsyncThunk(
  "get/all-time-streak",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`all-time-streak/${id}`);
    return data;
  }
);

export const deleteAllTimeStreak = createAsyncThunk(
  "delete/all-time-streak",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`all-time-streak/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: AllTimeStreakCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].User : undefined;

//   if(currentStateConstraint && actionArgs.user && Number(actionArgs.user) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].User : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: AllTimeStreakCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const allTimeStreaksSlice = createSlice({
  name: "allTimeStreaks",
  initialState,
  reducers: {
    clearAllTimeStreakItems(state: AllTimeStreakCollectionState) {
      Object.assign(state, initialState);
    },
    clearAllTimeStreakError(state: AllTimeStreakCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllTimeStreaks.pending || searchAllTimeStreaks.pending, (state: AllTimeStreakCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getAllTimeStreaks.fulfilled || searchAllTimeStreaks.fulfilled, (state: AllTimeStreakCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getAllTimeStreaks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getAllTimeStreak.pending, (state: AllTimeStreakCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteAllTimeStreak.pending, (state: AllTimeStreakCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateAllTimeStreak.pending, (state: AllTimeStreakCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getAllTimeStreak.fulfilled, (state: AllTimeStreakCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteAllTimeStreak.fulfilled, (state: AllTimeStreakCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateAllTimeStreak.fulfilled, (state: AllTimeStreakCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createAllTimeStreak.pending, (state: AllTimeStreakCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createAllTimeStreak.fulfilled, (state: AllTimeStreakCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getAllTimeStreak.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteAllTimeStreak.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateAllTimeStreak.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("AllTimeStreak")?.reducerConfig(builder);
  },
});

export const allTimeStreakSelector = (id: number) => (state: AppState) => {
  return state.allTimeStreaks?.items?.find((o) => o.Id === id);
}; 

export const allTimeStreakLoading = createSelector(
  (state: AppState) => state.allTimeStreaks.status,
  status => status === 'pending'
);

export const allTimeStreakErrorSelector = createSelector(
  (state: AppState) => state.allTimeStreaks,
  status => status.error
);


export const allTimeStreaksSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.allTimeStreaks?.items?.filter((q) => q.User === user);
}; 

export const allTimeStreaksLoading = createSelector(
  (state: AppState) => state.allTimeStreaks.status,
  status => status === 'pending'
);

export const allTimeStreaksErrorSelector = createSelector(
  (state: AppState) => state.allTimeStreaks,
  status => status.error
);

export const { clearAllTimeStreakItems, clearAllTimeStreakError } = allTimeStreaksSlice.actions;

export default allTimeStreaksSlice.reducer;
