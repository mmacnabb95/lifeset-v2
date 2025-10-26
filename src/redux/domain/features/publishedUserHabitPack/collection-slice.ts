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
import { PublishedUserHabitPackCollectionState } from "./published-user-habit-pack-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Publisheduserhabitpack } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: PublishedUserHabitPackCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("PublishedUserHabitPack")?.thunkConfig();
export {thunks}; 


export const getPublishedUserHabitPacks = createAsyncThunk(
  "get/published-user-habit-packs",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`published-user-habit-pack?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchPublishedUserHabitPacks = createAsyncThunk(
  "get/published-user-habit-packs",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`published-user-habit-pack-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getPublishedUserHabitPack = createAsyncThunk(
  "get/published-user-habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`published-user-habit-pack/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: PublishedUserHabitPackCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const publishedUserHabitPacksSlice = createSlice({
  name: "publishedUserHabitPacks",
  initialState,
  reducers: {
    clearPublishedUserHabitPackItems(state: PublishedUserHabitPackCollectionState) {
      Object.assign(state, initialState);
    },
    clearPublishedUserHabitPackError(state: PublishedUserHabitPackCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPublishedUserHabitPacks.pending || searchPublishedUserHabitPacks.pending, (state: PublishedUserHabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getPublishedUserHabitPacks.fulfilled || searchPublishedUserHabitPacks.fulfilled, (state: PublishedUserHabitPackCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getPublishedUserHabitPacks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getPublishedUserHabitPack.pending, (state: PublishedUserHabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getPublishedUserHabitPack.fulfilled, (state: PublishedUserHabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getPublishedUserHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("PublishedUserHabitPack")?.reducerConfig(builder);
  },
});

export const publishedUserHabitPackSelector = (id: number) => (state: AppState) => {
  return state.publishedUserHabitPacks?.items?.find((o) => o.Id === id);
}; 

export const publishedUserHabitPackLoading = createSelector(
  (state: AppState) => state.publishedUserHabitPacks.status,
  status => status === 'pending'
);

export const publishedUserHabitPackErrorSelector = createSelector(
  (state: AppState) => state.publishedUserHabitPacks,
  status => status.error
);


export const publishedUserHabitPacksSelector = createSelector(
  (state: AppState) => state.publishedUserHabitPacks,
  state => state.items
);

export const publishedUserHabitPacksLoading = createSelector(
  (state: AppState) => state.publishedUserHabitPacks.status,
  status => status === 'pending'
);

export const publishedUserHabitPacksErrorSelector = createSelector(
  (state: AppState) => state.publishedUserHabitPacks,
  status => status.error
);

export const { clearPublishedUserHabitPackItems, clearPublishedUserHabitPackError } = publishedUserHabitPacksSlice.actions;

export default publishedUserHabitPacksSlice.reducer;
