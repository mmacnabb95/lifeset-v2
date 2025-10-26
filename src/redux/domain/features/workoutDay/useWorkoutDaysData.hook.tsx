import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkoutDays,
  workoutDaysSelector,
  clearWorkoutDayItems,
  workoutDaysErrorSelector,
} from "./collection-slice";

const useWorkoutDaysData = (workout?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(workoutDaysErrorSelector);
  const data = useSelector(workoutDaysSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getWorkoutDays({
        limit: 0,
        workout,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, workout]);

  const clearData = useCallback(() => {
    dispatch(clearWorkoutDayItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!workout) {
      return;
    }
    refresh();
  }, [refresh, workout]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useWorkoutDaysData;
