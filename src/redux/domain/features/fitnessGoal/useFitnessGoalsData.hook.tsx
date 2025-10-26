import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFitnessGoals,
  fitnessGoalsSelector,
  clearFitnessGoalItems,
  fitnessGoalsErrorSelector,
} from "./collection-slice";

const useFitnessGoalsData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(fitnessGoalsErrorSelector);
  const data = useSelector(fitnessGoalsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getFitnessGoals({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearFitnessGoalItems());
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

export default useFitnessGoalsData;
