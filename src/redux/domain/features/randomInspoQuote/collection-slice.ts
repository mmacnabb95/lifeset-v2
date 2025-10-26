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
import { RandomInspoQuoteCollectionState } from "./random-inspo-quote-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Randominspoquote } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: RandomInspoQuoteCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("RandomInspoQuote")?.thunkConfig();
export {thunks}; 


export const getRandomInspoQuotes = createAsyncThunk(
  "get/random-inspo-quotes",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`random-inspo-quote?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchRandomInspoQuotes = createAsyncThunk(
  "get/random-inspo-quotes",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`random-inspo-quote-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getRandomInspoQuote = createAsyncThunk(
  "get/random-inspo-quote",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`random-inspo-quote/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: RandomInspoQuoteCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const randomInspoQuotesSlice = createSlice({
  name: "randomInspoQuotes",
  initialState,
  reducers: {
    clearRandomInspoQuoteItems(state: RandomInspoQuoteCollectionState) {
      Object.assign(state, initialState);
    },
    clearRandomInspoQuoteError(state: RandomInspoQuoteCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRandomInspoQuotes.pending || searchRandomInspoQuotes.pending, (state: RandomInspoQuoteCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getRandomInspoQuotes.fulfilled || searchRandomInspoQuotes.fulfilled, (state: RandomInspoQuoteCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getRandomInspoQuotes.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getRandomInspoQuote.pending, (state: RandomInspoQuoteCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getRandomInspoQuote.fulfilled, (state: RandomInspoQuoteCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getRandomInspoQuote.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("RandomInspoQuote")?.reducerConfig(builder);
  },
});

export const randomInspoQuoteSelector = (id: number) => (state: AppState) => {
  return state.randomInspoQuotes?.items?.find((o) => o.Id === id);
}; 

export const randomInspoQuoteLoading = createSelector(
  (state: AppState) => state.randomInspoQuotes.status,
  status => status === 'pending'
);

export const randomInspoQuoteErrorSelector = createSelector(
  (state: AppState) => state.randomInspoQuotes,
  status => status.error
);


export const randomInspoQuotesSelector = createSelector(
  (state: AppState) => state.randomInspoQuotes,
  state => state.items
);

export const randomInspoQuotesLoading = createSelector(
  (state: AppState) => state.randomInspoQuotes.status,
  status => status === 'pending'
);

export const randomInspoQuotesErrorSelector = createSelector(
  (state: AppState) => state.randomInspoQuotes,
  status => status.error
);

export const { clearRandomInspoQuoteItems, clearRandomInspoQuoteError } = randomInspoQuotesSlice.actions;

export default randomInspoQuotesSlice.reducer;
