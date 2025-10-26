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
import { JournalCollectionState } from "./journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Journal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: JournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Journal")?.thunkConfig();
export {thunks}; 


export const getJournals = createAsyncThunk(
  "get/journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchJournals = createAsyncThunk(
  "get/journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createJournal = createAsyncThunk(
    "create/journal",
    async (journal: Partial<Journal>) => {
      console.log('Creating journal with category:', journal.Category);
      const client = await fetchClient();
      const { data } = await client.post(`journal`, { journal });
      console.log('Created journal response:', data);
      return data;
    }
  );


export const updateJournal = createAsyncThunk(
  "update/journal",
  async (journal: Partial<Journal>) => {
    console.log('Updating journal with category:', journal.Category);
    const client = await fetchClient();
    const { data } = await client.put(`journal/${journal.Id}`, journal);
    console.log('Updated journal response:', data);
    return data;
  }
);

export const getJournal = createAsyncThunk(
  "get/journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`journal/${id}`);
    return data;
  }
);

export const deleteJournal = createAsyncThunk(
  "delete/journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: JournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: JournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const journalsSlice = createSlice({
  name: "journals",
  initialState,
  reducers: {
    clearJournalItems(state: JournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearJournalError(state: JournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getJournals.pending || searchJournals.pending, (state: JournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getJournals.fulfilled || searchJournals.fulfilled, (state: JournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getJournal.pending, (state: JournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteJournal.pending, (state: JournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateJournal.pending, (state: JournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getJournal.fulfilled, (state: JournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteJournal.fulfilled, (state: JournalCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateJournal.fulfilled, (state: JournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createJournal.pending, (state: JournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createJournal.fulfilled, (state: JournalCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Journal")?.reducerConfig(builder);
  },
});

export const journalSelector = (id: number) => (state: AppState) => {
  return state.journals?.items?.find((o) => o.Id === id);
}; 

export const journalLoading = createSelector(
  (state: AppState) => state.journals.status,
  status => status === 'pending'
);

export const journalErrorSelector = createSelector(
  (state: AppState) => state.journals,
  status => status.error
);


export const journalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.journals?.items?.filter((q) => q.User === user);
}; 

export const journalsLoading = createSelector(
  (state: AppState) => state.journals.status,
  status => status === 'pending'
);

export const journalsErrorSelector = createSelector(
  (state: AppState) => state.journals,
  status => status.error
);

export const { clearJournalItems, clearJournalError } = journalsSlice.actions;

export default journalsSlice.reducer;
