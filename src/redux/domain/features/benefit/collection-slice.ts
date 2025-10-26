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
import { BenefitCollectionState } from "./benefit-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Benefit } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: BenefitCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Benefit")?.thunkConfig();
export {thunks}; 


export const getBenefits = createAsyncThunk(
  "get/benefits",
  async (options?: { company?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`benefit?company=${options?.company}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchBenefits = createAsyncThunk(
  "get/benefits",
  async ({ company, search, offset, limit, filter }: { company?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`benefit-search?company=${company}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createBenefit = createAsyncThunk(
    "post/benefit",
    async (benefit: Partial<Benefit>) => {
      const client = await fetchClient();
      const { data } = await client.post(`benefit/`, { benefit });
      return data;
    }
  );


export const updateBenefit = createAsyncThunk(
  "put/benefit",
  async (benefit: Partial<Benefit>) => {
    const client = await fetchClient();
    const { data } = await client.put(`benefit/`, { benefit });
    return data;
  }
);

export const getBenefit = createAsyncThunk(
  "get/benefit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`benefit/${id}`);
    return data;
  }
);

export const deleteBenefit = createAsyncThunk(
  "delete/benefit",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`benefit/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: BenefitCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Company : undefined;

//   if(currentStateConstraint && actionArgs.company && Number(actionArgs.company) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Company : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: BenefitCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const benefitsSlice = createSlice({
  name: "benefits",
  initialState,
  reducers: {
    clearBenefitItems(state: BenefitCollectionState) {
      Object.assign(state, initialState);
    },
    clearBenefitError(state: BenefitCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getBenefits.pending || searchBenefits.pending, (state: BenefitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getBenefits.fulfilled || searchBenefits.fulfilled, (state: BenefitCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getBenefits.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getBenefit.pending, (state: BenefitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteBenefit.pending, (state: BenefitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateBenefit.pending, (state: BenefitCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getBenefit.fulfilled, (state: BenefitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteBenefit.fulfilled, (state: BenefitCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateBenefit.fulfilled, (state: BenefitCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createBenefit.pending, (state: BenefitCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createBenefit.fulfilled, (state: BenefitCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getBenefit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteBenefit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateBenefit.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Benefit")?.reducerConfig(builder);
  },
});

export const benefitSelector = (id: number) => (state: AppState) => {
  return state.benefits?.items?.find((o) => o.Id === id);
}; 

export const benefitLoading = createSelector(
  (state: AppState) => state.benefits.status,
  status => status === 'pending'
);

export const benefitErrorSelector = createSelector(
  (state: AppState) => state.benefits,
  status => status.error
);


export const benefitsSelector = (company?: number) => (state: AppState) => {
  if (!company) {
    return undefined;
  }
  return state.benefits?.items?.filter((q) => q.Company === company);
}; 

export const benefitsLoading = createSelector(
  (state: AppState) => state.benefits.status,
  status => status === 'pending'
);

export const benefitsErrorSelector = createSelector(
  (state: AppState) => state.benefits,
  status => status.error
);

export const { clearBenefitItems, clearBenefitError } = benefitsSlice.actions;

export default benefitsSlice.reducer;
