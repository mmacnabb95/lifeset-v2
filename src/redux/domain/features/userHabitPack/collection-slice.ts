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
import { UserHabitPackCollectionState } from "./user-habit-pack-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userhabitpack } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserHabitPackCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserHabitPack")?.thunkConfig();
export {thunks}; 


export const getUserHabitPacks = createAsyncThunk(
  "get/user-habit-packs",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserHabitPacks = createAsyncThunk(
  "get/user-habit-packs",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-habit-pack-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserHabitPack = createAsyncThunk(
    "post/user-habit-pack",
    async (userHabitPack: Partial<Userhabitpack>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-habit-pack/`, { userHabitPack });
      return data;
    }
  );


export const updateUserHabitPack = createAsyncThunk(
  "put/user-habit-pack",
  async (userHabitPack: Partial<Userhabitpack>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-habit-pack/`, { userHabitPack });
    return data;
  }
);

export const getUserHabitPack = createAsyncThunk(
  "get/user-habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack/${id}`);
    return data;
  }
);

export const deleteUserHabitPack = createAsyncThunk(
  "delete/user-habit-pack",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-habit-pack/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: UserHabitPackCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: UserHabitPackCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userHabitPacksSlice = createSlice({
  name: "userHabitPacks",
  initialState,
  reducers: {
    clearUserHabitPackItems(state: UserHabitPackCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserHabitPackError(state: UserHabitPackCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserHabitPacks.pending || searchUserHabitPacks.pending, (state: UserHabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserHabitPacks.fulfilled || searchUserHabitPacks.fulfilled, (state: UserHabitPackCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserHabitPacks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserHabitPack.pending, (state: UserHabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserHabitPack.pending, (state: UserHabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserHabitPack.pending, (state: UserHabitPackCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserHabitPack.fulfilled, (state: UserHabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserHabitPack.fulfilled, (state: UserHabitPackCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserHabitPack.fulfilled, (state: UserHabitPackCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserHabitPack.pending, (state: UserHabitPackCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserHabitPack.fulfilled, (state: UserHabitPackCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserHabitPack.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserHabitPack")?.reducerConfig(builder);
  },
});

export const userHabitPackSelector = (id: number) => (state: AppState) => {
  return state.userHabitPacks?.items?.find((o) => o.Id === id);
}; 

export const userHabitPackLoading = createSelector(
  (state: AppState) => state.userHabitPacks.status,
  status => status === 'pending'
);

export const userHabitPackErrorSelector = createSelector(
  (state: AppState) => state.userHabitPacks,
  status => status.error
);


export const userHabitPacksSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.userHabitPacks?.items?.filter((q) => q.User === user);
}; 

export const userHabitPacksLoading = createSelector(
  (state: AppState) => state.userHabitPacks.status,
  status => status === 'pending'
);

export const userHabitPacksErrorSelector = createSelector(
  (state: AppState) => state.userHabitPacks,
  status => status.error
);

export const { clearUserHabitPackItems, clearUserHabitPackError } = userHabitPacksSlice.actions;

export default userHabitPacksSlice.reducer;
