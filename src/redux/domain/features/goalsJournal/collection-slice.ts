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
import { GoalsJournalCollectionState } from "./goals-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Goalsjournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: GoalsJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("GoalsJournal")?.thunkConfig();
export {thunks}; 


export const getGoalsJournals = createAsyncThunk(
  "get/goals-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`goals-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchGoalsJournals = createAsyncThunk(
  "get/goals-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`goals-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getGoalsJournal = createAsyncThunk(
  "get/goals-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`goals-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: GoalsJournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: GoalsJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const goalsJournalsSlice = createSlice({
  name: "goalsJournals",
  initialState,
  reducers: {
    clearGoalsJournalItems(state: GoalsJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearGoalsJournalError(state: GoalsJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getGoalsJournals.pending || searchGoalsJournals.pending, (state: GoalsJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getGoalsJournals.fulfilled || searchGoalsJournals.fulfilled, (state: GoalsJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getGoalsJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getGoalsJournal.pending, (state: GoalsJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getGoalsJournal.fulfilled, (state: GoalsJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getGoalsJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("GoalsJournal")?.reducerConfig(builder);
  },
});

export const goalsJournalSelector = (id: number) => (state: AppState) => {
  return state.goalsJournals?.items?.find((o) => o.Id === id);
}; 

export const goalsJournalLoading = createSelector(
  (state: AppState) => state.goalsJournals.status,
  status => status === 'pending'
);

export const goalsJournalErrorSelector = createSelector(
  (state: AppState) => state.goalsJournals,
  status => status.error
);


export const goalsJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.goalsJournals?.items?.filter((q) => q.User === user);
}; 

export const goalsJournalsLoading = createSelector(
  (state: AppState) => state.goalsJournals.status,
  status => status === 'pending'
);

export const goalsJournalsErrorSelector = createSelector(
  (state: AppState) => state.goalsJournals,
  status => status.error
);

export const { clearGoalsJournalItems, clearGoalsJournalError } = goalsJournalsSlice.actions;

export default goalsJournalsSlice.reducer;
