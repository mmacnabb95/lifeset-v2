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
import { WorkoutLocationCollectionState } from "./workout-location-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Workoutlocation } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: WorkoutLocationCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("WorkoutLocation")?.thunkConfig();
export {thunks}; 


export const getWorkoutLocations = createAsyncThunk(
  "get/workout-locations",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-location?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchWorkoutLocations = createAsyncThunk(
  "get/workout-locations",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`workout-location-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createWorkoutLocation = createAsyncThunk(
    "post/workout-location",
    async (workoutLocation: Partial<Workoutlocation>) => {
      const client = await fetchClient();
      const { data } = await client.post(`workout-location/`, { workoutLocation });
      return data;
    }
  );


export const updateWorkoutLocation = createAsyncThunk(
  "put/workout-location",
  async (workoutLocation: Partial<Workoutlocation>) => {
    const client = await fetchClient();
    const { data } = await client.put(`workout-location/`, { workoutLocation });
    return data;
  }
);

export const getWorkoutLocation = createAsyncThunk(
  "get/workout-location",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`workout-location/${id}`);
    return data;
  }
);

export const deleteWorkoutLocation = createAsyncThunk(
  "delete/workout-location",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`workout-location/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: WorkoutLocationCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const workoutLocationsSlice = createSlice({
  name: "workoutLocations",
  initialState,
  reducers: {
    clearWorkoutLocationItems(state: WorkoutLocationCollectionState) {
      Object.assign(state, initialState);
    },
    clearWorkoutLocationError(state: WorkoutLocationCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getWorkoutLocations.pending || searchWorkoutLocations.pending, (state: WorkoutLocationCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getWorkoutLocations.fulfilled || searchWorkoutLocations.fulfilled, (state: WorkoutLocationCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getWorkoutLocations.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getWorkoutLocation.pending, (state: WorkoutLocationCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteWorkoutLocation.pending, (state: WorkoutLocationCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateWorkoutLocation.pending, (state: WorkoutLocationCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getWorkoutLocation.fulfilled, (state: WorkoutLocationCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteWorkoutLocation.fulfilled, (state: WorkoutLocationCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateWorkoutLocation.fulfilled, (state: WorkoutLocationCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createWorkoutLocation.pending, (state: WorkoutLocationCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createWorkoutLocation.fulfilled, (state: WorkoutLocationCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getWorkoutLocation.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteWorkoutLocation.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateWorkoutLocation.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("WorkoutLocation")?.reducerConfig(builder);
  },
});

export const workoutLocationSelector = (id: number) => (state: AppState) => {
  return state.workoutLocations?.items?.find((o) => o.Id === id);
}; 

export const workoutLocationLoading = createSelector(
  (state: AppState) => state.workoutLocations.status,
  status => status === 'pending'
);

export const workoutLocationErrorSelector = createSelector(
  (state: AppState) => state.workoutLocations,
  status => status.error
);


export const workoutLocationsSelector = createSelector(
  (state: AppState) => state.workoutLocations,
  state => state.items
);

export const workoutLocationsLoading = createSelector(
  (state: AppState) => state.workoutLocations.status,
  status => status === 'pending'
);

export const workoutLocationsErrorSelector = createSelector(
  (state: AppState) => state.workoutLocations,
  status => status.error
);

export const { clearWorkoutLocationItems, clearWorkoutLocationError } = workoutLocationsSlice.actions;

export default workoutLocationsSlice.reducer;
