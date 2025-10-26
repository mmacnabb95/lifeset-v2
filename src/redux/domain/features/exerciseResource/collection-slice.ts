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
import { ExerciseResourceCollectionState } from "./exercise-resource-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Exerciseresource } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ExerciseResourceCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("ExerciseResource")?.thunkConfig();
export {thunks}; 


export const getExerciseResources = createAsyncThunk(
  "get/exercise-resources",
  async (options?: { exercise?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise-resource?exercise=${options?.exercise}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchExerciseResources = createAsyncThunk(
  "get/exercise-resources",
  async ({ exercise, search, offset, limit, filter }: { exercise?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`exercise-resource-search?exercise=${exercise}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createExerciseResource = createAsyncThunk(
    "post/exercise-resource",
    async (exerciseResource: Partial<Exerciseresource>) => {
      const client = await fetchClient();
      const { data } = await client.post(`exercise-resource/`, { exerciseResource });
      return data;
    }
  );


export const updateExerciseResource = createAsyncThunk(
  "put/exercise-resource",
  async (exerciseResource: Partial<Exerciseresource>) => {
    const client = await fetchClient();
    const { data } = await client.put(`exercise-resource/`, { exerciseResource });
    return data;
  }
);

export const getExerciseResource = createAsyncThunk(
  "get/exercise-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`exercise-resource/${id}`);
    return data;
  }
);

export const deleteExerciseResource = createAsyncThunk(
  "delete/exercise-resource",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`exercise-resource/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: ExerciseResourceCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Exercise : undefined;

//   if(currentStateConstraint && actionArgs.exercise && Number(actionArgs.exercise) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Exercise : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: ExerciseResourceCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const exerciseResourcesSlice = createSlice({
  name: "exerciseResources",
  initialState,
  reducers: {
    clearExerciseResourceItems(state: ExerciseResourceCollectionState) {
      Object.assign(state, initialState);
    },
    clearExerciseResourceError(state: ExerciseResourceCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getExerciseResources.pending || searchExerciseResources.pending, (state: ExerciseResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getExerciseResources.fulfilled || searchExerciseResources.fulfilled, (state: ExerciseResourceCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getExerciseResources.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getExerciseResource.pending, (state: ExerciseResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteExerciseResource.pending, (state: ExerciseResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateExerciseResource.pending, (state: ExerciseResourceCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getExerciseResource.fulfilled, (state: ExerciseResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteExerciseResource.fulfilled, (state: ExerciseResourceCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateExerciseResource.fulfilled, (state: ExerciseResourceCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createExerciseResource.pending, (state: ExerciseResourceCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createExerciseResource.fulfilled, (state: ExerciseResourceCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getExerciseResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteExerciseResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateExerciseResource.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("ExerciseResource")?.reducerConfig(builder);
  },
});

export const exerciseResourceSelector = (id: number) => (state: AppState) => {
  return state.exerciseResources?.items?.find((o) => o.Id === id);
}; 

export const exerciseResourceLoading = createSelector(
  (state: AppState) => state.exerciseResources.status,
  status => status === 'pending'
);

export const exerciseResourceErrorSelector = createSelector(
  (state: AppState) => state.exerciseResources,
  status => status.error
);


export const exerciseResourcesSelector = (exercise?: number) => (state: AppState) => {
  if (!exercise) {
    return undefined;
  }
  return state.exerciseResources?.items?.filter((q) => q.Exercise === exercise);
}; 

export const exerciseResourcesLoading = createSelector(
  (state: AppState) => state.exerciseResources.status,
  status => status === 'pending'
);

export const exerciseResourcesErrorSelector = createSelector(
  (state: AppState) => state.exerciseResources,
  status => status.error
);

export const { clearExerciseResourceItems, clearExerciseResourceError } = exerciseResourcesSlice.actions;

export default exerciseResourcesSlice.reducer;
