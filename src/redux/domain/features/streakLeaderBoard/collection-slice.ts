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
import { StreakLeaderBoardCollectionState } from "./streak-leader-board-collection-state";
import { Search } from '../../../../../../types/search/search';
import { Streakleaderboard } from "../../../../../../types/domain/flat-types";
import { collectionSliceConfig } from "src/components/common/config/formInjection/collectionSliceConfig";

const initialState: StreakLeaderBoardCollectionState = {
  items: undefined,
  status: "idle",
};

const thunks = collectionSliceConfig.config("StreakLeaderBoard")?.thunkConfig();
export {thunks}; 


export const getStreakLeaderBoards = createAsyncThunk(
  "get/streak-leader-boards",
  async (options?: { company?: number, language?: number, offset?: number, limit?: number }) => {
    const client = await fetchClient();
    const { data } = await client.get(`streak-leader-board?company=${options?.company}&offset=${options?.offset || 0}&limit=${options?.limit || 100}`);
    return data;
  }
);

export const searchStreakLeaderBoards = createAsyncThunk(
  "get/streak-leader-boards",
  async ({ company, search, offset, limit, filter }: { company?: number, search: Search, offset?: number, limit?: number, filter?: string }) => {
    const client = await fetchClient();
    const { data } = await client.post(`streak-leader-board-search?company=${company}&offset=${offset || 0}&limit=${limit || 100}&filter=${filter || ''}`, { search });
    return data;
  }
);


  export const createStreakLeaderBoard = createAsyncThunk(
    "post/streak-leader-board",
    async (streakLeaderBoard: Partial<Streakleaderboard>) => {
      const client = await fetchClient();
      const { data } = await client.post(`streak-leader-board/`, { streakLeaderBoard });
      return data;
    }
  );


export const updateStreakLeaderBoard = createAsyncThunk(
  "put/streak-leader-board",
  async (streakLeaderBoard: Partial<Streakleaderboard>) => {
    const client = await fetchClient();
    const { data } = await client.put(`streak-leader-board/`, { streakLeaderBoard });
    return data;
  }
);

export const getStreakLeaderBoard = createAsyncThunk(
  "get/streak-leader-board",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.get(`streak-leader-board/${id}`);
    return data;
  }
);

export const deleteStreakLeaderBoard = createAsyncThunk(
  "delete/streak-leader-board",
  async (id: number) => {
    const client = await fetchClient();
    const { data } = await client.delete(`streak-leader-board/${id}`);
    return data;
  }
);

// const shouldAddToCollection = (payload: any, state: StreakLeaderBoardCollectionState, actionArgs: any) => {

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
const updateItemAtExisitingIndex = (state: StreakLeaderBoardCollectionState, payload: any) => {
  const exisitingIndex = _.findIndex(state.items, (item) => { return item.Id === payload.Id; });
  if (exisitingIndex !== -1) {
    state.items?.splice(exisitingIndex, 1, payload);
  } else {
    state.items = _.unionBy([payload], state.items || [], 'Id');
  }
};

const streakLeaderBoardsSlice = createSlice({
  name: "streakLeaderBoards",
  initialState,
  reducers: {
    clearStreakLeaderBoardItems(state: StreakLeaderBoardCollectionState) {
      Object.assign(state, initialState);
    },
    clearStreakLeaderBoardError(state: StreakLeaderBoardCollectionState) {
      Object.assign(state, { error: undefined });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getStreakLeaderBoards.pending || searchStreakLeaderBoards.pending, (state: StreakLeaderBoardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(getStreakLeaderBoards.fulfilled || searchStreakLeaderBoards.fulfilled, (state: StreakLeaderBoardCollectionState, action) => {
      state.items = _.unionBy(action.payload, state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(getStreakLeaderBoards.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(getStreakLeaderBoard.pending, (state: StreakLeaderBoardCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(deleteStreakLeaderBoard.pending, (state: StreakLeaderBoardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(updateStreakLeaderBoard.pending, (state: StreakLeaderBoardCollectionState) => {
      state.status = "pending";
    });

    builder.addCase(getStreakLeaderBoard.fulfilled, (state: StreakLeaderBoardCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(deleteStreakLeaderBoard.fulfilled, (state: StreakLeaderBoardCollectionState, action) => {
      state.items = state.items?.filter(i => i.Id !== action.meta.arg);
      state.error = undefined;
      state.status = "fulfilled";
    });
    builder.addCase(updateStreakLeaderBoard.fulfilled, (state: StreakLeaderBoardCollectionState, action) => {
      updateItemAtExisitingIndex(state, action.payload);
      state.error = undefined;
      state.status = "fulfilled";
    });


    builder.addCase(createStreakLeaderBoard.pending, (state: StreakLeaderBoardCollectionState) => {
      state.status = "pending";
    });
    builder.addCase(createStreakLeaderBoard.fulfilled, (state: StreakLeaderBoardCollectionState, action) => {
      state.items = _.unionBy([action.payload], state.items || [], 'Id');
      state.error = undefined;
      state.status = "fulfilled";
    });

    builder.addCase(getStreakLeaderBoard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });

    builder.addCase(deleteStreakLeaderBoard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });
    builder.addCase(updateStreakLeaderBoard.rejected, (state, { error }) => {
      state.status = 'rejected';
      state.error = error.message;
    });


    collectionSliceConfig.config("StreakLeaderBoard")?.reducerConfig(builder);
  },
});

export const streakLeaderBoardSelector = (id: number) => (state: AppState) => {
  return state.streakLeaderBoards?.items?.find((o) => o.Id === id);
}; 

export const streakLeaderBoardLoading = createSelector(
  (state: AppState) => state.streakLeaderBoards.status,
  status => status === 'pending'
);

export const streakLeaderBoardErrorSelector = createSelector(
  (state: AppState) => state.streakLeaderBoards,
  status => status.error
);


export const streakLeaderBoardsSelector = (company?: number) => (state: AppState) => {
  if (!company) {
    return undefined;
  }
  return state.streakLeaderBoards?.items?.filter((q) => q.Company === company);
}; 

export const streakLeaderBoardsLoading = createSelector(
  (state: AppState) => state.streakLeaderBoards.status,
  status => status === 'pending'
);

export const streakLeaderBoardsErrorSelector = createSelector(
  (state: AppState) => state.streakLeaderBoards,
  status => status.error
);

export const { clearStreakLeaderBoardItems, clearStreakLeaderBoardError } = streakLeaderBoardsSlice.actions;

export default streakLeaderBoardsSlice.reducer;
