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
import { UserWorkoutExerciseSetCollectionState } from "./user-workout-exercise-set-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userworkoutexerciseset } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserWorkoutExerciseSetCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserWorkoutExerciseSet")?.thunkConfig();
export {thunks}; 


export const getUserWorkoutExerciseSets = createAsyncThunk(
  "get/user-workout-exercise-sets",
  async (options?: { userworkout?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout-exercise-set?userworkout=${options?.userworkout}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserWorkoutExerciseSets = createAsyncThunk(
  "get/user-workout-exercise-sets",
  async ({ userworkout, search, offset, limit, filter }: { userworkout?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-workout-exercise-set-search?userworkout=${userworkout}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserWorkoutExerciseSet = createAsyncThunk(
    "post/user-workout-exercise-set",
    async (userWorkoutExerciseSet: Partial<Userworkoutexerciseset>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-workout-exercise-set/`, { userWorkoutExerciseSet });
      return data;
    }
  );


export const updateUserWorkoutExerciseSet = createAsyncThunk(
  "put/user-workout-exercise-set",
  async (userWorkoutExerciseSet: Partial<Userworkoutexerciseset>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-workout-exercise-set/`, { userWorkoutExerciseSet });
    return data;
  }
);

export const getUserWorkoutExerciseSet = createAsyncThunk(
  "get/user-workout-exercise-set",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout-exercise-set/${id}`);
    return data;
  }
);

export const deleteUserWorkoutExerciseSet = createAsyncThunk(
  "delete/user-workout-exercise-set",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-workout-exercise-set/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserWorkoutExerciseSetCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: UserWorkoutExerciseSetCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userWorkoutExerciseSetsSlice = createSlice({
  name: "userWorkoutExerciseSets",
  initialState,
  reducers: {
    clearUserWorkoutExerciseSetItems(state: UserWorkoutExerciseSetCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserWorkoutExerciseSetError(state: UserWorkoutExerciseSetCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserWorkoutExerciseSets.pending || searchUserWorkoutExerciseSets.pending, (state: UserWorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserWorkoutExerciseSets.fulfilled || searchUserWorkoutExerciseSets.fulfilled, (state: UserWorkoutExerciseSetCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserWorkoutExerciseSets.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserWorkoutExerciseSet.pending, (state: UserWorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserWorkoutExerciseSet.pending, (state: UserWorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserWorkoutExerciseSet.pending, (state: UserWorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserWorkoutExerciseSet.fulfilled, (state: UserWorkoutExerciseSetCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserWorkoutExerciseSet.fulfilled, (state: UserWorkoutExerciseSetCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserWorkoutExerciseSet.fulfilled, (state: UserWorkoutExerciseSetCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserWorkoutExerciseSet.pending, (state: UserWorkoutExerciseSetCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserWorkoutExerciseSet.fulfilled, (state: UserWorkoutExerciseSetCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserWorkoutExerciseSet.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserWorkoutExerciseSet")?.reducerConfig(builder);
  },
});

export const userWorkoutExerciseSetSelector = (id: number) => (state: AppState) => {
  return state.userWorkoutExerciseSets?.items?.find((o) => o.Id === id);
}; 

export const userWorkoutExerciseSetLoading = createSelector(
  (state: AppState) => state.userWorkoutExerciseSets.status,
  status => status === 'pending'
);

export const userWorkoutExerciseSetErrorSelector = createSelector(
  (state: AppState) => state.userWorkoutExerciseSets,
  status => status.error
);


export const userWorkoutExerciseSetsSelector = (userWorkout?: number) => (state: AppState) => {
  if (!userWorkout) {
    return undefined;
  }
  return state.userWorkoutExerciseSets?.items?.filter((q) => q.UserWorkout === userWorkout);
}; 

export const userWorkoutExerciseSetsLoading = createSelector(
  (state: AppState) => state.userWorkoutExerciseSets.status,
  status => status === 'pending'
);

export const userWorkoutExerciseSetsErrorSelector = createSelector(
  (state: AppState) => state.userWorkoutExerciseSets,
  status => status.error
);

export const { clearUserWorkoutExerciseSetItems, clearUserWorkoutExerciseSetError } = userWorkoutExerciseSetsSlice.actions;

export default userWorkoutExerciseSetsSlice.reducer;
