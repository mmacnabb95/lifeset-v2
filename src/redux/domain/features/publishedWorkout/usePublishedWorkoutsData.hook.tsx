import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPublishedWorkouts,
  publishedWorkoutsSelector,
  clearPublishedWorkoutItems,
  publishedWorkoutsErrorSelector,
} from "./collection-slice";

const usePublishedWorkoutsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(publishedWorkoutsErrorSelector);
  const data = useSelector(publishedWorkoutsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getPublishedWorkouts({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearPublishedWorkoutItems());
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

export default usePublishedWorkoutsData;
