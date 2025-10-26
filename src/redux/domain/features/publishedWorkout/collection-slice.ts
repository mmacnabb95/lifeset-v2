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
import { PublishedWorkoutCollectionState } from "./published-workout-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Publishedworkout } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: PublishedWorkoutCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("PublishedWorkout")?.thunkConfig();
export {thunks}; 


export const getPublishedWorkouts = createAsyncThunk(
  "get/published-workouts",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`published-workout?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchPublishedWorkouts = createAsyncThunk(
  "get/published-workouts",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`published-workout-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getPublishedWorkout = createAsyncThunk(
  "get/published-workout",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`published-workout/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: PublishedWorkoutCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const publishedWorkoutsSlice = createSlice({
  name: "publishedWorkouts",
  initialState,
  reducers: {
    clearPublishedWorkoutItems(state: PublishedWorkoutCollectionState) {
      Object.assign(state, initialState);
    },
    clearPublishedWorkoutError(state: PublishedWorkoutCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPublishedWorkouts.pending || searchPublishedWorkouts.pending, (state: PublishedWorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getPublishedWorkouts.fulfilled || searchPublishedWorkouts.fulfilled, (state: PublishedWorkoutCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getPublishedWorkouts.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getPublishedWorkout.pending, (state: PublishedWorkoutCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getPublishedWorkout.fulfilled, (state: PublishedWorkoutCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getPublishedWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("PublishedWorkout")?.reducerConfig(builder);
  },
});

export const publishedWorkoutSelector = (id: number) => (state: AppState) => {
  return state.publishedWorkouts?.items?.find((o) => o.Id === id);
}; 

export const publishedWorkoutLoading = createSelector(
  (state: AppState) => state.publishedWorkouts.status,
  status => status === 'pending'
);

export const publishedWorkoutErrorSelector = createSelector(
  (state: AppState) => state.publishedWorkouts,
  status => status.error
);


export const publishedWorkoutsSelector = createSelector(
  (state: AppState) => state.publishedWorkouts,
  state => state.items
);

export const publishedWorkoutsLoading = createSelector(
  (state: AppState) => state.publishedWorkouts.status,
  status => status === 'pending'
);

export const publishedWorkoutsErrorSelector = createSelector(
  (state: AppState) => state.publishedWorkouts,
  status => status.error
);

export const { clearPublishedWorkoutItems, clearPublishedWorkoutError } = publishedWorkoutsSlice.actions;

export default publishedWorkoutsSlice.reducer;
