import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserWorkoutExerciseSets,
  userWorkoutExerciseSetsSelector,
  clearUserWorkoutExerciseSetItems,
  userWorkoutExerciseSetsErrorSelector,
} from "./collection-slice";

const useUserWorkoutExerciseSetsData = (userworkout?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(userWorkoutExerciseSetsErrorSelector);
  const data = useSelector(userWorkoutExerciseSetsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getUserWorkoutExerciseSets({
        limit: 0,
        userworkout,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, userworkout]);

  const clearData = useCallback(() => {
    dispatch(clearUserWorkoutExerciseSetItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!userworkout) {
      return;
    }
    refresh();
  }, [refresh, userworkout]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useUserWorkoutExerciseSetsData;
