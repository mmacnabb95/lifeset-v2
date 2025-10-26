/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { workoutsSelector, getWorkouts } from "./collection-slice"

export const useWorkoutCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const workouts = useSelector(workoutsSelector);

    const loadWorkouts = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getWorkouts({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadWorkouts({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadWorkouts, initialised]);

    

    return {
        LoadMoreWorkoutsButton: () => <Pressable testID={'load-more-workouts'} onPress={() => loadWorkouts({ offset: workouts?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = workouts?.length && workouts?.length > loadMoreLimit ? workouts?.length - loadMoreLimit : 0
            loadWorkouts({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: workouts,
        initialised,
        loadMore: () =>  loadWorkouts({ offset: workouts?.length, limit: loadMoreLimit }),
    };
};
