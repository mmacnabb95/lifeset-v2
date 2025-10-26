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
import { MyGratitudeJournalCollectionState } from "./my-gratitude-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Mygratitudejournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: MyGratitudeJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("MyGratitudeJournal")?.thunkConfig();
export {thunks}; 


export const getMyGratitudeJournals = createAsyncThunk(
  "get/my-gratitude-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`my-gratitude-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchMyGratitudeJournals = createAsyncThunk(
  "get/my-gratitude-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`my-gratitude-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getMyGratitudeJournal = createAsyncThunk(
  "get/my-gratitude-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`my-gratitude-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: MyGratitudeJournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: MyGratitudeJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const myGratitudeJournalsSlice = createSlice({
  name: "myGratitudeJournals",
  initialState,
  reducers: {
    clearMyGratitudeJournalItems(state: MyGratitudeJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearMyGratitudeJournalError(state: MyGratitudeJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMyGratitudeJournals.pending || searchMyGratitudeJournals.pending, (state: MyGratitudeJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getMyGratitudeJournals.fulfilled || searchMyGratitudeJournals.fulfilled, (state: MyGratitudeJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getMyGratitudeJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getMyGratitudeJournal.pending, (state: MyGratitudeJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getMyGratitudeJournal.fulfilled, (state: MyGratitudeJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getMyGratitudeJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("MyGratitudeJournal")?.reducerConfig(builder);
  },
});

export const myGratitudeJournalSelector = (id: number) => (state: AppState) => {
  return state.myGratitudeJournals?.items?.find((o) => o.Id === id);
}; 

export const myGratitudeJournalLoading = createSelector(
  (state: AppState) => state.myGratitudeJournals.status,
  status => status === 'pending'
);

export const myGratitudeJournalErrorSelector = createSelector(
  (state: AppState) => state.myGratitudeJournals,
  status => status.error
);


export const myGratitudeJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.myGratitudeJournals?.items?.filter((q) => q.User === user);
}; 

export const myGratitudeJournalsLoading = createSelector(
  (state: AppState) => state.myGratitudeJournals.status,
  status => status === 'pending'
);

export const myGratitudeJournalsErrorSelector = createSelector(
  (state: AppState) => state.myGratitudeJournals,
  status => status.error
);

export const { clearMyGratitudeJournalItems, clearMyGratitudeJournalError } = myGratitudeJournalsSlice.actions;

export default myGratitudeJournalsSlice.reducer;
