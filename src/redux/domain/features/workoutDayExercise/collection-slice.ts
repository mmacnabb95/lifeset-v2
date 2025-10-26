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
import { WorkoutDayExerciseCollectionState } from "./workout-day-exercise-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workoutdayexercise } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutDayExerciseCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("WorkoutDayExercise")?.thunkConfig();
export {thunks}; 


export const getWorkoutDayExercises = createAsyncThunk(
  "get/workout-day-exercises",
  async (options?: { workoutday?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-day-exercise?workoutday=${options?.workoutday}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkoutDayExercises = createAsyncThunk(
  "get/workout-day-exercises",
  async ({ workoutday, search, offset, limit, filter }: { workoutday?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-day-exercise-search?workoutday=${workoutday}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkoutDayExercise = createAsyncThunk(
    "post/workout-day-exercise",
    async (workoutDayExercise: Partial<Workoutdayexercise>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout-day-exercise/`, { workoutDayExercise });
      return data;
    }
  );


export const updateWorkoutDayExercise = createAsyncThunk(
  "put/workout-day-exercise",
  async (workoutDayExercise: Partial<Workoutdayexercise>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout-day-exercise/`, { workoutDayExercise });
    return data;
  }
);

export const getWorkoutDayExercise = createAsyncThunk(
  "get/workout-day-exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-day-exercise/${id}`);
    return data;
  }
);

export const deleteWorkoutDayExercise = createAsyncThunk(
  "delete/workout-day-exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout-day-exercise/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: WorkoutDayExerciseCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].WorkoutDay : undefined;

//   if(currentStateConstraint && actionArgs.workoutday && Number(actionArgs.workoutday) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].WorkoutDay : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutDayExerciseCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutDayExercisesSlice = createSlice({
  name: "workoutDayExercises",
  initialState,
  reducers: {
    clearWorkoutDayExerciseItems(state: WorkoutDayExerciseCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutDayExerciseError(state: WorkoutDayExerciseCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkoutDayExercises.pending || searchWorkoutDayExercises.pending, (state: WorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkoutDayExercises.fulfilled || searchWorkoutDayExercises.fulfilled, (state: WorkoutDayExerciseCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkoutDayExercises.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkoutDayExercise.pending, (state: WorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkoutDayExercise.pending, (state: WorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkoutDayExercise.pending, (state: WorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkoutDayExercise.fulfilled, (state: WorkoutDayExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkoutDayExercise.fulfilled, (state: WorkoutDayExerciseCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkoutDayExercise.fulfilled, (state: WorkoutDayExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkoutDayExercise.pending, (state: WorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkoutDayExercise.fulfilled, (state: WorkoutDayExerciseCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("WorkoutDayExercise")?.reducerConfig(builder);
  },
});

export const workoutDayExerciseSelector = (id: number) => (state: AppState) => {
  return state.workoutDayExercises?.items?.find((o) => o.Id === id);
}; 

export const workoutDayExerciseLoading = createSelector(
  (state: AppState) => state.workoutDayExercises.status,
  status => status === 'pending'
);

export const workoutDayExerciseErrorSelector = createSelector(
  (state: AppState) => state.workoutDayExercises,
  status => status.error
);


export const workoutDayExercisesSelector = (workoutDay?: number) => (state: AppState) => {
  if (!workoutDay) {
    return undefined;
  }
  return state.workoutDayExercises?.items?.filter((q) => q.WorkoutDay === workoutDay);
}; 

export const workoutDayExercisesLoading = createSelector(
  (state: AppState) => state.workoutDayExercises.status,
  status => status === 'pending'
);

export const workoutDayExercisesErrorSelector = createSelector(
  (state: AppState) => state.workoutDayExercises,
  status => status.error
);

export const { clearWorkoutDayExerciseItems, clearWorkoutDayExerciseError } = workoutDayExercisesSlice.actions;

export default workoutDayExercisesSlice.reducer;
