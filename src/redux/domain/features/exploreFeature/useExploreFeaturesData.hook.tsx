import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getExploreFeatures,
  exploreFeaturesSelector,
  clearExploreFeatureItems,
  exploreFeaturesErrorSelector,
} from "./collection-slice";

const useExploreFeaturesData = (user?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(exploreFeaturesErrorSelector);
  const data = useSelector(exploreFeaturesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getExploreFeatures({
        limit: 0,
        user,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, user]);

  const clearData = useCallback(() => {
    dispatch(clearExploreFeatureItems());
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

export default useExploreFeaturesData;
