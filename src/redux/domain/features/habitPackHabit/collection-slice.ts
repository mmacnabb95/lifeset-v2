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
import { HabitPackHabitCollectionState } from "./habit-pack-habit-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitpackhabit } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitPackHabitCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitPackHabit")?.thunkConfig();
export {thunks}; 


export const getHabitPackHabits = createAsyncThunk(
  "get/habit-pack-habits",
  async (options?: { habitpack?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack-habit?habitpack=${options?.habitpack}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitPackHabits = createAsyncThunk(
  "get/habit-pack-habits",
  async ({ habitpack, search, offset, limit, filter }: { habitpack?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-pack-habit-search?habitpack=${habitpack}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitPackHabit = createAsyncThunk(
    "post/habit-pack-habit",
    async (habitPackHabit: Partial<Habitpackhabit>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-pack-habit/`, { habitPackHabit });
      return data;
    }
  );


export const updateHabitPackHabit = createAsyncThunk(
  "put/habit-pack-habit",
  async (habitPackHabit: Partial<Habitpackhabit>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-pack-habit/`, { habitPackHabit });
    return data;
  }
);

export const getHabitPackHabit = createAsyncThunk(
  "get/habit-pack-habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack-habit/${id}`);
    return data;
  }
);

export const deleteHabitPackHabit = createAsyncThunk(
  "delete/habit-pack-habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-pack-habit/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: HabitPackHabitCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].HabitPack : undefined;

//   if(currentStateConstraint && actionArgs.habitpack && Number(actionArgs.habitpack) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].HabitPack : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitPackHabitCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitPackHabitsSlice = createSlice({
  name: "habitPackHabits",
  initialState,
  reducers: {
    clearHabitPackHabitItems(state: HabitPackHabitCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitPackHabitError(state: HabitPackHabitCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitPackHabits.pending || searchHabitPackHabits.pending, (state: HabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitPackHabits.fulfilled || searchHabitPackHabits.fulfilled, (state: HabitPackHabitCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitPackHabits.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitPackHabit.pending, (state: HabitPackHabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitPackHabit.pending, (state: HabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitPackHabit.pending, (state: HabitPackHabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitPackHabit.fulfilled, (state: HabitPackHabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitPackHabit.fulfilled, (state: HabitPackHabitCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitPackHabit.fulfilled, (state: HabitPackHabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitPackHabit.pending, (state: HabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitPackHabit.fulfilled, (state: HabitPackHabitCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitPackHabit")?.reducerConfig(builder);
  },
});

export const habitPackHabitSelector = (id: number) => (state: AppState) => {
  return state.habitPackHabits?.items?.find((o) => o.Id === id);
}; 

export const habitPackHabitLoading = createSelector(
  (state: AppState) => state.habitPackHabits.status,
  status => status === 'pending'
);

export const habitPackHabitErrorSelector = createSelector(
  (state: AppState) => state.habitPackHabits,
  status => status.error
);


export const habitPackHabitsSelector = (habitPack?: number) => (state: AppState) => {
  if (!habitPack) {
    return undefined;
  }
  return state.habitPackHabits?.items?.filter((q) => q.HabitPack === habitPack);
}; 

export const habitPackHabitsLoading = createSelector(
  (state: AppState) => state.habitPackHabits.status,
  status => status === 'pending'
);

export const habitPackHabitsErrorSelector = createSelector(
  (state: AppState) => state.habitPackHabits,
  status => status.error
);

export const { clearHabitPackHabitItems, clearHabitPackHabitError } = habitPackHabitsSlice.actions;

export default habitPackHabitsSlice.reducer;
