import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWorkoutExerciseSets,
  workoutExerciseSetsSelector,
  clearWorkoutExerciseSetItems,
  workoutExerciseSetsErrorSelector,
} from "./collection-slice";

const useWorkoutExerciseSetsData = (workoutdayexercise?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(workoutExerciseSetsErrorSelector);
  const data = useSelector(workoutExerciseSetsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getWorkoutExerciseSets({
        limit: 0,
        workoutdayexercise,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, workoutdayexercise]);

  const clearData = useCallback(() => {
    dispatch(clearWorkoutExerciseSetItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!workoutdayexercise) {
      return;
    }
    refresh();
  }, [refresh, workoutdayexercise]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useWorkoutExerciseSetsData;
