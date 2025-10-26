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
import { DaysPerWeekCollectionState } from "./days-per-week-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Daysperweek } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: DaysPerWeekCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("DaysPerWeek")?.thunkConfig();
export {thunks}; 


export const getDaysPerWeeks = createAsyncThunk(
  "get/days-per-weeks",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`days-per-week?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchDaysPerWeeks = createAsyncThunk(
  "get/days-per-weeks",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`days-per-week-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createDaysPerWeek = createAsyncThunk(
    "post/days-per-week",
    async (daysPerWeek: Partial<Daysperweek>) => {
      const client = await fetchClient();
      const { data } = await client.post(`days-per-week/`, { daysPerWeek });
      return data;
    }
  );


export const updateDaysPerWeek = createAsyncThunk(
  "put/days-per-week",
  async (daysPerWeek: Partial<Daysperweek>) => {
    const client = await fetchClient();
    const { data } = await client.put(`days-per-week/`, { daysPerWeek });
    return data;
  }
);

export const getDaysPerWeek = createAsyncThunk(
  "get/days-per-week",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`days-per-week/${id}`);
    return data;
  }
);

export const deleteDaysPerWeek = createAsyncThunk(
  "delete/days-per-week",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`days-per-week/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: DaysPerWeekCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const daysPerWeeksSlice = createSlice({
  name: "daysPerWeeks",
  initialState,
  reducers: {
    clearDaysPerWeekItems(state: DaysPerWeekCollectionState) {
      Object.assign(state, initialState);
    },
    clearDaysPerWeekError(state: DaysPerWeekCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDaysPerWeeks.pending || searchDaysPerWeeks.pending, (state: DaysPerWeekCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getDaysPerWeeks.fulfilled || searchDaysPerWeeks.fulfilled, (state: DaysPerWeekCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getDaysPerWeeks.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getDaysPerWeek.pending, (state: DaysPerWeekCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteDaysPerWeek.pending, (state: DaysPerWeekCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateDaysPerWeek.pending, (state: DaysPerWeekCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getDaysPerWeek.fulfilled, (state: DaysPerWeekCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteDaysPerWeek.fulfilled, (state: DaysPerWeekCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateDaysPerWeek.fulfilled, (state: DaysPerWeekCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createDaysPerWeek.pending, (state: DaysPerWeekCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createDaysPerWeek.fulfilled, (state: DaysPerWeekCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getDaysPerWeek.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteDaysPerWeek.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateDaysPerWeek.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("DaysPerWeek")?.reducerConfig(builder);
  },
});

export const daysPerWeekSelector = (id: number) => (state: AppState) => {
  return state.daysPerWeeks?.items?.find((o) => o.Id === id);
}; 

export const daysPerWeekLoading = createSelector(
  (state: AppState) => state.daysPerWeeks.status,
  status => status === 'pending'
);

export const daysPerWeekErrorSelector = createSelector(
  (state: AppState) => state.daysPerWeeks,
  status => status.error
);


export const daysPerWeeksSelector = createSelector(
  (state: AppState) => state.daysPerWeeks,
  state => state.items
);

export const daysPerWeeksLoading = createSelector(
  (state: AppState) => state.daysPerWeeks.status,
  status => status === 'pending'
);

export const daysPerWeeksErrorSelector = createSelector(
  (state: AppState) => state.daysPerWeeks,
  status => status.error
);

export const { clearDaysPerWeekItems, clearDaysPerWeekError } = daysPerWeeksSlice.actions;

export default daysPerWeeksSlice.reducer;
