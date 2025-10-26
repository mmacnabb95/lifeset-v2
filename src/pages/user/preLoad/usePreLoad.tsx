import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCardioIncludeds } from "src/redux/domain/features/cardioIncluded/collection-slice";
import { getCurrentFitnessLevels } from "src/redux/domain/features/currentFitnessLevel/collection-slice";
import { getDaysPerWeeks } from "src/redux/domain/features/daysPerWeek/collection-slice";
import { getFitnessGoals } from "src/redux/domain/features/fitnessGoal/collection-slice";
import { getWorkoutLocations } from "src/redux/domain/features/workoutLocation/collection-slice";
import { getWorkoutSessionLengths } from "src/redux/domain/features/workoutSessionLength/collection-slice";

/**Pre load any data needed in tha app in this hook */
export const usePreLoad = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCardioIncludeds());
    dispatch(getCurrentFitnessLevels());
    dispatch(getDaysPerWeeks());
    dispatch(getFitnessGoals());
    dispatch(getWorkoutLocations());
    dispatch(getWorkoutSessionLengths());
  }, [dispatch]);
};
