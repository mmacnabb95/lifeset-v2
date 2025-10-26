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
import { InspoQuoteCollectionState } from "./inspo-quote-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Inspoquote } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: InspoQuoteCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("InspoQuote")?.thunkConfig();
export {thunks}; 


export const getInspoQuotes = createAsyncThunk(
  "get/inspo-quotes",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`inspo-quote?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchInspoQuotes = createAsyncThunk(
  "get/inspo-quotes",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`inspo-quote-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createInspoQuote = createAsyncThunk(
    "post/inspo-quote",
    async (inspoQuote: Partial<Inspoquote>) => {
      const client = await fetchClient();
      const { data } = await client.post(`inspo-quote/`, { inspoQuote });
      return data;
    }
  );


export const updateInspoQuote = createAsyncThunk(
  "put/inspo-quote",
  async (inspoQuote: Partial<Inspoquote>) => {
    const client = await fetchClient();
    const { data } = await client.put(`inspo-quote/`, { inspoQuote });
    return data;
  }
);

export const getInspoQuote = createAsyncThunk(
  "get/inspo-quote",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`inspo-quote/${id}`);
    return data;
  }
);

export const deleteInspoQuote = createAsyncThunk(
  "delete/inspo-quote",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`inspo-quote/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: InspoQuoteCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const inspoQuotesSlice = createSlice({
  name: "inspoQuotes",
  initialState,
  reducers: {
    clearInspoQuoteItems(state: InspoQuoteCollectionState) {
      Object.assign(state, initialState);
    },
    clearInspoQuoteError(state: InspoQuoteCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getInspoQuotes.pending || searchInspoQuotes.pending, (state: InspoQuoteCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getInspoQuotes.fulfilled || searchInspoQuotes.fulfilled, (state: InspoQuoteCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getInspoQuotes.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getInspoQuote.pending, (state: InspoQuoteCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteInspoQuote.pending, (state: InspoQuoteCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateInspoQuote.pending, (state: InspoQuoteCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getInspoQuote.fulfilled, (state: InspoQuoteCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteInspoQuote.fulfilled, (state: InspoQuoteCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateInspoQuote.fulfilled, (state: InspoQuoteCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createInspoQuote.pending, (state: InspoQuoteCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createInspoQuote.fulfilled, (state: InspoQuoteCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getInspoQuote.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteInspoQuote.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateInspoQuote.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("InspoQuote")?.reducerConfig(builder);
  },
});

export const inspoQuoteSelector = (id: number) => (state: AppState) => {
  return state.inspoQuotes?.items?.find((o) => o.Id === id);
}; 

export const inspoQuoteLoading = createSelector(
  (state: AppState) => state.inspoQuotes.status,
  status => status === 'pending'
);

export const inspoQuoteErrorSelector = createSelector(
  (state: AppState) => state.inspoQuotes,
  status => status.error
);


export const inspoQuotesSelector = createSelector(
  (state: AppState) => state.inspoQuotes,
  state => state.items
);

export const inspoQuotesLoading = createSelector(
  (state: AppState) => state.inspoQuotes.status,
  status => status === 'pending'
);

export const inspoQuotesErrorSelector = createSelector(
  (state: AppState) => state.inspoQuotes,
  status => status.error
);

export const { clearInspoQuoteItems, clearInspoQuoteError } = inspoQuotesSlice.actions;

export default inspoQuotesSlice.reducer;
