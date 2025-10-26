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
import { CompanyMediaKeyCollectionState } from "./company-media-key-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Companymediakey } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CompanyMediaKeyCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CompanyMediaKey")?.thunkConfig();
export {thunks}; 


export const getCompanyMediaKeys = createAsyncThunk(
  "get/company-media-keys",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-media-key?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCompanyMediaKeys = createAsyncThunk(
  "get/company-media-keys",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`company-media-key-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCompanyMediaKey = createAsyncThunk(
    "post/company-media-key",
    async (companyMediaKey: Partial<Companymediakey>) => {
      const client = await fetchClient();
      const { data } = await client.post(`company-media-key/`, { companyMediaKey });
      return data;
    }
  );


export const updateCompanyMediaKey = createAsyncThunk(
  "put/company-media-key",
  async (companyMediaKey: Partial<Companymediakey>) => {
    const client = await fetchClient();
    const { data } = await client.put(`company-media-key/`, { companyMediaKey });
    return data;
  }
);

export const getCompanyMediaKey = createAsyncThunk(
  "get/company-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`company-media-key/${id}`);
    return data;
  }
);

export const deleteCompanyMediaKey = createAsyncThunk(
  "delete/company-media-key",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`company-media-key/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CompanyMediaKeyCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const companyMediaKeysSlice = createSlice({
  name: "companyMediaKeys",
  initialState,
  reducers: {
    clearCompanyMediaKeyItems(state: CompanyMediaKeyCollectionState) {
      Object.assign(state, initialState);
    },
    clearCompanyMediaKeyError(state: CompanyMediaKeyCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyMediaKeys.pending || searchCompanyMediaKeys.pending, (state: CompanyMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCompanyMediaKeys.fulfilled || searchCompanyMediaKeys.fulfilled, (state: CompanyMediaKeyCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCompanyMediaKeys.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCompanyMediaKey.pending, (state: CompanyMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCompanyMediaKey.pending, (state: CompanyMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCompanyMediaKey.pending, (state: CompanyMediaKeyCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCompanyMediaKey.fulfilled, (state: CompanyMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCompanyMediaKey.fulfilled, (state: CompanyMediaKeyCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCompanyMediaKey.fulfilled, (state: CompanyMediaKeyCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCompanyMediaKey.pending, (state: CompanyMediaKeyCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCompanyMediaKey.fulfilled, (state: CompanyMediaKeyCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCompanyMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCompanyMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCompanyMediaKey.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("CompanyMediaKey")?.reducerConfig(builder);
  },
});

export const companyMediaKeySelector = (id: number) => (state: AppState) => {
  return state.companyMediaKeys?.items?.find((o) => o.Id === id);
}; 

export const companyMediaKeyLoading = createSelector(
  (state: AppState) => state.companyMediaKeys.status,
  status => status === 'pending'
);

export const companyMediaKeyErrorSelector = createSelector(
  (state: AppState) => state.companyMediaKeys,
  status => status.error
);


export const companyMediaKeysSelector = createSelector(
  (state: AppState) => state.companyMediaKeys,
  state => state.items
);

export const companyMediaKeysLoading = createSelector(
  (state: AppState) => state.companyMediaKeys.status,
  status => status === 'pending'
);

export const companyMediaKeysErrorSelector = createSelector(
  (state: AppState) => state.companyMediaKeys,
  status => status.error
);

export const { clearCompanyMediaKeyItems, clearCompanyMediaKeyError } = companyMediaKeysSlice.actions;

export default companyMediaKeysSlice.reducer;
