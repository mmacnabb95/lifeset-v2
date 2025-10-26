import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserWorkoutDayExercises,
  userWorkoutDayExercisesSelector,
  clearUserWorkoutDayExerciseItems,
  userWorkoutDayExercisesErrorSelector,
} from "./collection-slice";

const useUserWorkoutDayExercisesData = (userworkout?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(userWorkoutDayExercisesErrorSelector);
  const data = useSelector(userWorkoutDayExercisesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getUserWorkoutDayExercises({
        limit: 0,
        userworkout,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, userworkout]);

  const clearData = useCallback(() => {
    dispatch(clearUserWorkoutDayExerciseItems());
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

export default useUserWorkoutDayExercisesData;
