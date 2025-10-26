import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSchedules,
  schedulesSelector,
  clearScheduleItems,
  schedulesErrorSelector,
} from "./collection-slice";

const useSchedulesData = (habit?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(schedulesErrorSelector);
  const data = useSelector(schedulesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getSchedules({
        limit: 0,
        habit,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, habit]);

  const clearData = useCallback(() => {
    dispatch(clearScheduleItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!habit) {
      return;
    }
    refresh();
  }, [refresh, habit]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useSchedulesData;
