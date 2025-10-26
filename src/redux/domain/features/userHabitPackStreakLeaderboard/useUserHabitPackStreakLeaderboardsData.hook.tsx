import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserHabitPackStreakLeaderboards,
  userHabitPackStreakLeaderboardsSelector,
  clearUserHabitPackStreakLeaderboardItems,
  userHabitPackStreakLeaderboardsErrorSelector,
} from "./collection-slice";

const useUserHabitPackStreakLeaderboardsData = (userhabitpack?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(userHabitPackStreakLeaderboardsErrorSelector);
  const data = useSelector(userHabitPackStreakLeaderboardsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getUserHabitPackStreakLeaderboards({
        limit: 0,
        userhabitpack,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, userhabitpack]);

  const clearData = useCallback(() => {
    dispatch(clearUserHabitPackStreakLeaderboardItems());
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

export default useUserHabitPackStreakLeaderboardsData;
