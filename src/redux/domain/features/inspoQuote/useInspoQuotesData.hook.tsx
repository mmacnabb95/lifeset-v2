import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getInspoQuotes,
  inspoQuotesSelector,
  clearInspoQuoteItems,
  inspoQuotesErrorSelector,
} from "./collection-slice";

const useInspoQuotesData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(inspoQuotesErrorSelector);
  const data = useSelector(inspoQuotesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getInspoQuotes({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearInspoQuoteItems());
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

export default useInspoQuotesData;
