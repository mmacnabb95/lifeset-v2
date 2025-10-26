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
import { TodoListJournalCollectionState } from "./todo-list-journal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Todolistjournal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: TodoListJournalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("TodoListJournal")?.thunkConfig();
export {thunks}; 


export const getTodoListJournals = createAsyncThunk(
  "get/todo-list-journals",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`todo-list-journal?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchTodoListJournals = createAsyncThunk(
  "get/todo-list-journals",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`todo-list-journal-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getTodoListJournal = createAsyncThunk(
  "get/todo-list-journal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`todo-list-journal/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: TodoListJournalCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: TodoListJournalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const todoListJournalsSlice = createSlice({
  name: "todoListJournals",
  initialState,
  reducers: {
    clearTodoListJournalItems(state: TodoListJournalCollectionState) {
      Object.assign(state, initialState);
    },
    clearTodoListJournalError(state: TodoListJournalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTodoListJournals.pending || searchTodoListJournals.pending, (state: TodoListJournalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getTodoListJournals.fulfilled || searchTodoListJournals.fulfilled, (state: TodoListJournalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getTodoListJournals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getTodoListJournal.pending, (state: TodoListJournalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getTodoListJournal.fulfilled, (state: TodoListJournalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getTodoListJournal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("TodoListJournal")?.reducerConfig(builder);
  },
});

export const todoListJournalSelector = (id: number) => (state: AppState) => {
  return state.todoListJournals?.items?.find((o) => o.Id === id);
}; 

export const todoListJournalLoading = createSelector(
  (state: AppState) => state.todoListJournals.status,
  status => status === 'pending'
);

export const todoListJournalErrorSelector = createSelector(
  (state: AppState) => state.todoListJournals,
  status => status.error
);


export const todoListJournalsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.todoListJournals?.items?.filter((q) => q.User === user);
}; 

export const todoListJournalsLoading = createSelector(
  (state: AppState) => state.todoListJournals.status,
  status => status === 'pending'
);

export const todoListJournalsErrorSelector = createSelector(
  (state: AppState) => state.todoListJournals,
  status => status.error
);

export const { clearTodoListJournalItems, clearTodoListJournalError } = todoListJournalsSlice.actions;

export default todoListJournalsSlice.reducer;
