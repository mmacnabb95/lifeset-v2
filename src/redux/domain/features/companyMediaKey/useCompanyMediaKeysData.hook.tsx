import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCompanyMediaKeys,
  companyMediaKeysSelector,
  clearCompanyMediaKeyItems,
  companyMediaKeysErrorSelector,
} from "./collection-slice";

const useCompanyMediaKeysData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(companyMediaKeysErrorSelector);
  const data = useSelector(companyMediaKeysSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getCompanyMediaKeys({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearCompanyMediaKeyItems());
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

export default useCompanyMediaKeysData;
