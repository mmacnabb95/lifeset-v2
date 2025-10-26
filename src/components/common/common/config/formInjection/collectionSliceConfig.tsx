import { createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { fetchClient } from "src/utils/legacy-stubs";
import { HabitCollectionState } from "src/redux/domain/features/habit/habit-collection-state";

export const collectionSliceConfig = {
  config: (resource: string) => {
    if (resource === "Habit") {
      const getHabitsByDate = createAsyncThunk(
        "get/habits-by-date",
        async (options?: {
          user?: number;
          date: string;
          language?: number;
          offset?: number;
          limit?: number;
        }) => {
          const client = await fetchClient();
          const { data } = await client.get(
            `habit-get-by-date?user=${options?.user}&date=${
              options?.date
            }&offset=${options?.offset || 0}&limit=${options?.limit || 100}`,
          );
          return data;
        },
      );

      const thunkConfig = () => {
        return { getHabitsByDate };
      };

      const reducerConfig = (
        builder: ActionReducerMapBuilder<HabitCollectionState>,
      ) => {
        builder.addCase(
          getHabitsByDate.pending,
          (state: HabitCollectionState) => {
            state.status = "pending";
          },
        );
        builder.addCase(
          getHabitsByDate.fulfilled,
          (state: HabitCollectionState, action) => {
            state.items = action.payload;
            state.status = "fulfilled";
          },
        );
        builder.addCase(getHabitsByDate.rejected, (state, { error }) => {
          state.status = "rejected";
          state.error = error.message;
        });
      };

      return { thunkConfig, reducerConfig };
    }
  },
};
