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
import { WorkoutExerciseSetCollectionState } from "./workout-exercise-set-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workoutexerciseset } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutExerciseSetCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("WorkoutExerciseSet")?.thunkConfig();
export {thunks}; 


export const getWorkoutExerciseSets = createAsyncThunk(
  "get/workout-exercise-sets",
  async (options?: { workoutdayexercise?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-exercise-set?workoutdayexercise=${options?.workoutdayexercise}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkoutExerciseSets = createAsyncThunk(
  "get/workout-exercise-sets",
  async ({ workoutdayexercise, search, offset, limit, filter }: { workoutdayexercise?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-exercise-set-search?workoutdayexercise=${workoutdayexercise}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkoutExerciseSet = createAsyncThunk(
    "post/workout-exercise-set",
    async (workoutExerciseSet: Partial<Workoutexerciseset>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout-exercise-set/`, { workoutExerciseSet });
      return data;
    }
  );


export const updateWorkoutExerciseSet = createAsyncThunk(
  "put/workout-exercise-set",
  async (workoutExerciseSet: Partial<Workoutexerciseset>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout-exercise-set/`, { workoutExerciseSet });
    return data;
  }
);

export const getWorkoutExerciseSet = createAsyncThunk(
  "get/workout-exercise-set",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-exercise-set/${id}`);
    return data;
  }
);

export const deleteWorkoutExerciseSet = createAsyncThunk(
  "delete/workout-exercise-set",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout-exercise-set/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: WorkoutExerciseSetCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].WorkoutDayExercise : undefined;

//   if(currentStateConstraint && actionArgs.workoutdayexercise && Number(actionArgs.workoutdayexercise) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].WorkoutDayExercise : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutExerciseSetCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutExerciseSetsSlice = createSlice({
  name: "workoutExerciseSets",
  initialState,
  reducers: {
    clearWorkoutExerciseSetItems(state: WorkoutExerciseSetCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutExerciseSetError(state: WorkoutExerciseSetCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkoutExerciseSets.pending || searchWorkoutExerciseSets.pending, (state: WorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkoutExerciseSets.fulfilled || searchWorkoutExerciseSets.fulfilled, (state: WorkoutExerciseSetCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkoutExerciseSets.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkoutExerciseSet.pending, (state: WorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkoutExerciseSet.pending, (state: WorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkoutExerciseSet.pending, (state: WorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkoutExerciseSet.fulfilled, (state: WorkoutExerciseSetCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkoutExerciseSet.fulfilled, (state: WorkoutExerciseSetCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkoutExerciseSet.fulfilled, (state: WorkoutExerciseSetCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkoutExerciseSet.pending, (state: WorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkoutExerciseSet.fulfilled, (state: WorkoutExerciseSetCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("WorkoutExerciseSet")?.reducerConfig(builder);
  },
});

export const workoutExerciseSetSelector = (id: number) => (state: AppState) => {
  return state.workoutExerciseSets?.items?.find((o) => o.Id === id);
}; 

export const workoutExerciseSetLoading = createSelector(
  (state: AppState) => state.workoutExerciseSets.status,
  status => status === 'pending'
);

export const workoutExerciseSetErrorSelector = createSelector(
  (state: AppState) => state.workoutExerciseSets,
  status => status.error
);


export const workoutExerciseSetsSelector = (workoutDayExercise?: number) => (state: AppState) => {
  if (!workoutDayExercise) {
    return undefined;
  }
  return state.workoutExerciseSets?.items?.filter((q) => q.WorkoutDayExercise === workoutDayExercise);
}; 

export const workoutExerciseSetsLoading = createSelector(
  (state: AppState) => state.workoutExerciseSets.status,
  status => status === 'pending'
);

export const workoutExerciseSetsErrorSelector = createSelector(
  (state: AppState) => state.workoutExerciseSets,
  status => status.error
);

export const { clearWorkoutExerciseSetItems, clearWorkoutExerciseSetError } = workoutExerciseSetsSlice.actions;

export default workoutExerciseSetsSlice.reducer;
