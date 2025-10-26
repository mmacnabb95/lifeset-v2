import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCardioIncludeds,
  cardioIncludedsSelector,
  clearCardioIncludedItems,
  cardioIncludedsErrorSelector,
} from "./collection-slice";

const useCardioIncludedsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(cardioIncludedsErrorSelector);
  const data = useSelector(cardioIncludedsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getCardioIncludeds({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearCardioIncludedItems());
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

export default useCardioIncludedsData;
