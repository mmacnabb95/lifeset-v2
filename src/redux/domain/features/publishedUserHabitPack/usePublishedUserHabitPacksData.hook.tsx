import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPublishedUserHabitPacks,
  publishedUserHabitPacksSelector,
  clearPublishedUserHabitPackItems,
  publishedUserHabitPacksErrorSelector,
} from "./collection-slice";

const usePublishedUserHabitPacksData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(publishedUserHabitPacksErrorSelector);
  const data = useSelector(publishedUserHabitPacksSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getPublishedUserHabitPacks({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearPublishedUserHabitPackItems());
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

export default usePublishedUserHabitPacksData;
