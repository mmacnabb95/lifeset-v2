import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHabitMediaKeys,
  habitMediaKeysSelector,
  clearHabitMediaKeyItems,
  habitMediaKeysErrorSelector,
} from "./collection-slice";

const useHabitMediaKeysData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(habitMediaKeysErrorSelector);
  const data = useSelector(habitMediaKeysSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getHabitMediaKeys({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearHabitMediaKeyItems());
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

export default useHabitMediaKeysData;
