import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyEntriesJournals,
  myEntriesJournalsSelector,
  clearMyEntriesJournalItems,
  myEntriesJournalsErrorSelector,
} from "./collection-slice";

const useMyEntriesJournalsData = (user?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(myEntriesJournalsErrorSelector);
  const data = useSelector(myEntriesJournalsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getMyEntriesJournals({
        limit: 0,
        user,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, user]);

  const clearData = useCallback(() => {
    dispatch(clearMyEntriesJournalItems());
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

export default useMyEntriesJournalsData;
