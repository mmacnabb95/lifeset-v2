import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHabitCompletedRecords,
  habitCompletedRecordsSelector,
  clearHabitCompletedRecordItems,
  habitCompletedRecordsErrorSelector,
} from "./collection-slice";

const useHabitCompletedRecordsData = (habit?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(habitCompletedRecordsErrorSelector);
  const data = useSelector(habitCompletedRecordsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getHabitCompletedRecords({
        limit: 0,
        habit,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, habit]);

  const clearData = useCallback(() => {
    dispatch(clearHabitCompletedRecordItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!habit) {
      return;
    }
    refresh();
  }, [refresh, habit]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useHabitCompletedRecordsData;
