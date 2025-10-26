/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { workoutExerciseSetsSelector, getWorkoutExerciseSets } from "./collection-slice"

export const useWorkoutExerciseSetCollection = (workoutdayexercise?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const workoutexercisesets = useSelector(workoutExerciseSetsSelector(workoutdayexercise));
    

    const loadWorkoutExerciseSets = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(workoutdayexercise) await dispatch(getWorkoutExerciseSets({ workoutdayexercise: workoutdayexercise, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, workoutdayexercise]);

    useEffect(() => {
        if (!initialised && workoutdayexercise) {
            loadWorkoutExerciseSets({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadWorkoutExerciseSets, initialised, workoutdayexercise]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [workoutdayexercise]);
    

    return {
        LoadMoreWorkoutExerciseSetsButton: () => <Pressable testID={'load-more-workoutexercisesets'} onPress={() => loadWorkoutExerciseSets({ offset: workoutexercisesets?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = workoutexercisesets?.length && workoutexercisesets?.length > loadMoreLimit ? workoutexercisesets?.length - loadMoreLimit : 0
            loadWorkoutExerciseSets({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: workoutexercisesets,
        initialised,
        loadMore: () =>  loadWorkoutExerciseSets({ offset: workoutexercisesets?.length, limit: loadMoreLimit }),
    };
};
