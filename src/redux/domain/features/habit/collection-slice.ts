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
import { HabitCollectionState } from "./habit-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habit } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Habit")?.thunkConfig();
export {thunks}; 


export const getHabits = createAsyncThunk(
  "get/habits",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabits = createAsyncThunk(
  "get/habits",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabit = createAsyncThunk(
    "post/habit",
    async (habit: Partial<Habit>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit/`, { habit });
      return data;
    }
  );


export const updateHabit = createAsyncThunk(
  "put/habit",
  async (habit: Partial<Habit>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit/`, { habit });
    return data;
  }
);

export const getHabit = createAsyncThunk(
  "get/habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit/${id}`);
    return data;
  }
);

export const deleteHabit = createAsyncThunk(
  "delete/habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: HabitCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: HabitCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    clearHabitItems(state: HabitCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitError(state: HabitCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabits.pending || searchHabits.pending, (state: HabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabits.fulfilled || searchHabits.fulfilled, (state: HabitCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabits.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabit.pending, (state: HabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabit.pending, (state: HabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabit.pending, (state: HabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabit.fulfilled, (state: HabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabit.fulfilled, (state: HabitCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabit.fulfilled, (state: HabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabit.pending, (state: HabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabit.fulfilled, (state: HabitCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Habit")?.reducerConfig(builder);
  },
});

export const habitSelector = (id: number) => (state: AppState) => {
  return state.habits?.items?.find((o) => o.Id === id);
}; 

export const habitLoading = createSelector(
  (state: AppState) => state.habits.status,
  status => status === 'pending'
);

export const habitErrorSelector = createSelector(
  (state: AppState) => state.habits,
  status => status.error
);


export const habitsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.habits?.items?.filter((q) => q.User === user);
}; 

export const habitsLoading = createSelector(
  (state: AppState) => state.habits.status,
  status => status === 'pending'
);

export const habitsErrorSelector = createSelector(
  (state: AppState) => state.habits,
  status => status.error
);

export const { clearHabitItems, clearHabitError } = habitsSlice.actions;

export default habitsSlice.reducer;
