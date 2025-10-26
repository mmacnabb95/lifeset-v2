import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkoutSessionLengths,
  workoutSessionLengthsSelector,
  clearWorkoutSessionLengthItems,
  workoutSessionLengthsErrorSelector,
} from "./collection-slice";

const useWorkoutSessionLengthsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(workoutSessionLengthsErrorSelector);
  const data = useSelector(workoutSessionLengthsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getWorkoutSessionLengths({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearWorkoutSessionLengthItems());
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

export default useWorkoutSessionLengthsData;
