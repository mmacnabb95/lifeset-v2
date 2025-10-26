import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHabitPackHabits,
  habitPackHabitsSelector,
  clearHabitPackHabitItems,
  habitPackHabitsErrorSelector,
} from "./collection-slice";

const useHabitPackHabitsData = (habitpack?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(habitPackHabitsErrorSelector);
  const data = useSelector(habitPackHabitsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getHabitPackHabits({
        limit: 0,
        habitpack,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, habitpack]);

  const clearData = useCallback(() => {
    dispatch(clearHabitPackHabitItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!habitpack) {
      return;
    }
    refresh();
  }, [refresh, habitpack]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useHabitPackHabitsData;
