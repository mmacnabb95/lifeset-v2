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
import { CardioIncludedCollectionState } from "./cardio-included-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Cardioincluded } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CardioIncludedCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CardioIncluded")?.thunkConfig();
export {thunks}; 


export const getCardioIncludeds = createAsyncThunk(
  "get/cardio-includeds",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`cardio-included?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCardioIncludeds = createAsyncThunk(
  "get/cardio-includeds",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`cardio-included-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createCardioIncluded = createAsyncThunk(
    "post/cardio-included",
    async (cardioIncluded: Partial<Cardioincluded>) => {
      const client = await fetchClient();
      const { data } = await client.post(`cardio-included/`, { cardioIncluded });
      return data;
    }
  );


export const updateCardioIncluded = createAsyncThunk(
  "put/cardio-included",
  async (cardioIncluded: Partial<Cardioincluded>) => {
    const client = await fetchClient();
    const { data } = await client.put(`cardio-included/`, { cardioIncluded });
    return data;
  }
);

export const getCardioIncluded = createAsyncThunk(
  "get/cardio-included",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`cardio-included/${id}`);
    return data;
  }
);

export const deleteCardioIncluded = createAsyncThunk(
  "delete/cardio-included",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`cardio-included/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: CardioIncludedCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const cardioIncludedsSlice = createSlice({
  name: "cardioIncludeds",
  initialState,
  reducers: {
    clearCardioIncludedItems(state: CardioIncludedCollectionState) {
      Object.assign(state, initialState);
    },
    clearCardioIncludedError(state: CardioIncludedCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCardioIncludeds.pending || searchCardioIncludeds.pending, (state: CardioIncludedCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCardioIncludeds.fulfilled || searchCardioIncludeds.fulfilled, (state: CardioIncludedCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCardioIncludeds.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCardioIncluded.pending, (state: CardioIncludedCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteCardioIncluded.pending, (state: CardioIncludedCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateCardioIncluded.pending, (state: CardioIncludedCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCardioIncluded.fulfilled, (state: CardioIncludedCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteCardioIncluded.fulfilled, (state: CardioIncludedCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateCardioIncluded.fulfilled, (state: CardioIncludedCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createCardioIncluded.pending, (state: CardioIncludedCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createCardioIncluded.fulfilled, (state: CardioIncludedCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getCardioIncluded.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteCardioIncluded.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateCardioIncluded.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("CardioIncluded")?.reducerConfig(builder);
  },
});

export const cardioIncludedSelector = (id: number) => (state: AppState) => {
  return state.cardioIncludeds?.items?.find((o) => o.Id === id);
}; 

export const cardioIncludedLoading = createSelector(
  (state: AppState) => state.cardioIncludeds.status,
  status => status === 'pending'
);

export const cardioIncludedErrorSelector = createSelector(
  (state: AppState) => state.cardioIncludeds,
  status => status.error
);


export const cardioIncludedsSelector = createSelector(
  (state: AppState) => state.cardioIncludeds,
  state => state.items
);

export const cardioIncludedsLoading = createSelector(
  (state: AppState) => state.cardioIncludeds.status,
  status => status === 'pending'
);

export const cardioIncludedsErrorSelector = createSelector(
  (state: AppState) => state.cardioIncludeds,
  status => status.error
);

export const { clearCardioIncludedItems, clearCardioIncludedError } = cardioIncludedsSlice.actions;

export default cardioIncludedsSlice.reducer;
