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
import { CategoryCollectionState } from "./category-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Category } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CategoryCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Category")?.thunkConfig();
export {thunks}; 


export const getCategorys = createAsyncThunk(
  "get/categorys",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`category?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCategorys = createAsyncThunk(
  "get/categorys",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`category-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCategory = createAsyncThunk(
    "post/category",
    async (category: Partial<Category>) => {
      const client = await fetchClient();
      const { data } = await client.post(`category/`, { category });
      return data;
    }
  );


export const updateCategory = createAsyncThunk(
  "put/category",
  async (category: Partial<Category>) => {
    const client = await fetchClient();
    const { data } = await client.put(`category/`, { category });
    return data;
  }
);

export const getCategory = createAsyncThunk(
  "get/category",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`category/${id}`);
    return data;
  }
);

export const deleteCategory = createAsyncThunk(
  "delete/category",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`category/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CategoryCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const categorysSlice = createSlice({
  name: "categorys",
  initialState,
  reducers: {
    clearCategoryItems(state: CategoryCollectionState) {
      Object.assign(state, initialState);
    },
    clearCategoryError(state: CategoryCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCategorys.pending || searchCategorys.pending, (state: CategoryCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCategorys.fulfilled || searchCategorys.fulfilled, (state: CategoryCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCategorys.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCategory.pending, (state: CategoryCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCategory.pending, (state: CategoryCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCategory.pending, (state: CategoryCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCategory.fulfilled, (state: CategoryCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCategory.fulfilled, (state: CategoryCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCategory.fulfilled, (state: CategoryCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCategory.pending, (state: CategoryCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCategory.fulfilled, (state: CategoryCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCategory.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCategory.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCategory.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Category")?.reducerConfig(builder);
  },
});

export const categorySelector = (id: number) => (state: AppState) => {
  return state.categorys?.items?.find((o) => o.Id === id);
}; 

export const categoryLoading = createSelector(
  (state: AppState) => state.categorys.status,
  status => status === 'pending'
);

export const categoryErrorSelector = createSelector(
  (state: AppState) => state.categorys,
  status => status.error
);


export const categorysSelector = createSelector(
  (state: AppState) => state.categorys,
  state => state.items
);

export const categorysLoading = createSelector(
  (state: AppState) => state.categorys.status,
  status => status === 'pending'
);

export const categorysErrorSelector = createSelector(
  (state: AppState) => state.categorys,
  status => status.error
);

export const { clearCategoryItems, clearCategoryError } = categorysSlice.actions;

export default categorysSlice.reducer;
