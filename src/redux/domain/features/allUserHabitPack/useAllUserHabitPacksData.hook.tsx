import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUserHabitPacks,
  allUserHabitPacksSelector,
  clearAllUserHabitPackItems,
  allUserHabitPacksErrorSelector,
} from "./collection-slice";

const useAllUserHabitPacksData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(allUserHabitPacksErrorSelector);
  const data = useSelector(allUserHabitPacksSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getAllUserHabitPacks({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearAllUserHabitPackItems());
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

export default useAllUserHabitPacksData;
