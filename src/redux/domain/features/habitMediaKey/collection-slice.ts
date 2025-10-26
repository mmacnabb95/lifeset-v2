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
import { HabitMediaKeyCollectionState } from "./habit-media-key-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitmediakey } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitMediaKeyCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitMediaKey")?.thunkConfig();
export {thunks}; 


export const getHabitMediaKeys = createAsyncThunk(
  "get/habit-media-keys",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-media-key?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitMediaKeys = createAsyncThunk(
  "get/habit-media-keys",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-media-key-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitMediaKey = createAsyncThunk(
    "post/habit-media-key",
    async (habitMediaKey: Partial<Habitmediakey>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-media-key/`, { habitMediaKey });
      return data;
    }
  );


export const updateHabitMediaKey = createAsyncThunk(
  "put/habit-media-key",
  async (habitMediaKey: Partial<Habitmediakey>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-media-key/`, { habitMediaKey });
    return data;
  }
);

export const getHabitMediaKey = createAsyncThunk(
  "get/habit-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-media-key/${id}`);
    return data;
  }
);

export const deleteHabitMediaKey = createAsyncThunk(
  "delete/habit-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-media-key/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitMediaKeyCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitMediaKeysSlice = createSlice({
  name: "habitMediaKeys",
  initialState,
  reducers: {
    clearHabitMediaKeyItems(state: HabitMediaKeyCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitMediaKeyError(state: HabitMediaKeyCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitMediaKeys.pending || searchHabitMediaKeys.pending, (state: HabitMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitMediaKeys.fulfilled || searchHabitMediaKeys.fulfilled, (state: HabitMediaKeyCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitMediaKeys.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitMediaKey.pending, (state: HabitMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitMediaKey.pending, (state: HabitMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitMediaKey.pending, (state: HabitMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitMediaKey.fulfilled, (state: HabitMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitMediaKey.fulfilled, (state: HabitMediaKeyCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitMediaKey.fulfilled, (state: HabitMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitMediaKey.pending, (state: HabitMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitMediaKey.fulfilled, (state: HabitMediaKeyCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitMediaKey")?.reducerConfig(builder);
  },
});

export const habitMediaKeySelector = (id: number) => (state: AppState) => {
  return state.habitMediaKeys?.items?.find((o) => o.Id === id);
}; 

export const habitMediaKeyLoading = createSelector(
  (state: AppState) => state.habitMediaKeys.status,
  status => status === 'pending'
);

export const habitMediaKeyErrorSelector = createSelector(
  (state: AppState) => state.habitMediaKeys,
  status => status.error
);


export const habitMediaKeysSelector = createSelector(
  (state: AppState) => state.habitMediaKeys,
  state => state.items
);

export const habitMediaKeysLoading = createSelector(
  (state: AppState) => state.habitMediaKeys.status,
  status => status === 'pending'
);

export const habitMediaKeysErrorSelector = createSelector(
  (state: AppState) => state.habitMediaKeys,
  status => status.error
);

export const { clearHabitMediaKeyItems, clearHabitMediaKeyError } = habitMediaKeysSlice.actions;

export default habitMediaKeysSlice.reducer;
