import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getReminders,
  remindersSelector,
  clearReminderItems,
  remindersErrorSelector,
} from "./collection-slice";

const useRemindersData = (habit?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(remindersErrorSelector);
  const data = useSelector(remindersSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getReminders({
        limit: 0,
        habit,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, habit]);

  const clearData = useCallback(() => {
    dispatch(clearReminderItems());
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

export default useRemindersData;
