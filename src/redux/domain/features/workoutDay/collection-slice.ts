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
import { WorkoutDayCollectionState } from "./workout-day-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workoutday } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutDayCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("WorkoutDay")?.thunkConfig();
export {thunks}; 


export const getWorkoutDays = createAsyncThunk(
  "get/workout-days",
  async (options?: { workout?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-day?workout=${options?.workout}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkoutDays = createAsyncThunk(
  "get/workout-days",
  async ({ workout, search, offset, limit, filter }: { workout?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-day-search?workout=${workout}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkoutDay = createAsyncThunk(
    "post/workout-day",
    async (workoutDay: Partial<Workoutday>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout-day/`, { workoutDay });
      return data;
    }
  );


export const updateWorkoutDay = createAsyncThunk(
  "put/workout-day",
  async (workoutDay: Partial<Workoutday>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout-day/`, { workoutDay });
    return data;
  }
);

export const getWorkoutDay = createAsyncThunk(
  "get/workout-day",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-day/${id}`);
    return data;
  }
);

export const deleteWorkoutDay = createAsyncThunk(
  "delete/workout-day",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout-day/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: WorkoutDayCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Workout : undefined;

//   if(currentStateConstraint && actionArgs.workout && Number(actionArgs.workout) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Workout : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutDayCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutDaysSlice = createSlice({
  name: "workoutDays",
  initialState,
  reducers: {
    clearWorkoutDayItems(state: WorkoutDayCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutDayError(state: WorkoutDayCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkoutDays.pending || searchWorkoutDays.pending, (state: WorkoutDayCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkoutDays.fulfilled || searchWorkoutDays.fulfilled, (state: WorkoutDayCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkoutDays.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkoutDay.pending, (state: WorkoutDayCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkoutDay.pending, (state: WorkoutDayCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkoutDay.pending, (state: WorkoutDayCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkoutDay.fulfilled, (state: WorkoutDayCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkoutDay.fulfilled, (state: WorkoutDayCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkoutDay.fulfilled, (state: WorkoutDayCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkoutDay.pending, (state: WorkoutDayCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkoutDay.fulfilled, (state: WorkoutDayCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkoutDay.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkoutDay.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkoutDay.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("WorkoutDay")?.reducerConfig(builder);
  },
});

export const workoutDaySelector = (id: number) => (state: AppState) => {
  return state.workoutDays?.items?.find((o) => o.Id === id);
}; 

export const workoutDayLoading = createSelector(
  (state: AppState) => state.workoutDays.status,
  status => status === 'pending'
);

export const workoutDayErrorSelector = createSelector(
  (state: AppState) => state.workoutDays,
  status => status.error
);


export const workoutDaysSelector = (workout?: number) => (state: AppState) => {
  if (!workout) {
    return undefined;
  }
  return state.workoutDays?.items?.filter((q) => q.Workout === workout);
}; 

export const workoutDaysLoading = createSelector(
  (state: AppState) => state.workoutDays.status,
  status => status === 'pending'
);

export const workoutDaysErrorSelector = createSelector(
  (state: AppState) => state.workoutDays,
  status => status.error
);

export const { clearWorkoutDayItems, clearWorkoutDayError } = workoutDaysSlice.actions;

export default workoutDaysSlice.reducer;
