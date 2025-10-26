import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRandomInspoQuotes,
  randomInspoQuotesSelector,
  clearRandomInspoQuoteItems,
  randomInspoQuotesErrorSelector,
} from "./collection-slice";

const useRandomInspoQuotesData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(randomInspoQuotesErrorSelector);
  const data = useSelector(randomInspoQuotesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getRandomInspoQuotes({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearRandomInspoQuoteItems());
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

export default useRandomInspoQuotesData;
