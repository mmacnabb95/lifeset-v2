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
import { CompanyUserCollectionState } from "./company-user-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Companyuser } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CompanyUserCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CompanyUser")?.thunkConfig();
export {thunks}; 


export const getCompanyUsers = createAsyncThunk(
  "get/company-users",
  async (options?: { company?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-user?company=${options?.company}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCompanyUsers = createAsyncThunk(
  "get/company-users",
  async ({ company, search, offset, limit, filter }: { company?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`company-user-search?company=${company}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCompanyUser = createAsyncThunk(
    "post/company-user",
    async (companyUser: Partial<Companyuser>) => {
      const client = await fetchClient();
      const { data } = await client.post(`company-user/`, { companyUser });
      return data;
    }
  );


export const updateCompanyUser = createAsyncThunk(
  "put/company-user",
  async (companyUser: Partial<Companyuser>) => {
    const client = await fetchClient();
    const { data } = await client.put(`company-user/`, { companyUser });
    return data;
  }
);

export const getCompanyUser = createAsyncThunk(
  "get/company-user",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-user/${id}`);
    return data;
  }
);

export const deleteCompanyUser = createAsyncThunk(
  "delete/company-user",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`company-user/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: CompanyUserCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Company : undefined;

//   if(currentStateConstraint && actionArgs.company && Number(actionArgs.company) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Company : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CompanyUserCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const companyUsersSlice = createSlice({
  name: "companyUsers",
  initialState,
  reducers: {
    clearCompanyUserItems(state: CompanyUserCollectionState) {
      Object.assign(state, initialState);
    },
    clearCompanyUserError(state: CompanyUserCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyUsers.pending || searchCompanyUsers.pending, (state: CompanyUserCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCompanyUsers.fulfilled || searchCompanyUsers.fulfilled, (state: CompanyUserCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCompanyUsers.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCompanyUser.pending, (state: CompanyUserCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCompanyUser.pending, (state: CompanyUserCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCompanyUser.pending, (state: CompanyUserCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCompanyUser.fulfilled, (state: CompanyUserCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCompanyUser.fulfilled, (state: CompanyUserCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCompanyUser.fulfilled, (state: CompanyUserCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCompanyUser.pending, (state: CompanyUserCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCompanyUser.fulfilled, (state: CompanyUserCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCompanyUser.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCompanyUser.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCompanyUser.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("CompanyUser")?.reducerConfig(builder);
  },
});

export const companyUserSelector = (id: number) => (state: AppState) => {
  return state.companyUsers?.items?.find((o) => o.Id === id);
}; 

export const companyUserLoading = createSelector(
  (state: AppState) => state.companyUsers.status,
  status => status === 'pending'
);

export const companyUserErrorSelector = createSelector(
  (state: AppState) => state.companyUsers,
  status => status.error
);


export const companyUsersSelector = (company?: number) => (state: AppState) => {
  if (!company) {
    return undefined;
  }
  return state.companyUsers?.items?.filter((q) => q.Company === company);
}; 

export const companyUsersLoading = createSelector(
  (state: AppState) => state.companyUsers.status,
  status => status === 'pending'
);

export const companyUsersErrorSelector = createSelector(
  (state: AppState) => state.companyUsers,
  status => status.error
);

export const { clearCompanyUserItems, clearCompanyUserError } = companyUsersSlice.actions;

export default companyUsersSlice.reducer;
