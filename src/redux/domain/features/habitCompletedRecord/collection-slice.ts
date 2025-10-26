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
import { HabitCompletedRecordCollectionState } from "./habit-completed-record-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitcompletedrecord } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitCompletedRecordCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitCompletedRecord")?.thunkConfig();
export {thunks}; 


export const getHabitCompletedRecords = createAsyncThunk(
  "get/habit-completed-records",
  async (options?: { habit?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-completed-record?habit=${options?.habit}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitCompletedRecords = createAsyncThunk(
  "get/habit-completed-records",
  async ({ habit, search, offset, limit, filter }: { habit?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-completed-record-search?habit=${habit}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitCompletedRecord = createAsyncThunk(
    "post/habit-completed-record",
    async (habitCompletedRecord: Partial<Habitcompletedrecord>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-completed-record/`, { habitCompletedRecord });
      return data;
    }
  );


export const updateHabitCompletedRecord = createAsyncThunk(
  "put/habit-completed-record",
  async (habitCompletedRecord: Partial<Habitcompletedrecord>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-completed-record/`, { habitCompletedRecord });
    return data;
  }
);

export const getHabitCompletedRecord = createAsyncThunk(
  "get/habit-completed-record",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-completed-record/${id}`);
    return data;
  }
);

export const deleteHabitCompletedRecord = createAsyncThunk(
  "delete/habit-completed-record",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-completed-record/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: HabitCompletedRecordCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Habit : undefined;

//   if(currentStateConstraint && actionArgs.habit && Number(actionArgs.habit) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Habit : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitCompletedRecordCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitCompletedRecordsSlice = createSlice({
  name: "habitCompletedRecords",
  initialState,
  reducers: {
    clearHabitCompletedRecordItems(state: HabitCompletedRecordCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitCompletedRecordError(state: HabitCompletedRecordCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitCompletedRecords.pending || searchHabitCompletedRecords.pending, (state: HabitCompletedRecordCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitCompletedRecords.fulfilled || searchHabitCompletedRecords.fulfilled, (state: HabitCompletedRecordCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitCompletedRecords.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitCompletedRecord.pending, (state: HabitCompletedRecordCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitCompletedRecord.pending, (state: HabitCompletedRecordCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitCompletedRecord.pending, (state: HabitCompletedRecordCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitCompletedRecord.fulfilled, (state: HabitCompletedRecordCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitCompletedRecord.fulfilled, (state: HabitCompletedRecordCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitCompletedRecord.fulfilled, (state: HabitCompletedRecordCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitCompletedRecord.pending, (state: HabitCompletedRecordCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitCompletedRecord.fulfilled, (state: HabitCompletedRecordCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitCompletedRecord.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitCompletedRecord.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitCompletedRecord.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitCompletedRecord")?.reducerConfig(builder);
  },
});

export const habitCompletedRecordSelector = (id: number) => (state: AppState) => {
  return state.habitCompletedRecords?.items?.find((o) => o.Id === id);
}; 

export const habitCompletedRecordLoading = createSelector(
  (state: AppState) => state.habitCompletedRecords.status,
  status => status === 'pending'
);

export const habitCompletedRecordErrorSelector = createSelector(
  (state: AppState) => state.habitCompletedRecords,
  status => status.error
);


export const habitCompletedRecordsSelector = (habit?: number) => (state: AppState) => {
  if (!habit) {
    return undefined;
  }
  return state.habitCompletedRecords?.items?.filter((q) => q.Habit === habit);
}; 

export const habitCompletedRecordsLoading = createSelector(
  (state: AppState) => state.habitCompletedRecords.status,
  status => status === 'pending'
);

export const habitCompletedRecordsErrorSelector = createSelector(
  (state: AppState) => state.habitCompletedRecords,
  status => status.error
);

export const { clearHabitCompletedRecordItems, clearHabitCompletedRecordError } = habitCompletedRecordsSlice.actions;

export default habitCompletedRecordsSlice.reducer;
