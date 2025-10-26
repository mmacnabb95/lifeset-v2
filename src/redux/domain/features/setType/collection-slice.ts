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
import { SetTypeCollectionState } from "./set-type-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Settype } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: SetTypeCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("SetType")?.thunkConfig();
export {thunks}; 


export const getSetTypes = createAsyncThunk(
  "get/set-types",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`set-type?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchSetTypes = createAsyncThunk(
  "get/set-types",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`set-type-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createSetType = createAsyncThunk(
    "post/set-type",
    async (setType: Partial<Settype>) => {
      const client = await fetchClient();
      const { data } = await client.post(`set-type/`, { setType });
      return data;
    }
  );


export const updateSetType = createAsyncThunk(
  "put/set-type",
  async (setType: Partial<Settype>) => {
    const client = await fetchClient();
    const { data } = await client.put(`set-type/`, { setType });
    return data;
  }
);

export const getSetType = createAsyncThunk(
  "get/set-type",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`set-type/${id}`);
    return data;
  }
);

export const deleteSetType = createAsyncThunk(
  "delete/set-type",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`set-type/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: SetTypeCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const setTypesSlice = createSlice({
  name: "setTypes",
  initialState,
  reducers: {
    clearSetTypeItems(state: SetTypeCollectionState) {
      Object.assign(state, initialState);
    },
    clearSetTypeError(state: SetTypeCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSetTypes.pending || searchSetTypes.pending, (state: SetTypeCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getSetTypes.fulfilled || searchSetTypes.fulfilled, (state: SetTypeCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getSetTypes.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getSetType.pending, (state: SetTypeCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteSetType.pending, (state: SetTypeCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateSetType.pending, (state: SetTypeCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getSetType.fulfilled, (state: SetTypeCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteSetType.fulfilled, (state: SetTypeCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateSetType.fulfilled, (state: SetTypeCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createSetType.pending, (state: SetTypeCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createSetType.fulfilled, (state: SetTypeCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getSetType.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteSetType.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateSetType.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("SetType")?.reducerConfig(builder);
  },
});

export const setTypeSelector = (id: number) => (state: AppState) => {
  return state.setTypes?.items?.find((o) => o.Id === id);
}; 

export const setTypeLoading = createSelector(
  (state: AppState) => state.setTypes.status,
  status => status === 'pending'
);

export const setTypeErrorSelector = createSelector(
  (state: AppState) => state.setTypes,
  status => status.error
);


export const setTypesSelector = createSelector(
  (state: AppState) => state.setTypes,
  state => state.items
);

export const setTypesLoading = createSelector(
  (state: AppState) => state.setTypes.status,
  status => status === 'pending'
);

export const setTypesErrorSelector = createSelector(
  (state: AppState) => state.setTypes,
  status => status.error
);

export const { clearSetTypeItems, clearSetTypeError } = setTypesSlice.actions;

export default setTypesSlice.reducer;
