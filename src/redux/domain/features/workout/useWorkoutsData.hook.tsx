import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkouts,
  workoutsSelector,
  clearWorkoutItems,
  workoutsErrorSelector,
} from "./collection-slice";

const useWorkoutsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(workoutsErrorSelector);
  const data = useSelector(workoutsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getWorkouts({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearWorkoutItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useWorkoutsData;
