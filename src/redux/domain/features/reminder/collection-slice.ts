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
import { ReminderCollectionState } from "./reminder-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Reminder } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ReminderCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Reminder")?.thunkConfig();
export {thunks}; 


export const getReminders = createAsyncThunk(
  "get/reminders",
  async (options?: { habit?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`reminder?habit=${options?.habit}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchReminders = createAsyncThunk(
  "get/reminders",
  async ({ habit, search, offset, limit, filter }: { habit?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`reminder-search?habit=${habit}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createReminder = createAsyncThunk(
    "post/reminder",
    async (reminder: Partial<Reminder>) => {
      const client = await fetchClient();
      const { data } = await client.post(`reminder/`, { reminder });
      return data;
    }
  );


export const updateReminder = createAsyncThunk(
  "put/reminder",
  async (reminder: Partial<Reminder>) => {
    const client = await fetchClient();
    const { data } = await client.put(`reminder/`, { reminder });
    return data;
  }
);

export const getReminder = createAsyncThunk(
  "get/reminder",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`reminder/${id}`);
    return data;
  }
);

export const deleteReminder = createAsyncThunk(
  "delete/reminder",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`reminder/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: ReminderCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: ReminderCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const remindersSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    clearReminderItems(state: ReminderCollectionState) {
      Object.assign(state, initialState);
    },
    clearReminderError(state: ReminderCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getReminders.pending || searchReminders.pending, (state: ReminderCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getReminders.fulfilled || searchReminders.fulfilled, (state: ReminderCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getReminders.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getReminder.pending, (state: ReminderCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteReminder.pending, (state: ReminderCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateReminder.pending, (state: ReminderCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getReminder.fulfilled, (state: ReminderCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteReminder.fulfilled, (state: ReminderCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateReminder.fulfilled, (state: ReminderCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createReminder.pending, (state: ReminderCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createReminder.fulfilled, (state: ReminderCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getReminder.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteReminder.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateReminder.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Reminder")?.reducerConfig(builder);
  },
});

export const reminderSelector = (id: number) => (state: AppState) => {
  return state.reminders?.items?.find((o) => o.Id === id);
}; 

export const reminderLoading = createSelector(
  (state: AppState) => state.reminders.status,
  status => status === 'pending'
);

export const reminderErrorSelector = createSelector(
  (state: AppState) => state.reminders,
  status => status.error
);


export const remindersSelector = (habit?: number) => (state: AppState) => {
  if (!habit) {
    return undefined;
  }
  return state.reminders?.items?.filter((q) => q.Habit === habit);
}; 

export const remindersLoading = createSelector(
  (state: AppState) => state.reminders.status,
  status => status === 'pending'
);

export const remindersErrorSelector = createSelector(
  (state: AppState) => state.reminders,
  status => status.error
);

export const { clearReminderItems, clearReminderError } = remindersSlice.actions;

export default remindersSlice.reducer;
