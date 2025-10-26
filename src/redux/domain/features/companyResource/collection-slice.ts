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
import { CompanyResourceCollectionState } from "./company-resource-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Companyresource } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CompanyResourceCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CompanyResource")?.thunkConfig();
export {thunks}; 


export const getCompanyResources = createAsyncThunk(
  "get/company-resources",
  async (options?: { company?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-resource?company=${options?.company}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCompanyResources = createAsyncThunk(
  "get/company-resources",
  async ({ company, search, offset, limit, filter }: { company?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`company-resource-search?company=${company}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCompanyResource = createAsyncThunk(
    "post/company-resource",
    async (companyResource: Partial<Companyresource>) => {
      const client = await fetchClient();
      const { data } = await client.post(`company-resource/`, { companyResource });
      return data;
    }
  );


export const updateCompanyResource = createAsyncThunk(
  "put/company-resource",
  async (companyResource: Partial<Companyresource>) => {
    const client = await fetchClient();
    const { data } = await client.put(`company-resource/`, { companyResource });
    return data;
  }
);

export const getCompanyResource = createAsyncThunk(
  "get/company-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-resource/${id}`);
    return data;
  }
);

export const deleteCompanyResource = createAsyncThunk(
  "delete/company-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`company-resource/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: CompanyResourceCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: CompanyResourceCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const companyResourcesSlice = createSlice({
  name: "companyResources",
  initialState,
  reducers: {
    clearCompanyResourceItems(state: CompanyResourceCollectionState) {
      Object.assign(state, initialState);
    },
    clearCompanyResourceError(state: CompanyResourceCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyResources.pending || searchCompanyResources.pending, (state: CompanyResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCompanyResources.fulfilled || searchCompanyResources.fulfilled, (state: CompanyResourceCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCompanyResources.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCompanyResource.pending, (state: CompanyResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCompanyResource.pending, (state: CompanyResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCompanyResource.pending, (state: CompanyResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCompanyResource.fulfilled, (state: CompanyResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCompanyResource.fulfilled, (state: CompanyResourceCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCompanyResource.fulfilled, (state: CompanyResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCompanyResource.pending, (state: CompanyResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCompanyResource.fulfilled, (state: CompanyResourceCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCompanyResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCompanyResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCompanyResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("CompanyResource")?.reducerConfig(builder);
  },
});

export const companyResourceSelector = (id: number) => (state: AppState) => {
  return state.companyResources?.items?.find((o) => o.Id === id);
}; 

export const companyResourceLoading = createSelector(
  (state: AppState) => state.companyResources.status,
  status => status === 'pending'
);

export const companyResourceErrorSelector = createSelector(
  (state: AppState) => state.companyResources,
  status => status.error
);


export const companyResourcesSelector = (company?: number) => (state: AppState) => {
  if (!company) {
    return undefined;
  }
  return state.companyResources?.items?.filter((q) => q.Company === company);
}; 

export const companyResourcesLoading = createSelector(
  (state: AppState) => state.companyResources.status,
  status => status === 'pending'
);

export const companyResourcesErrorSelector = createSelector(
  (state: AppState) => state.companyResources,
  status => status.error
);

export const { clearCompanyResourceItems, clearCompanyResourceError } = companyResourcesSlice.actions;

export default companyResourcesSlice.reducer;
