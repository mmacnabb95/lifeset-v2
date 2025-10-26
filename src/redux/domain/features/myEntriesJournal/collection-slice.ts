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
import { MyEntriesJournalCollectionState } from "./my-entries-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Myentriesjournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: MyEntriesJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("MyEntriesJournal")?.thunkConfig();
export {thunks}; 


export const getMyEntriesJournals = createAsyncThunk(
  "get/my-entries-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`my-entries-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchMyEntriesJournals = createAsyncThunk(
  "get/my-entries-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`my-entries-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getMyEntriesJournal = createAsyncThunk(
  "get/my-entries-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`my-entries-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: MyEntriesJournalCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].User : undefined;

//   if(currentStateConstraint && actionArgs.user && Number(actionArgs.user) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].User : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: MyEntriesJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const myEntriesJournalsSlice = createSlice({
  name: "myEntriesJournals",
  initialState,
  reducers: {
    clearMyEntriesJournalItems(state: MyEntriesJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearMyEntriesJournalError(state: MyEntriesJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMyEntriesJournals.pending || searchMyEntriesJournals.pending, (state: MyEntriesJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getMyEntriesJournals.fulfilled || searchMyEntriesJournals.fulfilled, (state: MyEntriesJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getMyEntriesJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getMyEntriesJournal.pending, (state: MyEntriesJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getMyEntriesJournal.fulfilled, (state: MyEntriesJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getMyEntriesJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("MyEntriesJournal")?.reducerConfig(builder);
  },
});

export const myEntriesJournalSelector = (id: number) => (state: AppState) => {
  return state.myEntriesJournals?.items?.find((o) => o.Id === id);
}; 

export const myEntriesJournalLoading = createSelector(
  (state: AppState) => state.myEntriesJournals.status,
  status => status === 'pending'
);

export const myEntriesJournalErrorSelector = createSelector(
  (state: AppState) => state.myEntriesJournals,
  status => status.error
);


export const myEntriesJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.myEntriesJournals?.items?.filter((q) => q.User === user);
}; 

export const myEntriesJournalsLoading = createSelector(
  (state: AppState) => state.myEntriesJournals.status,
  status => status === 'pending'
);

export const myEntriesJournalsErrorSelector = createSelector(
  (state: AppState) => state.myEntriesJournals,
  status => status.error
);

export const { clearMyEntriesJournalItems, clearMyEntriesJournalError } = myEntriesJournalsSlice.actions;

export default myEntriesJournalsSlice.reducer;
