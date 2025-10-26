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
import { ExploreFeatureCollectionState } from "./explore-feature-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Explorefeature } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: ExploreFeatureCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("ExploreFeature")?.thunkConfig();
export {thunks}; 


export const getExploreFeatures = createAsyncThunk(
  "get/explore-features",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`explore-feature?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchExploreFeatures = createAsyncThunk(
  "get/explore-features",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`explore-feature-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createExploreFeature = createAsyncThunk(
    "post/explore-feature",
    async (exploreFeature: Partial<Explorefeature>) => {
      const client = await fetchClient();
      const { data } = await client.post(`explore-feature/`, { exploreFeature });
      return data;
    }
  );


export const updateExploreFeature = createAsyncThunk(
  "put/explore-feature",
  async (exploreFeature: Partial<Explorefeature>) => {
    const client = await fetchClient();
    const { data } = await client.put(`explore-feature/`, { exploreFeature });
    return data;
  }
);

export const getExploreFeature = createAsyncThunk(
  "get/explore-feature",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`explore-feature/${id}`);
    return data;
  }
);

export const deleteExploreFeature = createAsyncThunk(
  "delete/explore-feature",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`explore-feature/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: ExploreFeatureCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: ExploreFeatureCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const exploreFeaturesSlice = createSlice({
  name: "exploreFeatures",
  initialState,
  reducers: {
    clearExploreFeatureItems(state: ExploreFeatureCollectionState) {
      Object.assign(state, initialState);
    },
    clearExploreFeatureError(state: ExploreFeatureCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getExploreFeatures.pending || searchExploreFeatures.pending, (state: ExploreFeatureCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getExploreFeatures.fulfilled || searchExploreFeatures.fulfilled, (state: ExploreFeatureCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getExploreFeatures.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getExploreFeature.pending, (state: ExploreFeatureCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteExploreFeature.pending, (state: ExploreFeatureCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateExploreFeature.pending, (state: ExploreFeatureCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getExploreFeature.fulfilled, (state: ExploreFeatureCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteExploreFeature.fulfilled, (state: ExploreFeatureCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateExploreFeature.fulfilled, (state: ExploreFeatureCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createExploreFeature.pending, (state: ExploreFeatureCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createExploreFeature.fulfilled, (state: ExploreFeatureCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getExploreFeature.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteExploreFeature.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateExploreFeature.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("ExploreFeature")?.reducerConfig(builder);
  },
});

export const exploreFeatureSelector = (id: number) => (state: AppState) => {
  return state.exploreFeatures?.items?.find((o) => o.Id === id);
}; 

export const exploreFeatureLoading = createSelector(
  (state: AppState) => state.exploreFeatures.status,
  status => status === 'pending'
);

export const exploreFeatureErrorSelector = createSelector(
  (state: AppState) => state.exploreFeatures,
  status => status.error
);


export const exploreFeaturesSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.exploreFeatures?.items?.filter((q) => q.User === user);
}; 

export const exploreFeaturesLoading = createSelector(
  (state: AppState) => state.exploreFeatures.status,
  status => status === 'pending'
);

export const exploreFeaturesErrorSelector = createSelector(
  (state: AppState) => state.exploreFeatures,
  status => status.error
);

export const { clearExploreFeatureItems, clearExploreFeatureError } = exploreFeaturesSlice.actions;

export default exploreFeaturesSlice.reducer;
