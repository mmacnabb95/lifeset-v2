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
import { RelaxListJournalCollectionState } from "./relax-list-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Relaxlistjournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: RelaxListJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("RelaxListJournal")?.thunkConfig();
export {thunks}; 


export const getRelaxListJournals = createAsyncThunk(
  "get/relax-list-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`relax-list-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchRelaxListJournals = createAsyncThunk(
  "get/relax-list-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`relax-list-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getRelaxListJournal = createAsyncThunk(
  "get/relax-list-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`relax-list-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: RelaxListJournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: RelaxListJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const relaxListJournalsSlice = createSlice({
  name: "relaxListJournals",
  initialState,
  reducers: {
    clearRelaxListJournalItems(state: RelaxListJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearRelaxListJournalError(state: RelaxListJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRelaxListJournals.pending || searchRelaxListJournals.pending, (state: RelaxListJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getRelaxListJournals.fulfilled || searchRelaxListJournals.fulfilled, (state: RelaxListJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getRelaxListJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getRelaxListJournal.pending, (state: RelaxListJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getRelaxListJournal.fulfilled, (state: RelaxListJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getRelaxListJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("RelaxListJournal")?.reducerConfig(builder);
  },
});

export const relaxListJournalSelector = (id: number) => (state: AppState) => {
  return state.relaxListJournals?.items?.find((o) => o.Id === id);
}; 

export const relaxListJournalLoading = createSelector(
  (state: AppState) => state.relaxListJournals.status,
  status => status === 'pending'
);

export const relaxListJournalErrorSelector = createSelector(
  (state: AppState) => state.relaxListJournals,
  status => status.error
);


export const relaxListJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.relaxListJournals?.items?.filter((q) => q.User === user);
}; 

export const relaxListJournalsLoading = createSelector(
  (state: AppState) => state.relaxListJournals.status,
  status => status === 'pending'
);

export const relaxListJournalsErrorSelector = createSelector(
  (state: AppState) => state.relaxListJournals,
  status => status.error
);

export const { clearRelaxListJournalItems, clearRelaxListJournalError } = relaxListJournalsSlice.actions;

export default relaxListJournalsSlice.reducer;
