import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLanguages,
  languagesSelector,
  clearLanguageItems,
  languagesErrorSelector,
} from "./collection-slice";

const useLanguagesData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(languagesErrorSelector);
  const data = useSelector(languagesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getLanguages({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearLanguageItems());
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

export default useLanguagesData;
