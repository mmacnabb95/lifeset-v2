import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHabitPackHabitSchedules,
  habitPackHabitSchedulesSelector,
  clearHabitPackHabitScheduleItems,
  habitPackHabitSchedulesErrorSelector,
} from "./collection-slice";

const useHabitPackHabitSchedulesData = (userhabitpackhabit?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(habitPackHabitSchedulesErrorSelector);
  const data = useSelector(habitPackHabitSchedulesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getHabitPackHabitSchedules({
        limit: 0,
        userhabitpackhabit,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, userhabitpackhabit]);

  const clearData = useCallback(() => {
    dispatch(clearHabitPackHabitScheduleItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!userhabitpackhabit) {
      return;
    }
    refresh();
  }, [refresh, userhabitpackhabit]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useHabitPackHabitSchedulesData;
