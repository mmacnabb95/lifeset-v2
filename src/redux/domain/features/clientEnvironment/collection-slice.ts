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
import { ClientEnvironmentCollectionState } from "./client-environment-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Clientenvironment } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ClientEnvironmentCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("ClientEnvironment")?.thunkConfig();
export {thunks}; 


export const getClientEnvironments = createAsyncThunk(
  "get/client-environments",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`client-environment?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchClientEnvironments = createAsyncThunk(
  "get/client-environments",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`client-environment-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createClientEnvironment = createAsyncThunk(
    "post/client-environment",
    async (clientEnvironment: Partial<Clientenvironment>) => {
      const client = await fetchClient();
      const { data } = await client.post(`client-environment/`, { clientEnvironment });
      return data;
    }
  );


export const updateClientEnvironment = createAsyncThunk(
  "put/client-environment",
  async (clientEnvironment: Partial<Clientenvironment>) => {
    const client = await fetchClient();
    const { data } = await client.put(`client-environment/`, { clientEnvironment });
    return data;
  }
);

export const getClientEnvironment = createAsyncThunk(
  "get/client-environment",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`client-environment/${id}`);
    return data;
  }
);

export const deleteClientEnvironment = createAsyncThunk(
  "delete/client-environment",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`client-environment/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: ClientEnvironmentCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const clientEnvironmentsSlice = createSlice({
  name: "clientEnvironments",
  initialState,
  reducers: {
    clearClientEnvironmentItems(state: ClientEnvironmentCollectionState) {
      Object.assign(state, initialState);
    },
    clearClientEnvironmentError(state: ClientEnvironmentCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getClientEnvironments.pending || searchClientEnvironments.pending, (state: ClientEnvironmentCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getClientEnvironments.fulfilled || searchClientEnvironments.fulfilled, (state: ClientEnvironmentCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getClientEnvironments.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getClientEnvironment.pending, (state: ClientEnvironmentCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteClientEnvironment.pending, (state: ClientEnvironmentCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateClientEnvironment.pending, (state: ClientEnvironmentCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getClientEnvironment.fulfilled, (state: ClientEnvironmentCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteClientEnvironment.fulfilled, (state: ClientEnvironmentCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateClientEnvironment.fulfilled, (state: ClientEnvironmentCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createClientEnvironment.pending, (state: ClientEnvironmentCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createClientEnvironment.fulfilled, (state: ClientEnvironmentCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getClientEnvironment.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteClientEnvironment.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateClientEnvironment.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("ClientEnvironment")?.reducerConfig(builder);
  },
});

export const clientEnvironmentSelector = (id: number) => (state: AppState) => {
  return state.clientEnvironments?.items?.find((o) => o.Id === id);
}; 

export const clientEnvironmentLoading = createSelector(
  (state: AppState) => state.clientEnvironments.status,
  status => status === 'pending'
);

export const clientEnvironmentErrorSelector = createSelector(
  (state: AppState) => state.clientEnvironments,
  status => status.error
);


export const clientEnvironmentsSelector = createSelector(
  (state: AppState) => state.clientEnvironments,
  state => state.items
);

export const clientEnvironmentsLoading = createSelector(
  (state: AppState) => state.clientEnvironments.status,
  status => status === 'pending'
);

export const clientEnvironmentsErrorSelector = createSelector(
  (state: AppState) => state.clientEnvironments,
  status => status.error
);

export const { clearClientEnvironmentItems, clearClientEnvironmentError } = clientEnvironmentsSlice.actions;

export default clientEnvironmentsSlice.reducer;
