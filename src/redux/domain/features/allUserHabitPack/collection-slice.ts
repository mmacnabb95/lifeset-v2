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
import { AllUserHabitPackCollectionState } from "./all-user-habit-pack-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Alluserhabitpack } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: AllUserHabitPackCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("AllUserHabitPack")?.thunkConfig();
export {thunks}; 


export const getAllUserHabitPacks = createAsyncThunk(
  "get/all-user-habit-packs",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`all-user-habit-pack?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchAllUserHabitPacks = createAsyncThunk(
  "get/all-user-habit-packs",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`all-user-habit-pack-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getAllUserHabitPack = createAsyncThunk(
  "get/all-user-habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`all-user-habit-pack/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: AllUserHabitPackCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const allUserHabitPacksSlice = createSlice({
  name: "allUserHabitPacks",
  initialState,
  reducers: {
    clearAllUserHabitPackItems(state: AllUserHabitPackCollectionState) {
      Object.assign(state, initialState);
    },
    clearAllUserHabitPackError(state: AllUserHabitPackCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllUserHabitPacks.pending || searchAllUserHabitPacks.pending, (state: AllUserHabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getAllUserHabitPacks.fulfilled || searchAllUserHabitPacks.fulfilled, (state: AllUserHabitPackCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getAllUserHabitPacks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getAllUserHabitPack.pending, (state: AllUserHabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getAllUserHabitPack.fulfilled, (state: AllUserHabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getAllUserHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("AllUserHabitPack")?.reducerConfig(builder);
  },
});

export const allUserHabitPackSelector = (id: number) => (state: AppState) => {
  return state.allUserHabitPacks?.items?.find((o) => o.Id === id);
}; 

export const allUserHabitPackLoading = createSelector(
  (state: AppState) => state.allUserHabitPacks.status,
  status => status === 'pending'
);

export const allUserHabitPackErrorSelector = createSelector(
  (state: AppState) => state.allUserHabitPacks,
  status => status.error
);


export const allUserHabitPacksSelector = createSelector(
  (state: AppState) => state.allUserHabitPacks,
  state => state.items
);

export const allUserHabitPacksLoading = createSelector(
  (state: AppState) => state.allUserHabitPacks.status,
  status => status === 'pending'
);

export const allUserHabitPacksErrorSelector = createSelector(
  (state: AppState) => state.allUserHabitPacks,
  status => status.error
);

export const { clearAllUserHabitPackItems, clearAllUserHabitPackError } = allUserHabitPacksSlice.actions;

export default allUserHabitPacksSlice.reducer;
