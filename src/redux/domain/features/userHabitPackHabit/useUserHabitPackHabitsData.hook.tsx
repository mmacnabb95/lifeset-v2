import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserHabitPackHabits,
  userHabitPackHabitsSelector,
  clearUserHabitPackHabitItems,
  userHabitPackHabitsErrorSelector,
} from "./collection-slice";

const useUserHabitPackHabitsData = (userhabitpack?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(userHabitPackHabitsErrorSelector);
  const data = useSelector(userHabitPackHabitsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getUserHabitPackHabits({
        limit: 0,
        userhabitpack,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, userhabitpack]);

  const clearData = useCallback(() => {
    dispatch(clearUserHabitPackHabitItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!userhabitpack) {
      return;
    }
    refresh();
  }, [refresh, userhabitpack]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useUserHabitPackHabitsData;
