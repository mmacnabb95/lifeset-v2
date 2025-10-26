import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHabits,
  habitsSelector,
  clearHabitItems,
  habitsErrorSelector,
} from "./collection-slice";

const useHabitsData = (user?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(habitsErrorSelector);
  const data = useSelector(habitsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getHabits({
        limit: 0,
        user,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, user]);

  const clearData = useCallback(() => {
    dispatch(clearHabitItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!user) {
      return;
    }
    refresh();
  }, [refresh, user]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useHabitsData;
