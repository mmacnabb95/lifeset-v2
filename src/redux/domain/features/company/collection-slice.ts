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
import { CompanyCollectionState } from "./company-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Company } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CompanyCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Company")?.thunkConfig();
export {thunks}; 


export const getCompanys = createAsyncThunk(
  "get/companys",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`company?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCompanys = createAsyncThunk(
  "get/companys",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`company-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCompany = createAsyncThunk(
    "post/company",
    async (company: Partial<Company>) => {
      const client = await fetchClient();
      const { data } = await client.post(`company/`, { company });
      return data;
    }
  );


export const updateCompany = createAsyncThunk(
  "put/company",
  async (company: Partial<Company>) => {
    const client = await fetchClient();
    const { data } = await client.put(`company/`, { company });
    return data;
  }
);

export const getCompany = createAsyncThunk(
  "get/company",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`company/${id}`);
    return data;
  }
);

export const deleteCompany = createAsyncThunk(
  "delete/company",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`company/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CompanyCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const companysSlice = createSlice({
  name: "companys",
  initialState,
  reducers: {
    clearCompanyItems(state: CompanyCollectionState) {
      Object.assign(state, initialState);
    },
    clearCompanyError(state: CompanyCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanys.pending || searchCompanys.pending, (state: CompanyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCompanys.fulfilled || searchCompanys.fulfilled, (state: CompanyCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCompanys.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCompany.pending, (state: CompanyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCompany.pending, (state: CompanyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCompany.pending, (state: CompanyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCompany.fulfilled, (state: CompanyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCompany.fulfilled, (state: CompanyCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCompany.fulfilled, (state: CompanyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCompany.pending, (state: CompanyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCompany.fulfilled, (state: CompanyCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCompany.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCompany.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCompany.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Company")?.reducerConfig(builder);
  },
});

export const companySelector = (id: number) => (state: AppState) => {
  return state.companys?.items?.find((o) => o.Id === id);
}; 

export const companyLoading = createSelector(
  (state: AppState) => state.companys.status,
  status => status === 'pending'
);

export const companyErrorSelector = createSelector(
  (state: AppState) => state.companys,
  status => status.error
);


export const companysSelector = createSelector(
  (state: AppState) => state.companys,
  state => state.items
);

export const companysLoading = createSelector(
  (state: AppState) => state.companys.status,
  status => status === 'pending'
);

export const companysErrorSelector = createSelector(
  (state: AppState) => state.companys,
  status => status.error
);

export const { clearCompanyItems, clearCompanyError } = companysSlice.actions;

export default companysSlice.reducer;
