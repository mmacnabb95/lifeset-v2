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
import { UserWorkoutDayExerciseCollectionState } from "./user-workout-day-exercise-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userworkoutdayexercise } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserWorkoutDayExerciseCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserWorkoutDayExercise")?.thunkConfig();
export {thunks}; 


export const getUserWorkoutDayExercises = createAsyncThunk(
  "get/user-workout-day-exercises",
  async (options?: { userworkout?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout-day-exercise?userworkout=${options?.userworkout}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserWorkoutDayExercises = createAsyncThunk(
  "get/user-workout-day-exercises",
  async ({ userworkout, search, offset, limit, filter }: { userworkout?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-workout-day-exercise-search?userworkout=${userworkout}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserWorkoutDayExercise = createAsyncThunk(
    "post/user-workout-day-exercise",
    async (userWorkoutDayExercise: Partial<Userworkoutdayexercise>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-workout-day-exercise/`, { userWorkoutDayExercise });
      return data;
    }
  );


export const updateUserWorkoutDayExercise = createAsyncThunk(
  "put/user-workout-day-exercise",
  async (userWorkoutDayExercise: Partial<Userworkoutdayexercise>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-workout-day-exercise/`, { userWorkoutDayExercise });
    return data;
  }
);

export const getUserWorkoutDayExercise = createAsyncThunk(
  "get/user-workout-day-exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout-day-exercise/${id}`);
    return data;
  }
);

export const deleteUserWorkoutDayExercise = createAsyncThunk(
  "delete/user-workout-day-exercise",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-workout-day-exercise/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserWorkoutDayExerciseCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].UserWorkout : undefined;

//   if(currentStateConstraint && actionArgs.userworkout && Number(actionArgs.userworkout) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].UserWorkout : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: UserWorkoutDayExerciseCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userWorkoutDayExercisesSlice = createSlice({
  name: "userWorkoutDayExercises",
  initialState,
  reducers: {
    clearUserWorkoutDayExerciseItems(state: UserWorkoutDayExerciseCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserWorkoutDayExerciseError(state: UserWorkoutDayExerciseCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserWorkoutDayExercises.pending || searchUserWorkoutDayExercises.pending, (state: UserWorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserWorkoutDayExercises.fulfilled || searchUserWorkoutDayExercises.fulfilled, (state: UserWorkoutDayExerciseCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserWorkoutDayExercises.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserWorkoutDayExercise.pending, (state: UserWorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserWorkoutDayExercise.pending, (state: UserWorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserWorkoutDayExercise.pending, (state: UserWorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserWorkoutDayExercise.fulfilled, (state: UserWorkoutDayExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserWorkoutDayExercise.fulfilled, (state: UserWorkoutDayExerciseCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserWorkoutDayExercise.fulfilled, (state: UserWorkoutDayExerciseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserWorkoutDayExercise.pending, (state: UserWorkoutDayExerciseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserWorkoutDayExercise.fulfilled, (state: UserWorkoutDayExerciseCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserWorkoutDayExercise.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserWorkoutDayExercise")?.reducerConfig(builder);
  },
});

export const userWorkoutDayExerciseSelector = (id: number) => (state: AppState) => {
  return state.userWorkoutDayExercises?.items?.find((o) => o.Id === id);
}; 

export const userWorkoutDayExerciseLoading = createSelector(
  (state: AppState) => state.userWorkoutDayExercises.status,
  status => status === 'pending'
);

export const userWorkoutDayExerciseErrorSelector = createSelector(
  (state: AppState) => state.userWorkoutDayExercises,
  status => status.error
);


export const userWorkoutDayExercisesSelector = (userWorkout?: number) => (state: AppState) => {
  if (!userWorkout) {
    return undefined;
  }
  return state.userWorkoutDayExercises?.items?.filter((q) => q.UserWorkout === userWorkout);
}; 

export const userWorkoutDayExercisesLoading = createSelector(
  (state: AppState) => state.userWorkoutDayExercises.status,
  status => status === 'pending'
);

export const userWorkoutDayExercisesErrorSelector = createSelector(
  (state: AppState) => state.userWorkoutDayExercises,
  status => status.error
);

export const { clearUserWorkoutDayExerciseItems, clearUserWorkoutDayExerciseError } = userWorkoutDayExercisesSlice.actions;

export default userWorkoutDayExercisesSlice.reducer;
