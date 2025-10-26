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
import { WorkoutSessionLengthCollectionState } from "./workout-session-length-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workoutsessionlength } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutSessionLengthCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("WorkoutSessionLength")?.thunkConfig();
export {thunks}; 


export const getWorkoutSessionLengths = createAsyncThunk(
  "get/workout-session-lengths",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-session-length?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkoutSessionLengths = createAsyncThunk(
  "get/workout-session-lengths",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-session-length-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkoutSessionLength = createAsyncThunk(
    "post/workout-session-length",
    async (workoutSessionLength: Partial<Workoutsessionlength>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout-session-length/`, { workoutSessionLength });
      return data;
    }
  );


export const updateWorkoutSessionLength = createAsyncThunk(
  "put/workout-session-length",
  async (workoutSessionLength: Partial<Workoutsessionlength>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout-session-length/`, { workoutSessionLength });
    return data;
  }
);

export const getWorkoutSessionLength = createAsyncThunk(
  "get/workout-session-length",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-session-length/${id}`);
    return data;
  }
);

export const deleteWorkoutSessionLength = createAsyncThunk(
  "delete/workout-session-length",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout-session-length/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutSessionLengthCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutSessionLengthsSlice = createSlice({
  name: "workoutSessionLengths",
  initialState,
  reducers: {
    clearWorkoutSessionLengthItems(state: WorkoutSessionLengthCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutSessionLengthError(state: WorkoutSessionLengthCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkoutSessionLengths.pending || searchWorkoutSessionLengths.pending, (state: WorkoutSessionLengthCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkoutSessionLengths.fulfilled || searchWorkoutSessionLengths.fulfilled, (state: WorkoutSessionLengthCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkoutSessionLengths.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkoutSessionLength.pending, (state: WorkoutSessionLengthCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkoutSessionLength.pending, (state: WorkoutSessionLengthCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkoutSessionLength.pending, (state: WorkoutSessionLengthCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkoutSessionLength.fulfilled, (state: WorkoutSessionLengthCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkoutSessionLength.fulfilled, (state: WorkoutSessionLengthCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkoutSessionLength.fulfilled, (state: WorkoutSessionLengthCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkoutSessionLength.pending, (state: WorkoutSessionLengthCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkoutSessionLength.fulfilled, (state: WorkoutSessionLengthCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkoutSessionLength.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkoutSessionLength.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkoutSessionLength.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("WorkoutSessionLength")?.reducerConfig(builder);
  },
});

export const workoutSessionLengthSelector = (id: number) => (state: AppState) => {
  return state.workoutSessionLengths?.items?.find((o) => o.Id === id);
}; 

export const workoutSessionLengthLoading = createSelector(
  (state: AppState) => state.workoutSessionLengths.status,
  status => status === 'pending'
);

export const workoutSessionLengthErrorSelector = createSelector(
  (state: AppState) => state.workoutSessionLengths,
  status => status.error
);


export const workoutSessionLengthsSelector = createSelector(
  (state: AppState) => state.workoutSessionLengths,
  state => state.items
);

export const workoutSessionLengthsLoading = createSelector(
  (state: AppState) => state.workoutSessionLengths.status,
  status => status === 'pending'
);

export const workoutSessionLengthsErrorSelector = createSelector(
  (state: AppState) => state.workoutSessionLengths,
  status => status.error
);

export const { clearWorkoutSessionLengthItems, clearWorkoutSessionLengthError } = workoutSessionLengthsSlice.actions;

export default workoutSessionLengthsSlice.reducer;
