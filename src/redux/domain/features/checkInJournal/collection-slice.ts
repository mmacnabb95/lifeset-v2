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
import { CheckInJournalCollectionState } from "./check-in-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Checkinjournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: CheckInJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("CheckInJournal")?.thunkConfig();
export {thunks}; 


export const getCheckInJournals = createAsyncThunk(
  "get/check-in-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`check-in-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchCheckInJournals = createAsyncThunk(
  "get/check-in-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`check-in-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getCheckInJournal = createAsyncThunk(
  "get/check-in-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`check-in-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: CheckInJournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: CheckInJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const checkInJournalsSlice = createSlice({
  name: "checkInJournals",
  initialState,
  reducers: {
    clearCheckInJournalItems(state: CheckInJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearCheckInJournalError(state: CheckInJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCheckInJournals.pending || searchCheckInJournals.pending, (state: CheckInJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getCheckInJournals.fulfilled || searchCheckInJournals.fulfilled, (state: CheckInJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getCheckInJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getCheckInJournal.pending, (state: CheckInJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getCheckInJournal.fulfilled, (state: CheckInJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getCheckInJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("CheckInJournal")?.reducerConfig(builder);
  },
});

export const checkInJournalSelector = (id: number) => (state: AppState) => {
  return state.checkInJournals?.items?.find((o) => o.Id === id);
}; 

export const checkInJournalLoading = createSelector(
  (state: AppState) => state.checkInJournals.status,
  status => status === 'pending'
);

export const checkInJournalErrorSelector = createSelector(
  (state: AppState) => state.checkInJournals,
  status => status.error
);


export const checkInJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.checkInJournals?.items?.filter((q) => q.User === user);
}; 

export const checkInJournalsLoading = createSelector(
  (state: AppState) => state.checkInJournals.status,
  status => status === 'pending'
);

export const checkInJournalsErrorSelector = createSelector(
  (state: AppState) => state.checkInJournals,
  status => status.error
);

export const { clearCheckInJournalItems, clearCheckInJournalError } = checkInJournalsSlice.actions;

export default checkInJournalsSlice.reducer;
