import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBenefits,
  benefitsSelector,
  clearBenefitItems,
  benefitsErrorSelector,
} from "./collection-slice";

const useBenefitsData = (company?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(benefitsErrorSelector);
  const data = useSelector(benefitsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getBenefits({
        limit: 0,
        company,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, company]);

  const clearData = useCallback(() => {
    dispatch(clearBenefitItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!company) {
      return;
    }
    refresh();
  }, [refresh, company]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useBenefitsData;
