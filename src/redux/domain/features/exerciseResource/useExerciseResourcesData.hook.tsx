import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getExerciseResources,
  exerciseResourcesSelector,
  clearExerciseResourceItems,
  exerciseResourcesErrorSelector,
} from "./collection-slice";

const useExerciseResourcesData = (exercise?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(exerciseResourcesErrorSelector);
  const data = useSelector(exerciseResourcesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getExerciseResources({
        limit: 0,
        exercise,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, exercise]);

  const clearData = useCallback(() => {
    dispatch(clearExerciseResourceItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!exercise) {
      return;
    }
    refresh();
  }, [refresh, exercise]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useExerciseResourcesData;
