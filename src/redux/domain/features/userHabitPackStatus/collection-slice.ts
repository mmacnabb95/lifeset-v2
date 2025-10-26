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
import { UserHabitPackStatusCollectionState } from "./user-habit-pack-status-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Userhabitpackstatus } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: UserHabitPackStatusCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("UserHabitPackStatus")?.thunkConfig();
export {thunks}; 


export const getUserHabitPackStatuss = createAsyncThunk(
  "get/user-habit-pack-statuss",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-status?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchUserHabitPackStatuss = createAsyncThunk(
  "get/user-habit-pack-statuss",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`user-habit-pack-status-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createUserHabitPackStatus = createAsyncThunk(
    "post/user-habit-pack-status",
    async (userHabitPackStatus: Partial<Userhabitpackstatus>) => {
      const client = await fetchClient();
      const { data } = await client.post(`user-habit-pack-status/`, { userHabitPackStatus });
      return data;
    }
  );


export const updateUserHabitPackStatus = createAsyncThunk(
  "put/user-habit-pack-status",
  async (userHabitPackStatus: Partial<Userhabitpackstatus>) => {
    const client = await fetchClient();
    const { data } = await client.put(`user-habit-pack-status/`, { userHabitPackStatus });
    return data;
  }
);

export const getUserHabitPackStatus = createAsyncThunk(
  "get/user-habit-pack-status",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`user-habit-pack-status/${id}`);
    return data;
  }
);

export const deleteUserHabitPackStatus = createAsyncThunk(
  "delete/user-habit-pack-status",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`user-habit-pack-status/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: UserHabitPackStatusCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const userHabitPackStatussSlice = createSlice({
  name: "userHabitPackStatuss",
  initialState,
  reducers: {
    clearUserHabitPackStatusItems(state: UserHabitPackStatusCollectionState) {
      Object.assign(state, initialState);
    },
    clearUserHabitPackStatusError(state: UserHabitPackStatusCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserHabitPackStatuss.pending || searchUserHabitPackStatuss.pending, (state: UserHabitPackStatusCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getUserHabitPackStatuss.fulfilled || searchUserHabitPackStatuss.fulfilled, (state: UserHabitPackStatusCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getUserHabitPackStatuss.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getUserHabitPackStatus.pending, (state: UserHabitPackStatusCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteUserHabitPackStatus.pending, (state: UserHabitPackStatusCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateUserHabitPackStatus.pending, (state: UserHabitPackStatusCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getUserHabitPackStatus.fulfilled, (state: UserHabitPackStatusCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteUserHabitPackStatus.fulfilled, (state: UserHabitPackStatusCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateUserHabitPackStatus.fulfilled, (state: UserHabitPackStatusCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createUserHabitPackStatus.pending, (state: UserHabitPackStatusCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createUserHabitPackStatus.fulfilled, (state: UserHabitPackStatusCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getUserHabitPackStatus.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteUserHabitPackStatus.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateUserHabitPackStatus.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("UserHabitPackStatus")?.reducerConfig(builder);
  },
});

export const userHabitPackStatusSelector = (id: number) => (state: AppState) => {
  return state.userHabitPackStatuss?.items?.find((o) => o.Id === id);
}; 

export const userHabitPackStatusLoading = createSelector(
  (state: AppState) => state.userHabitPackStatuss.status,
  status => status === 'pending'
);

export const userHabitPackStatusErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackStatuss,
  status => status.error
);


export const userHabitPackStatussSelector = createSelector(
  (state: AppState) => state.userHabitPackStatuss,
  state => state.items
);

export const userHabitPackStatussLoading = createSelector(
  (state: AppState) => state.userHabitPackStatuss.status,
  status => status === 'pending'
);

export const userHabitPackStatussErrorSelector = createSelector(
  (state: AppState) => state.userHabitPackStatuss,
  status => status.error
);

export const { clearUserHabitPackStatusItems, clearUserHabitPackStatusError } = userHabitPackStatussSlice.actions;

export default userHabitPackStatussSlice.reducer;
