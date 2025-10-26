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
import { UserHabitPackUseCollectionState } from "./user-habit-pack-use-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userhabitpackuse } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserHabitPackUseCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserHabitPackUse")?.thunkConfig();
export {thunks}; 


export const getUserHabitPackUses = createAsyncThunk(
  "get/user-habit-pack-uses",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-use?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserHabitPackUses = createAsyncThunk(
  "get/user-habit-pack-uses",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-habit-pack-use-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserHabitPackUse = createAsyncThunk(
    "post/user-habit-pack-use",
    async (userHabitPackUse: Partial<Userhabitpackuse>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-habit-pack-use/`, { userHabitPackUse });
      return data;
    }
  );


export const updateUserHabitPackUse = createAsyncThunk(
  "put/user-habit-pack-use",
  async (userHabitPackUse: Partial<Userhabitpackuse>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-habit-pack-use/`, { userHabitPackUse });
    return data;
  }
);

export const getUserHabitPackUse = createAsyncThunk(
  "get/user-habit-pack-use",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-use/${id}`);
    return data;
  }
);

export const deleteUserHabitPackUse = createAsyncThunk(
  "delete/user-habit-pack-use",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-habit-pack-use/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserHabitPackUseCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: UserHabitPackUseCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userHabitPackUsesSlice = createSlice({
  name: "userHabitPackUses",
  initialState,
  reducers: {
    clearUserHabitPackUseItems(state: UserHabitPackUseCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserHabitPackUseError(state: UserHabitPackUseCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserHabitPackUses.pending || searchUserHabitPackUses.pending, (state: UserHabitPackUseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserHabitPackUses.fulfilled || searchUserHabitPackUses.fulfilled, (state: UserHabitPackUseCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserHabitPackUses.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserHabitPackUse.pending, (state: UserHabitPackUseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserHabitPackUse.pending, (state: UserHabitPackUseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserHabitPackUse.pending, (state: UserHabitPackUseCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserHabitPackUse.fulfilled, (state: UserHabitPackUseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserHabitPackUse.fulfilled, (state: UserHabitPackUseCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserHabitPackUse.fulfilled, (state: UserHabitPackUseCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserHabitPackUse.pending, (state: UserHabitPackUseCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserHabitPackUse.fulfilled, (state: UserHabitPackUseCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserHabitPackUse.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserHabitPackUse.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserHabitPackUse.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserHabitPackUse")?.reducerConfig(builder);
  },
});

export const userHabitPackUseSelector = (id: number) => (state: AppState) => {
  return state.userHabitPackUses?.items?.find((o) => o.Id === id);
}; 

export const userHabitPackUseLoading = createSelector(
  (state: AppState) => state.userHabitPackUses.status,
  status => status === 'pending'
);

export const userHabitPackUseErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackUses,
  status => status.error
);


export const userHabitPackUsesSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.userHabitPackUses?.items?.filter((q) => q.User === user);
}; 

export const userHabitPackUsesLoading = createSelector(
  (state: AppState) => state.userHabitPackUses.status,
  status => status === 'pending'
);

export const userHabitPackUsesErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackUses,
  status => status.error
);

export const { clearUserHabitPackUseItems, clearUserHabitPackUseError } = userHabitPackUsesSlice.actions;

export default userHabitPackUsesSlice.reducer;
