import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentFitnessLevels,
  currentFitnessLevelsSelector,
  clearCurrentFitnessLevelItems,
  currentFitnessLevelsErrorSelector,
} from "./collection-slice";

const useCurrentFitnessLevelsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(currentFitnessLevelsErrorSelector);
  const data = useSelector(currentFitnessLevelsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getCurrentFitnessLevels({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearCurrentFitnessLevelItems());
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

export default useCurrentFitnessLevelsData;
