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
import { HabitPackCollectionState } from "./habit-pack-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitpack } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitPackCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitPack")?.thunkConfig();
export {thunks}; 


export const getHabitPacks = createAsyncThunk(
  "get/habit-packs",
  async (options?: { company?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack?company=${options?.company}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitPacks = createAsyncThunk(
  "get/habit-packs",
  async ({ company, search, offset, limit, filter }: { company?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-pack-search?company=${company}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitPack = createAsyncThunk(
    "post/habit-pack",
    async (habitPack: Partial<Habitpack>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-pack/`, { habitPack });
      return data;
    }
  );


export const updateHabitPack = createAsyncThunk(
  "put/habit-pack",
  async (habitPack: Partial<Habitpack>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-pack/`, { habitPack });
    return data;
  }
);

export const getHabitPack = createAsyncThunk(
  "get/habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack/${id}`);
    return data;
  }
);

export const deleteHabitPack = createAsyncThunk(
  "delete/habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-pack/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: HabitPackCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Company : undefined;

//   if(currentStateConstraint && actionArgs.company && Number(actionArgs.company) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Company : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitPackCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitPacksSlice = createSlice({
  name: "habitPacks",
  initialState,
  reducers: {
    clearHabitPackItems(state: HabitPackCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitPackError(state: HabitPackCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitPacks.pending || searchHabitPacks.pending, (state: HabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitPacks.fulfilled || searchHabitPacks.fulfilled, (state: HabitPackCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitPacks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitPack.pending, (state: HabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitPack.pending, (state: HabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitPack.pending, (state: HabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitPack.fulfilled, (state: HabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitPack.fulfilled, (state: HabitPackCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitPack.fulfilled, (state: HabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitPack.pending, (state: HabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitPack.fulfilled, (state: HabitPackCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitPack")?.reducerConfig(builder);
  },
});

export const habitPackSelector = (id: number) => (state: AppState) => {
  return state.habitPacks?.items?.find((o) => o.Id === id);
}; 

export const habitPackLoading = createSelector(
  (state: AppState) => state.habitPacks.status,
  status => status === 'pending'
);

export const habitPackErrorSelector = createSelector(
  (state: AppState) => state.habitPacks,
  status => status.error
);


export const habitPacksSelector = (company?: number) => (state: AppState) => {
  if (!company) {
    return undefined;
  }
  return state.habitPacks?.items?.filter((q) => q.Company === company);
}; 

export const habitPacksLoading = createSelector(
  (state: AppState) => state.habitPacks.status,
  status => status === 'pending'
);

export const habitPacksErrorSelector = createSelector(
  (state: AppState) => state.habitPacks,
  status => status.error
);

export const { clearHabitPackItems, clearHabitPackError } = habitPacksSlice.actions;

export default habitPacksSlice.reducer;
