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
import { ScheduleCollectionState } from "./schedule-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Schedule } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ScheduleCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Schedule")?.thunkConfig();
export {thunks}; 


export const getSchedules = createAsyncThunk(
  "get/schedules",
  async (options?: { habit?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`schedule?habit=${options?.habit}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchSchedules = createAsyncThunk(
  "get/schedules",
  async ({ habit, search, offset, limit, filter }: { habit?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`schedule-search?habit=${habit}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createSchedule = createAsyncThunk(
    "post/schedule",
    async (schedule: Partial<Schedule>) => {
      const client = await fetchClient();
      const { data } = await client.post(`schedule/`, { schedule });
      return data;
    }
  );


export const updateSchedule = createAsyncThunk(
  "put/schedule",
  async (schedule: Partial<Schedule>) => {
    const client = await fetchClient();
    const { data } = await client.put(`schedule/`, { schedule });
    return data;
  }
);

export const getSchedule = createAsyncThunk(
  "get/schedule",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`schedule/${id}`);
    return data;
  }
);

export const deleteSchedule = createAsyncThunk(
  "delete/schedule",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`schedule/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: ScheduleCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    clearScheduleItems(state: ScheduleCollectionState) {
      Object.assign(state, initialState);
    },
    clearScheduleError(state: ScheduleCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSchedules.pending || searchSchedules.pending, (state: ScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getSchedules.fulfilled || searchSchedules.fulfilled, (state: ScheduleCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getSchedules.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getSchedule.pending, (state: ScheduleCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteSchedule.pending, (state: ScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateSchedule.pending, (state: ScheduleCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getSchedule.fulfilled, (state: ScheduleCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteSchedule.fulfilled, (state: ScheduleCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateSchedule.fulfilled, (state: ScheduleCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createSchedule.pending, (state: ScheduleCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createSchedule.fulfilled, (state: ScheduleCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateSchedule.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Schedule")?.reducerConfig(builder);
  },
});

export const scheduleSelector = (id: number) => (state: AppState) => {
  return state.schedules?.items?.find((o) => o.Id === id);
}; 

export const scheduleLoading = createSelector(
  (state: AppState) => state.schedules.status,
  status => status === 'pending'
);

export const scheduleErrorSelector = createSelector(
  (state: AppState) => state.schedules,
  status => status.error
);


export const schedulesSelector = (habit?: number) => (state: AppState) => {
  if (!habit) {
    return undefined;
  }
  return state.schedules?.items?.filter((q) => q.Habit === habit);
}; 

export const schedulesLoading = createSelector(
  (state: AppState) => state.schedules.status,
  status => status === 'pending'
);

export const schedulesErrorSelector = createSelector(
  (state: AppState) => state.schedules,
  status => status.error
);

export const { clearScheduleItems, clearScheduleError } = schedulesSlice.actions;

export default schedulesSlice.reducer;
