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
import { ExerciseCollectionState } from "./exercise-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Exercise } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ExerciseCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Exercise")?.thunkConfig();
export {thunks}; 


export const getExercises = createAsyncThunk(
  "get/exercises",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchExercises = createAsyncThunk(
  "get/exercises",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`exercise-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createExercise = createAsyncThunk(
    "post/exercise",
    async (exercise: Partial<Exercise>) => {
      const client = await fetchClient();
      const { data } = await client.post(`exercise/`, { exercise });
      return data;
    }
  );


export const updateExercise = createAsyncThunk(
  "put/exercise",
  async (exercise: Partial<Exercise>) => {
    const client = await fetchClient();
    const { data } = await client.put(`exercise/`, { exercise });
    return data;
  }
);

export const getExercise = createAsyncThunk(
  "get/exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise/${id}`);
    return data;
  }
);

export const deleteExercise = createAsyncThunk(
  "delete/exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`exercise/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: ExerciseCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const exercisesSlice = createSlice({
  name: "exercises",
  initialState,
  reducers: {
    clearExerciseItems(state: ExerciseCollectionState) {
      Object.assign(state, initialState);
    },
    clearExerciseError(state: ExerciseCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getExercises.pending || searchExercises.pending, (state: ExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getExercises.fulfilled || searchExercises.fulfilled, (state: ExerciseCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getExercises.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getExercise.pending, (state: ExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteExercise.pending, (state: ExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateExercise.pending, (state: ExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getExercise.fulfilled, (state: ExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteExercise.fulfilled, (state: ExerciseCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateExercise.fulfilled, (state: ExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createExercise.pending, (state: ExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createExercise.fulfilled, (state: ExerciseCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Exercise")?.reducerConfig(builder);
  },
});

export const exerciseSelector = (id: number) => (state: AppState) => {
  return state.exercises?.items?.find((o) => o.Id === id);
}; 

export const exerciseLoading = createSelector(
  (state: AppState) => state.exercises.status,
  status => status === 'pending'
);

export const exerciseErrorSelector = createSelector(
  (state: AppState) => state.exercises,
  status => status.error
);


export const exercisesSelector = createSelector(
  (state: AppState) => state.exercises,
  state => state.items
);

export const exercisesLoading = createSelector(
  (state: AppState) => state.exercises.status,
  status => status === 'pending'
);

export const exercisesErrorSelector = createSelector(
  (state: AppState) => state.exercises,
  status => status.error
);

export const { clearExerciseItems, clearExerciseError } = exercisesSlice.actions;

export default exercisesSlice.reducer;
