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
import { UserHabitPackHabitCollectionState } from "./user-habit-pack-habit-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userhabitpackhabit } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserHabitPackHabitCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserHabitPackHabit")?.thunkConfig();
export {thunks}; 


export const getUserHabitPackHabits = createAsyncThunk(
  "get/user-habit-pack-habits",
  async (options?: { userhabitpack?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-habit?userhabitpack=${options?.userhabitpack}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserHabitPackHabits = createAsyncThunk(
  "get/user-habit-pack-habits",
  async ({ userhabitpack, search, offset, limit, filter }: { userhabitpack?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-habit-pack-habit-search?userhabitpack=${userhabitpack}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserHabitPackHabit = createAsyncThunk(
    "post/user-habit-pack-habit",
    async (userHabitPackHabit: Partial<Userhabitpackhabit>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-habit-pack-habit/`, { userHabitPackHabit });
      return data;
    }
  );


export const updateUserHabitPackHabit = createAsyncThunk(
  "put/user-habit-pack-habit",
  async (userHabitPackHabit: Partial<Userhabitpackhabit>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-habit-pack-habit/`, { userHabitPackHabit });
    return data;
  }
);

export const getUserHabitPackHabit = createAsyncThunk(
  "get/user-habit-pack-habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-habit/${id}`);
    return data;
  }
);

export const deleteUserHabitPackHabit = createAsyncThunk(
  "delete/user-habit-pack-habit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-habit-pack-habit/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserHabitPackHabitCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].UserHabitPack : undefined;

//   if(currentStateConstraint && actionArgs.userhabitpack && Number(actionArgs.userhabitpack) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].UserHabitPack : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: UserHabitPackHabitCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userHabitPackHabitsSlice = createSlice({
  name: "userHabitPackHabits",
  initialState,
  reducers: {
    clearUserHabitPackHabitItems(state: UserHabitPackHabitCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserHabitPackHabitError(state: UserHabitPackHabitCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserHabitPackHabits.pending || searchUserHabitPackHabits.pending, (state: UserHabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserHabitPackHabits.fulfilled || searchUserHabitPackHabits.fulfilled, (state: UserHabitPackHabitCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserHabitPackHabits.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserHabitPackHabit.pending, (state: UserHabitPackHabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserHabitPackHabit.pending, (state: UserHabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserHabitPackHabit.pending, (state: UserHabitPackHabitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserHabitPackHabit.fulfilled, (state: UserHabitPackHabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserHabitPackHabit.fulfilled, (state: UserHabitPackHabitCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserHabitPackHabit.fulfilled, (state: UserHabitPackHabitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserHabitPackHabit.pending, (state: UserHabitPackHabitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserHabitPackHabit.fulfilled, (state: UserHabitPackHabitCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserHabitPackHabit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserHabitPackHabit")?.reducerConfig(builder);
  },
});

export const userHabitPackHabitSelector = (id: number) => (state: AppState) => {
  return state.userHabitPackHabits?.items?.find((o) => o.Id === id);
}; 

export const userHabitPackHabitLoading = createSelector(
  (state: AppState) => state.userHabitPackHabits.status,
  status => status === 'pending'
);

export const userHabitPackHabitErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackHabits,
  status => status.error
);


export const userHabitPackHabitsSelector = (userHabitPack?: number) => (state: AppState) => {
  if (!userHabitPack) {
    return undefined;
  }
  return state.userHabitPackHabits?.items?.filter((q) => q.UserHabitPack === userHabitPack);
}; 

export const userHabitPackHabitsLoading = createSelector(
  (state: AppState) => state.userHabitPackHabits.status,
  status => status === 'pending'
);

export const userHabitPackHabitsErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackHabits,
  status => status.error
);

export const { clearUserHabitPackHabitItems, clearUserHabitPackHabitError } = userHabitPackHabitsSlice.actions;

export default userHabitPackHabitsSlice.reducer;
