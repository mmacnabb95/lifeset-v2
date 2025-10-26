import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkoutDayExercises,
  workoutDayExercisesSelector,
  clearWorkoutDayExerciseItems,
  workoutDayExercisesErrorSelector,
} from "./collection-slice";

const useWorkoutDayExercisesData = (workoutday?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(workoutDayExercisesErrorSelector);
  const data = useSelector(workoutDayExercisesSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getWorkoutDayExercises({
        limit: 0,
        workoutday,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, workoutday]);

  const clearData = useCallback(() => {
    dispatch(clearWorkoutDayExerciseItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!workoutday) {
      return;
    }
    refresh();
  }, [refresh, workoutday]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useWorkoutDayExercisesData;
