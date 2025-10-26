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
import { CurrentFitnessLevelCollectionState } from "./current-fitness-level-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Currentfitnesslevel } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CurrentFitnessLevelCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CurrentFitnessLevel")?.thunkConfig();
export {thunks}; 


export const getCurrentFitnessLevels = createAsyncThunk(
  "get/current-fitness-levels",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`current-fitness-level?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCurrentFitnessLevels = createAsyncThunk(
  "get/current-fitness-levels",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`current-fitness-level-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCurrentFitnessLevel = createAsyncThunk(
    "post/current-fitness-level",
    async (currentFitnessLevel: Partial<Currentfitnesslevel>) => {
      const client = await fetchClient();
      const { data } = await client.post(`current-fitness-level/`, { currentFitnessLevel });
      return data;
    }
  );


export const updateCurrentFitnessLevel = createAsyncThunk(
  "put/current-fitness-level",
  async (currentFitnessLevel: Partial<Currentfitnesslevel>) => {
    const client = await fetchClient();
    const { data } = await client.put(`current-fitness-level/`, { currentFitnessLevel });
    return data;
  }
);

export const getCurrentFitnessLevel = createAsyncThunk(
  "get/current-fitness-level",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`current-fitness-level/${id}`);
    return data;
  }
);

export const deleteCurrentFitnessLevel = createAsyncThunk(
  "delete/current-fitness-level",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`current-fitness-level/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CurrentFitnessLevelCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const currentFitnessLevelsSlice = createSlice({
  name: "currentFitnessLevels",
  initialState,
  reducers: {
    clearCurrentFitnessLevelItems(state: CurrentFitnessLevelCollectionState) {
      Object.assign(state, initialState);
    },
    clearCurrentFitnessLevelError(state: CurrentFitnessLevelCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCurrentFitnessLevels.pending || searchCurrentFitnessLevels.pending, (state: CurrentFitnessLevelCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCurrentFitnessLevels.fulfilled || searchCurrentFitnessLevels.fulfilled, (state: CurrentFitnessLevelCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCurrentFitnessLevels.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCurrentFitnessLevel.pending, (state: CurrentFitnessLevelCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCurrentFitnessLevel.pending, (state: CurrentFitnessLevelCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCurrentFitnessLevel.pending, (state: CurrentFitnessLevelCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCurrentFitnessLevel.fulfilled, (state: CurrentFitnessLevelCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCurrentFitnessLevel.fulfilled, (state: CurrentFitnessLevelCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCurrentFitnessLevel.fulfilled, (state: CurrentFitnessLevelCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCurrentFitnessLevel.pending, (state: CurrentFitnessLevelCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCurrentFitnessLevel.fulfilled, (state: CurrentFitnessLevelCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCurrentFitnessLevel.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCurrentFitnessLevel.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCurrentFitnessLevel.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("CurrentFitnessLevel")?.reducerConfig(builder);
  },
});

export const currentFitnessLevelSelector = (id: number) => (state: AppState) => {
  return state.currentFitnessLevels?.items?.find((o) => o.Id === id);
}; 

export const currentFitnessLevelLoading = createSelector(
  (state: AppState) => state.currentFitnessLevels.status,
  status => status === 'pending'
);

export const currentFitnessLevelErrorSelector = createSelector(
  (state: AppState) => state.currentFitnessLevels,
  status => status.error
);


export const currentFitnessLevelsSelector = createSelector(
  (state: AppState) => state.currentFitnessLevels,
  state => state.items
);

export const currentFitnessLevelsLoading = createSelector(
  (state: AppState) => state.currentFitnessLevels.status,
  status => status === 'pending'
);

export const currentFitnessLevelsErrorSelector = createSelector(
  (state: AppState) => state.currentFitnessLevels,
  status => status.error
);

export const { clearCurrentFitnessLevelItems, clearCurrentFitnessLevelError } = currentFitnessLevelsSlice.actions;

export default currentFitnessLevelsSlice.reducer;
