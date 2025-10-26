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
import { ExerciseMediaKeyCollectionState } from "./exercise-media-key-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Exercisemediakey } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ExerciseMediaKeyCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("ExerciseMediaKey")?.thunkConfig();
export {thunks}; 


export const getExerciseMediaKeys = createAsyncThunk(
  "get/exercise-media-keys",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise-media-key?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchExerciseMediaKeys = createAsyncThunk(
  "get/exercise-media-keys",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`exercise-media-key-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createExerciseMediaKey = createAsyncThunk(
    "post/exercise-media-key",
    async (exerciseMediaKey: Partial<Exercisemediakey>) => {
      const client = await fetchClient();
      const { data } = await client.post(`exercise-media-key/`, { exerciseMediaKey });
      return data;
    }
  );


export const updateExerciseMediaKey = createAsyncThunk(
  "put/exercise-media-key",
  async (exerciseMediaKey: Partial<Exercisemediakey>) => {
    const client = await fetchClient();
    const { data } = await client.put(`exercise-media-key/`, { exerciseMediaKey });
    return data;
  }
);

export const getExerciseMediaKey = createAsyncThunk(
  "get/exercise-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise-media-key/${id}`);
    return data;
  }
);

export const deleteExerciseMediaKey = createAsyncThunk(
  "delete/exercise-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`exercise-media-key/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: ExerciseMediaKeyCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const exerciseMediaKeysSlice = createSlice({
  name: "exerciseMediaKeys",
  initialState,
  reducers: {
    clearExerciseMediaKeyItems(state: ExerciseMediaKeyCollectionState) {
      Object.assign(state, initialState);
    },
    clearExerciseMediaKeyError(state: ExerciseMediaKeyCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getExerciseMediaKeys.pending || searchExerciseMediaKeys.pending, (state: ExerciseMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getExerciseMediaKeys.fulfilled || searchExerciseMediaKeys.fulfilled, (state: ExerciseMediaKeyCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getExerciseMediaKeys.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getExerciseMediaKey.pending, (state: ExerciseMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteExerciseMediaKey.pending, (state: ExerciseMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateExerciseMediaKey.pending, (state: ExerciseMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getExerciseMediaKey.fulfilled, (state: ExerciseMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteExerciseMediaKey.fulfilled, (state: ExerciseMediaKeyCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateExerciseMediaKey.fulfilled, (state: ExerciseMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createExerciseMediaKey.pending, (state: ExerciseMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createExerciseMediaKey.fulfilled, (state: ExerciseMediaKeyCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getExerciseMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteExerciseMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateExerciseMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("ExerciseMediaKey")?.reducerConfig(builder);
  },
});

export const exerciseMediaKeySelector = (id: number) => (state: AppState) => {
  return state.exerciseMediaKeys?.items?.find((o) => o.Id === id);
}; 

export const exerciseMediaKeyLoading = createSelector(
  (state: AppState) => state.exerciseMediaKeys.status,
  status => status === 'pending'
);

export const exerciseMediaKeyErrorSelector = createSelector(
  (state: AppState) => state.exerciseMediaKeys,
  status => status.error
);


export const exerciseMediaKeysSelector = createSelector(
  (state: AppState) => state.exerciseMediaKeys,
  state => state.items
);

export const exerciseMediaKeysLoading = createSelector(
  (state: AppState) => state.exerciseMediaKeys.status,
  status => status === 'pending'
);

export const exerciseMediaKeysErrorSelector = createSelector(
  (state: AppState) => state.exerciseMediaKeys,
  status => status.error
);

export const { clearExerciseMediaKeyItems, clearExerciseMediaKeyError } = exerciseMediaKeysSlice.actions;

export default exerciseMediaKeysSlice.reducer;
