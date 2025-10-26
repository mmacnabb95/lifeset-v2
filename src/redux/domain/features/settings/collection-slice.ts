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
import { SettingsCollectionState } from "./settings-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Settings } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: SettingsCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Settings")?.thunkConfig();
export {thunks}; 


export const getSettingss = createAsyncThunk(
  "get/settingss",
  async (options?: { id?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`settings?id=${options?.id}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchSettingss = createAsyncThunk(
  "get/settingss",
  async ({ id, search, offset, limit, filter }: { id?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`settings-search?id=${id}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createSettings = createAsyncThunk(
    "post/settings",
    async (settings: Partial<Settings>) => {
      const client = await fetchClient();
      const { data } = await client.post(`settings/`, { settings });
      return data;
    }
  );


export const updateSettings = createAsyncThunk(
  "put/settings",
  async (settings: Partial<Settings>) => {
    const client = await fetchClient();
    const { data } = await client.put(`settings/`, { settings });
    return data;
  }
);

export const getSettings = createAsyncThunk(
  "get/settings",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`settings/${id}`);
    return data;
  }
);

export const deleteSettings = createAsyncThunk(
  "delete/settings",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`settings/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: SettingsCollectionState, actionArgs: any) => {

//     const currentStateConstraint = state.items && state.items[0] ? state.items[0].Id : undefined;

//   if(currentStateConstraint && actionArgs.id && Number(actionArgs.id) !== currentStateConstraint)
//     return false; //we're loading a new collection!

//   //no payload data? - then don't alter the existing collection
//   if(!payload || !payload.length || payload.length === 0) 
//     return true;

//   const payloadConstraint = payload && payload[0] ? payload[0].Id : -1;

//   return payloadConstraint === currentStateConstraint;
// };

//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: SettingsCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const settingssSlice = createSlice({
  name: "settingss",
  initialState,
  reducers: {
    clearSettingsItems(state: SettingsCollectionState) {
      Object.assign(state, initialState);
    },
    clearSettingsError(state: SettingsCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSettingss.pending || searchSettingss.pending, (state: SettingsCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getSettingss.fulfilled || searchSettingss.fulfilled, (state: SettingsCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getSettingss.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getSettings.pending, (state: SettingsCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteSettings.pending, (state: SettingsCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateSettings.pending, (state: SettingsCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getSettings.fulfilled, (state: SettingsCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteSettings.fulfilled, (state: SettingsCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateSettings.fulfilled, (state: SettingsCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createSettings.pending, (state: SettingsCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createSettings.fulfilled, (state: SettingsCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getSettings.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteSettings.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateSettings.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Settings")?.reducerConfig(builder);
  },
});

export const settingsSelector = (id: number) => (state: AppState) => {
  return state.settingss?.items?.find((o) => o.Id === id);
}; 

export const settingsLoading = createSelector(
  (state: AppState) => state.settingss.status,
  status => status === 'pending'
);

export const settingsErrorSelector = createSelector(
  (state: AppState) => state.settingss,
  status => status.error
);


export const settingssSelector = (id?: number) => (state: AppState) => {
  if (!id) {
    return undefined;
  }
  return state.settingss?.items?.filter((q) => q.Id === id);
}; 

export const settingssLoading = createSelector(
  (state: AppState) => state.settingss.status,
  status => status === 'pending'
);

export const settingssErrorSelector = createSelector(
  (state: AppState) => state.settingss,
  status => status.error
);

export const { clearSettingsItems, clearSettingsError } = settingssSlice.actions;

export default settingssSlice.reducer;
