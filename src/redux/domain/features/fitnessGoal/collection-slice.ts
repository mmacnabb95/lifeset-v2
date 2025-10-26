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
import { FitnessGoalCollectionState } from "./fitness-goal-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Fitnessgoal } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: FitnessGoalCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("FitnessGoal")?.thunkConfig();
export {thunks}; 


export const getFitnessGoals = createAsyncThunk(
  "get/fitness-goals",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`fitness-goal?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchFitnessGoals = createAsyncThunk(
  "get/fitness-goals",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`fitness-goal-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createFitnessGoal = createAsyncThunk(
    "post/fitness-goal",
    async (fitnessGoal: Partial<Fitnessgoal>) => {
      const client = await fetchClient();
      const { data } = await client.post(`fitness-goal/`, { fitnessGoal });
      return data;
    }
  );


export const updateFitnessGoal = createAsyncThunk(
  "put/fitness-goal",
  async (fitnessGoal: Partial<Fitnessgoal>) => {
    const client = await fetchClient();
    const { data } = await client.put(`fitness-goal/`, { fitnessGoal });
    return data;
  }
);

export const getFitnessGoal = createAsyncThunk(
  "get/fitness-goal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`fitness-goal/${id}`);
    return data;
  }
);

export const deleteFitnessGoal = createAsyncThunk(
  "delete/fitness-goal",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`fitness-goal/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: FitnessGoalCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const fitnessGoalsSlice = createSlice({
  name: "fitnessGoals",
  initialState,
  reducers: {
    clearFitnessGoalItems(state: FitnessGoalCollectionState) {
      Object.assign(state, initialState);
    },
    clearFitnessGoalError(state: FitnessGoalCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFitnessGoals.pending || searchFitnessGoals.pending, (state: FitnessGoalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getFitnessGoals.fulfilled || searchFitnessGoals.fulfilled, (state: FitnessGoalCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getFitnessGoals.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getFitnessGoal.pending, (state: FitnessGoalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteFitnessGoal.pending, (state: FitnessGoalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateFitnessGoal.pending, (state: FitnessGoalCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getFitnessGoal.fulfilled, (state: FitnessGoalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteFitnessGoal.fulfilled, (state: FitnessGoalCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateFitnessGoal.fulfilled, (state: FitnessGoalCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createFitnessGoal.pending, (state: FitnessGoalCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createFitnessGoal.fulfilled, (state: FitnessGoalCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getFitnessGoal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteFitnessGoal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateFitnessGoal.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("FitnessGoal")?.reducerConfig(builder);
  },
});

export const fitnessGoalSelector = (id: number) => (state: AppState) => {
  return state.fitnessGoals?.items?.find((o) => o.Id === id);
}; 

export const fitnessGoalLoading = createSelector(
  (state: AppState) => state.fitnessGoals.status,
  status => status === 'pending'
);

export const fitnessGoalErrorSelector = createSelector(
  (state: AppState) => state.fitnessGoals,
  status => status.error
);


export const fitnessGoalsSelector = createSelector(
  (state: AppState) => state.fitnessGoals,
  state => state.items
);

export const fitnessGoalsLoading = createSelector(
  (state: AppState) => state.fitnessGoals.status,
  status => status === 'pending'
);

export const fitnessGoalsErrorSelector = createSelector(
  (state: AppState) => state.fitnessGoals,
  status => status.error
);

export const { clearFitnessGoalItems, clearFitnessGoalError } = fitnessGoalsSlice.actions;

export default fitnessGoalsSlice.reducer;
