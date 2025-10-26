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
import { LanguageCollectionState } from "./language-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Language } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: LanguageCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("Language")?.thunkConfig();
export {thunks}; 


export const getLanguages = createAsyncThunk(
  "get/languages",
  async (options?: { language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`language?offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchLanguages = createAsyncThunk(
  "get/languages",
  async ({ search, offset, limit, filter }: { search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`language-search?offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createLanguage = createAsyncThunk(
    "post/language",
    async (language: Partial<Language>) => {
      const client = await fetchClient();
      const { data } = await client.post(`language/`, { language });
      return data;
    }
  );


export const updateLanguage = createAsyncThunk(
  "put/language",
  async (language: Partial<Language>) => {
    const client = await fetchClient();
    const { data } = await client.put(`language/`, { language });
    return data;
  }
);

export const getLanguage = createAsyncThunk(
  "get/language",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`language/${id}`);
    return data;
  }
);

export const deleteLanguage = createAsyncThunk(
  "delete/language",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`language/${id}`);
    return data;
  }
);


//if the item is already in the array get the index and update item at that index with the payload
const updateItemAtExisitingIndex = (state: LanguageCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const languagesSlice = createSlice({
  name: "languages",
  initialState,
  reducers: {
    clearLanguageItems(state: LanguageCollectionState) {
      Object.assign(state, initialState);
    },
    clearLanguageError(state: LanguageCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLanguages.pending || searchLanguages.pending, (state: LanguageCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getLanguages.fulfilled || searchLanguages.fulfilled, (state: LanguageCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getLanguages.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getLanguage.pending, (state: LanguageCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteLanguage.pending, (state: LanguageCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateLanguage.pending, (state: LanguageCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getLanguage.fulfilled, (state: LanguageCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteLanguage.fulfilled, (state: LanguageCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateLanguage.fulfilled, (state: LanguageCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createLanguage.pending, (state: LanguageCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createLanguage.fulfilled, (state: LanguageCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getLanguage.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteLanguage.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateLanguage.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("Language")?.reducerConfig(builder);
  },
});

export const languageSelector = (id: number) => (state: AppState) => {
  return state.languages?.items?.find((o) => o.Id === id);
}; 

export const languageLoading = createSelector(
  (state: AppState) => state.languages.status,
  status => status === 'pending'
);

export const languageErrorSelector = createSelector(
  (state: AppState) => state.languages,
  status => status.error
);


export const languagesSelector = createSelector(
  (state: AppState) => state.languages,
  state => state.items
);

export const languagesLoading = createSelector(
  (state: AppState) => state.languages.status,
  status => status === 'pending'
);

export const languagesErrorSelector = createSelector(
  (state: AppState) => state.languages,
  status => status.error
);

export const { clearLanguageItems, clearLanguageError } = languagesSlice.actions;

export default languagesSlice.reducer;
