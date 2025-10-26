import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getJournals,
  journalsSelector,
  clearJournalItems,
  journalsErrorSelector,
} from "./collection-slice";

const useJournalsData = (user?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(journalsErrorSelector);
  const data = useSelector(journalsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getJournals({
        limit: 0,
        user,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, user]);

  const clearData = useCallback(() => {
    dispatch(clearJournalItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!user) {
      return;
    }
    refresh();
  }, [refresh, user]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useJournalsData;
