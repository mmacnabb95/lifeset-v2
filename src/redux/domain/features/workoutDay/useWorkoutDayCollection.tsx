/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { workoutDaysSelector, getWorkoutDays } from "./collection-slice"

export const useWorkoutDayCollection = (workout?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const workoutdays = useSelector(workoutDaysSelector(workout));
    

    const loadWorkoutDays = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(workout) await dispatch(getWorkoutDays({ workout: workout, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, workout]);

    useEffect(() => {
        if (!initialised && workout) {
            loadWorkoutDays({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadWorkoutDays, initialised, workout]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [workout]);
    

    return {
        LoadMoreWorkoutDaysButton: () => <Pressable testID={'load-more-workoutdays'} onPress={() => loadWorkoutDays({ offset: workoutdays?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = workoutdays?.length && workoutdays?.length > loadMoreLimit ? workoutdays?.length - loadMoreLimit : 0
            loadWorkoutDays({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: workoutdays,
        initialised,
        loadMore: () =>  loadWorkoutDays({ offset: workoutdays?.length, limit: loadMoreLimit }),
    };
};
