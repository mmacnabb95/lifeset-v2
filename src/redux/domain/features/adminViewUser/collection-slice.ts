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
import { AdminViewUserCollectionState } from "./admin-view-user-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Adminviewuser } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: AdminViewUserCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("AdminViewUser")?.thunkConfig();
export {thunks}; 


export const getAdminViewUsers = createAsyncThunk(
  "get/admin-view-users",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`admin-view-user?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchAdminViewUsers = createAsyncThunk(
  "get/admin-view-users",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`admin-view-user-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getAdminViewUser = createAsyncThunk(
  "get/admin-view-user",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`admin-view-user/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: AdminViewUserCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const adminViewUsersSlice = createSlice({
  name: "adminViewUsers",
  initialState,
  reducers: {
    clearAdminViewUserItems(state: AdminViewUserCollectionState) {
      Object.assign(state, initialState);
    },
    clearAdminViewUserError(state: AdminViewUserCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAdminViewUsers.pending || searchAdminViewUsers.pending, (state: AdminViewUserCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getAdminViewUsers.fulfilled || searchAdminViewUsers.fulfilled, (state: AdminViewUserCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getAdminViewUsers.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getAdminViewUser.pending, (state: AdminViewUserCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getAdminViewUser.fulfilled, (state: AdminViewUserCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getAdminViewUser.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("AdminViewUser")?.reducerConfig(builder);
  },
});

export const adminViewUserSelector = (id: number) => (state: AppState) => {
  return state.adminViewUsers?.items?.find((o) => o.Id === id);
}; 

export const adminViewUserLoading = createSelector(
  (state: AppState) => state.adminViewUsers.status,
  status => status === 'pending'
);

export const adminViewUserErrorSelector = createSelector(
  (state: AppState) => state.adminViewUsers,
  status => status.error
);


export const adminViewUsersSelector = createSelector(
  (state: AppState) => state.adminViewUsers,
  state => state.items
);

export const adminViewUsersLoading = createSelector(
  (state: AppState) => state.adminViewUsers.status,
  status => status === 'pending'
);

export const adminViewUsersErrorSelector = createSelector(
  (state: AppState) => state.adminViewUsers,
  status => status.error
);

export const { clearAdminViewUserItems, clearAdminViewUserError } = adminViewUsersSlice.actions;

export default adminViewUsersSlice.reducer;
