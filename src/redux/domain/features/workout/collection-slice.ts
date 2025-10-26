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
import { WorkoutCollectionState } from "./workout-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workout } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Workout")?.thunkConfig();
export {thunks}; 


export const getWorkouts = createAsyncThunk(
  "get/workouts",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkouts = createAsyncThunk(
  "get/workouts",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkout = createAsyncThunk(
    "post/workout",
    async (workout: Partial<Workout>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout/`, { workout });
      return data;
    }
  );


export const updateWorkout = createAsyncThunk(
  "put/workout",
  async (workout: Partial<Workout>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout/`, { workout });
    return data;
  }
);

export const getWorkout = createAsyncThunk(
  "get/workout",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout/${id}`);
    return data;
  }
);

export const deleteWorkout = createAsyncThunk(
  "delete/workout",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutsSlice = createSlice({
  name: "workouts",
  initialState,
  reducers: {
    clearWorkoutItems(state: WorkoutCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutError(state: WorkoutCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkouts.pending || searchWorkouts.pending, (state: WorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkouts.fulfilled || searchWorkouts.fulfilled, (state: WorkoutCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkouts.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkout.pending, (state: WorkoutCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkout.pending, (state: WorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkout.pending, (state: WorkoutCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkout.fulfilled, (state: WorkoutCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkout.fulfilled, (state: WorkoutCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkout.fulfilled, (state: WorkoutCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkout.pending, (state: WorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkout.fulfilled, (state: WorkoutCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Workout")?.reducerConfig(builder);
  },
});

export const workoutSelector = (id: number) => (state: AppState) => {
  return state.workouts?.items?.find((o) => o.Id === id);
}; 

export const workoutLoading = createSelector(
  (state: AppState) => state.workouts.status,
  status => status === 'pending'
);

export const workoutErrorSelector = createSelector(
  (state: AppState) => state.workouts,
  status => status.error
);


export const workoutsSelector = createSelector(
  (state: AppState) => state.workouts,
  state => state.items
);

export const workoutsLoading = createSelector(
  (state: AppState) => state.workouts.status,
  status => status === 'pending'
);

export const workoutsErrorSelector = createSelector(
  (state: AppState) => state.workouts,
  status => status.error
);

export const { clearWorkoutItems, clearWorkoutError } = workoutsSlice.actions;

export default workoutsSlice.reducer;
