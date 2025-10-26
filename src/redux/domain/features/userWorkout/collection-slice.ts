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
import { UserWorkoutCollectionState } from "./user-workout-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userworkout } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserWorkoutCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserWorkout")?.thunkConfig();
export {thunks}; 


export const getUserWorkouts = createAsyncThunk(
  "get/user-workouts",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserWorkouts = createAsyncThunk(
  "get/user-workouts",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-workout-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserWorkout = createAsyncThunk(
    "post/user-workout",
    async (userWorkout: Partial<Userworkout>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-workout/`, { userWorkout });
      return data;
    }
  );


export const updateUserWorkout = createAsyncThunk(
  "put/user-workout",
  async (userWorkout: Partial<Userworkout>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-workout/`, { userWorkout });
    return data;
  }
);

export const getUserWorkout = createAsyncThunk(
  "get/user-workout",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-workout/${id}`);
    return data;
  }
);

export const deleteUserWorkout = createAsyncThunk(
  "delete/user-workout",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-workout/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserWorkoutCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].User : undefined;

//   if(currentStateConstraint && actionArgs.user && Number(actionArgs.user) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].User : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: UserWorkoutCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userWorkoutsSlice = createSlice({
  name: "userWorkouts",
  initialState,
  reducers: {
    clearUserWorkoutItems(state: UserWorkoutCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserWorkoutError(state: UserWorkoutCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserWorkouts.pending || searchUserWorkouts.pending, (state: UserWorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserWorkouts.fulfilled || searchUserWorkouts.fulfilled, (state: UserWorkoutCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserWorkouts.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserWorkout.pending, (state: UserWorkoutCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserWorkout.pending, (state: UserWorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserWorkout.pending, (state: UserWorkoutCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserWorkout.fulfilled, (state: UserWorkoutCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserWorkout.fulfilled, (state: UserWorkoutCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserWorkout.fulfilled, (state: UserWorkoutCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserWorkout.pending, (state: UserWorkoutCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserWorkout.fulfilled, (state: UserWorkoutCollectionState, action) => {
      // First remove any existing items with the same Workout ID to prevent duplicates
      if (state.items) {
        state.items = state.items.filter(item => item.Workout !== action.payload.Workout);
      }
      // Then add the new item
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserWorkout.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserWorkout")?.reducerConfig(builder);
  },
});

export const userWorkoutSelector = (id: number) => (state: AppState) => {
  return state.userWorkouts?.items?.find((o) => o.Id === id);
}; 

export const userWorkoutLoading = createSelector(
  (state: AppState) => state.userWorkouts.status,
  status => status === 'pending'
);

export const userWorkoutErrorSelector = createSelector(
  (state: AppState) => state.userWorkouts,
  status => status.error
);


export const userWorkoutsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.userWorkouts?.items?.filter((q) => q.User === user);
}; 

export const userWorkoutsLoading = createSelector(
  (state: AppState) => state.userWorkouts.status,
  status => status === 'pending'
);

export const userWorkoutsErrorSelector = createSelector(
  (state: AppState) => state.userWorkouts,
  status => status.error
);

export const { clearUserWorkoutItems, clearUserWorkoutError } = userWorkoutsSlice.actions;

export default userWorkoutsSlice.reducer;
