/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { workoutDayExercisesSelector, getWorkoutDayExercises } from "./collection-slice"

export const useWorkoutDayExerciseCollection = (workoutday?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const workoutdayexercises = useSelector(workoutDayExercisesSelector(workoutday));
    

    const loadWorkoutDayExercises = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(workoutday) await dispatch(getWorkoutDayExercises({ workoutday: workoutday, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, workoutday]);

    useEffect(() => {
        if (!initialised && workoutday) {
            loadWorkoutDayExercises({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadWorkoutDayExercises, initialised, workoutday]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [workoutday]);
    

    return {
        LoadMoreWorkoutDayExercisesButton: () => <Pressable testID={'load-more-workoutdayexercises'} onPress={() => loadWorkoutDayExercises({ offset: workoutdayexercises?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = workoutdayexercises?.length && workoutdayexercises?.length > loadMoreLimit ? workoutdayexercises?.length - loadMoreLimit : 0
            loadWorkoutDayExercises({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: workoutdayexercises,
        initialised,
        loadMore: () =>  loadWorkoutDayExercises({ offset: workoutdayexercises?.length, limit: loadMoreLimit }),
    };
};
