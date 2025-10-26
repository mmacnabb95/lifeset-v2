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
import { HabitResourceCollectionState } from "./habit-resource-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitresource } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitResourceCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitResource")?.thunkConfig();
export {thunks}; 


export const getHabitResources = createAsyncThunk(
  "get/habit-resources",
  async (options?: { habit?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-resource?habit=${options?.habit}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitResources = createAsyncThunk(
  "get/habit-resources",
  async ({ habit, search, offset, limit, filter }: { habit?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-resource-search?habit=${habit}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitResource = createAsyncThunk(
    "post/habit-resource",
    async (habitResource: Partial<Habitresource>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-resource/`, { habitResource });
      return data;
    }
  );


export const updateHabitResource = createAsyncThunk(
  "put/habit-resource",
  async (habitResource: Partial<Habitresource>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-resource/`, { habitResource });
    return data;
  }
);

export const getHabitResource = createAsyncThunk(
  "get/habit-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-resource/${id}`);
    return data;
  }
);

export const deleteHabitResource = createAsyncThunk(
  "delete/habit-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-resource/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: HabitResourceCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Habit : undefined;

//   if(currentStateConstraint && actionArgs.habit && Number(actionArgs.habit) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Habit : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitResourceCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitResourcesSlice = createSlice({
  name: "habitResources",
  initialState,
  reducers: {
    clearHabitResourceItems(state: HabitResourceCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitResourceError(state: HabitResourceCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitResources.pending || searchHabitResources.pending, (state: HabitResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitResources.fulfilled || searchHabitResources.fulfilled, (state: HabitResourceCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitResources.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitResource.pending, (state: HabitResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitResource.pending, (state: HabitResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitResource.pending, (state: HabitResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitResource.fulfilled, (state: HabitResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitResource.fulfilled, (state: HabitResourceCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitResource.fulfilled, (state: HabitResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitResource.pending, (state: HabitResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitResource.fulfilled, (state: HabitResourceCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitResource")?.reducerConfig(builder);
  },
});

export const habitResourceSelector = (id: number) => (state: AppState) => {
  return state.habitResources?.items?.find((o) => o.Id === id);
}; 

export const habitResourceLoading = createSelector(
  (state: AppState) => state.habitResources.status,
  status => status === 'pending'
);

export const habitResourceErrorSelector = createSelector(
  (state: AppState) => state.habitResources,
  status => status.error
);


export const habitResourcesSelector = (habit?: number) => (state: AppState) => {
  if (!habit) {
    return undefined;
  }
  return state.habitResources?.items?.filter((q) => q.Habit === habit);
}; 

export const habitResourcesLoading = createSelector(
  (state: AppState) => state.habitResources.status,
  status => status === 'pending'
);

export const habitResourcesErrorSelector = createSelector(
  (state: AppState) => state.habitResources,
  status => status.error
);

export const { clearHabitResourceItems, clearHabitResourceError } = habitResourcesSlice.actions;

export default habitResourcesSlice.reducer;
