/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import {
  createSelector,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchClient } from "src/utils/legacy-stubs"; // DEPRECATED: Replace with RevenueCat
import { AppState } from "src/redux/reducer/root-reducer";
import _ from 'lodash'; 
import { SubscriptionViewCollectionState } from "./subscription-view-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Subscriptionview } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: SubscriptionViewCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("SubscriptionView")?.thunkConfig();
export {thunks}; 


export const getSubscriptionViews = createAsyncThunk(
  "get/subscription-views",
  async (options?: { user?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`subscription-view?user=${options?.user}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchSubscriptionViews = createAsyncThunk(
  "get/subscription-views",
  async ({ user, search, offset, limit, filter }: { user?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`subscription-view-search?user=${user}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);



export const getSubscriptionView = createAsyncThunk(
  "get/subscription-view",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`subscription-view/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: SubscriptionViewCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: SubscriptionViewCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const subscriptionViewsSlice = createSlice({
  name: "subscriptionViews",
  initialState,
  reducers: {
    clearSubscriptionViewItems(state: SubscriptionViewCollectionState) {
      Object.assign(state, initialState);
    },
    clearSubscriptionViewError(state: SubscriptionViewCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSubscriptionViews.pending || searchSubscriptionViews.pending, (state: SubscriptionViewCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getSubscriptionViews.fulfilled || searchSubscriptionViews.fulfilled, (state: SubscriptionViewCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getSubscriptionViews.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getSubscriptionView.pending, (state: SubscriptionViewCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getSubscriptionView.fulfilled, (state: SubscriptionViewCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(getSubscriptionView.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    collectionSliceConfig.config("SubscriptionView")?.reducerConfig(builder);
  },
});

export const subscriptionViewSelector = (id: number) => (state: AppState) => {
  return state.subscriptionViews?.items?.find((o) => o.Id === id);
}; 

export const subscriptionViewLoading = createSelector(
  (state: AppState) => state.subscriptionViews.status,
  status => status === 'pending'
);

export const subscriptionViewErrorSelector = createSelector(
  (state: AppState) => state.subscriptionViews,
  status => status.error
);


export const subscriptionViewsSelector = (user?: number) => (state: AppState) => {
  if (!user) {
    return undefined;
  }
  return state.subscriptionViews?.items?.filter((q) => q.User === user);
}; 

export const subscriptionViewsLoading = createSelector(
  (state: AppState) => state.subscriptionViews.status,
  status => status === 'pending'
);

export const subscriptionViewsErrorSelector = createSelector(
  (state: AppState) => state.subscriptionViews,
  status => status.error
);

export const { clearSubscriptionViewItems, clearSubscriptionViewError } = subscriptionViewsSlice.actions;

export default subscriptionViewsSlice.reducer;
