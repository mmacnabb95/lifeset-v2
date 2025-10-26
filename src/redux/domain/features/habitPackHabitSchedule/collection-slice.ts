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
import { HabitPackHabitScheduleCollectionState } from "./habit-pack-habit-schedule-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Habitpackhabitschedule } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: HabitPackHabitScheduleCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("HabitPackHabitSchedule")?.thunkConfig();
export {thunks}; 


export const getHabitPackHabitSchedules = createAsyncThunk(
  "get/habit-pack-habit-schedules",
  async (options?: { userhabitpackhabit?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack-habit-schedule?userhabitpackhabit=${options?.userhabitpackhabit}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchHabitPackHabitSchedules = createAsyncThunk(
  "get/habit-pack-habit-schedules",
  async ({ userhabitpackhabit, search, offset, limit, filter }: { userhabitpackhabit?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`habit-pack-habit-schedule-search?userhabitpackhabit=${userhabitpackhabit}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createHabitPackHabitSchedule = createAsyncThunk(
    "post/habit-pack-habit-schedule",
    async (habitPackHabitSchedule: Partial<Habitpackhabitschedule>) => {
      const client = await fetchClient();
      const { data } = await client.post(`habit-pack-habit-schedule/`, { habitPackHabitSchedule });
      return data;
    }
  );


export const updateHabitPackHabitSchedule = createAsyncThunk(
  "put/habit-pack-habit-schedule",
  async (habitPackHabitSchedule: Partial<Habitpackhabitschedule>) => {
    const client = await fetchClient();
    const { data } = await client.put(`habit-pack-habit-schedule/`, { habitPackHabitSchedule });
    return data;
  }
);

export const getHabitPackHabitSchedule = createAsyncThunk(
  "get/habit-pack-habit-schedule",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`habit-pack-habit-schedule/${id}`);
    return data;
  }
);

export const deleteHabitPackHabitSchedule = createAsyncThunk(
  "delete/habit-pack-habit-schedule",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`habit-pack-habit-schedule/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: HabitPackHabitScheduleCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const habitPackHabitSchedulesSlice = createSlice({
  name: "habitPackHabitSchedules",
  initialState,
  reducers: {
    clearHabitPackHabitScheduleItems(state: HabitPackHabitScheduleCollectionState) {
      Object.assign(state, initialState);
    },
    clearHabitPackHabitScheduleError(state: HabitPackHabitScheduleCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHabitPackHabitSchedules.pending || searchHabitPackHabitSchedules.pending, (state: HabitPackHabitScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getHabitPackHabitSchedules.fulfilled || searchHabitPackHabitSchedules.fulfilled, (state: HabitPackHabitScheduleCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getHabitPackHabitSchedules.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getHabitPackHabitSchedule.pending, (state: HabitPackHabitScheduleCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteHabitPackHabitSchedule.pending, (state: HabitPackHabitScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateHabitPackHabitSchedule.pending, (state: HabitPackHabitScheduleCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getHabitPackHabitSchedule.fulfilled, (state: HabitPackHabitScheduleCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteHabitPackHabitSchedule.fulfilled, (state: HabitPackHabitScheduleCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateHabitPackHabitSchedule.fulfilled, (state: HabitPackHabitScheduleCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createHabitPackHabitSchedule.pending, (state: HabitPackHabitScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createHabitPackHabitSchedule.fulfilled, (state: HabitPackHabitScheduleCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getHabitPackHabitSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteHabitPackHabitSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateHabitPackHabitSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("HabitPackHabitSchedule")?.reducerConfig(builder);
  },
});

export const habitPackHabitScheduleSelector = (id: number) => (state: AppState) => {
  return state.habitPackHabitSchedules?.items?.find((o) => o.Id === id);
}; 

export const habitPackHabitScheduleLoading = createSelector(
  (state: AppState) => state.habitPackHabitSchedules.status,
  status => status === 'pending'
);

export const habitPackHabitScheduleErrorSelector = createSelector(
  (state: AppState) => state.habitPackHabitSchedules,
  status => status.error
);


export const habitPackHabitSchedulesSelector = (userHabitPackHabit?: number) => (state: AppState) => {
  if (!userHabitPackHabit) {
    return undefined;
  }
  return state.habitPackHabitSchedules?.items?.filter((q) => q.UserHabitPackHabit === userHabitPackHabit);
}; 

export const habitPackHabitSchedulesLoading = createSelector(
  (state: AppState) => state.habitPackHabitSchedules.status,
  status => status === 'pending'
);

export const habitPackHabitSchedulesErrorSelector = createSelector(
  (state: AppState) => state.habitPackHabitSchedules,
  status => status.error
);

export const { clearHabitPackHabitScheduleItems, clearHabitPackHabitScheduleError } = habitPackHabitSchedulesSlice.actions;

export default habitPackHabitSchedulesSlice.reducer;
