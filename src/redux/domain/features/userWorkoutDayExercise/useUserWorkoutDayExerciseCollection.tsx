/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userWorkoutDayExercisesSelector, getUserWorkoutDayExercises } from "./collection-slice"

export const useUserWorkoutDayExerciseCollection = (userworkout?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userworkoutdayexercises = useSelector(userWorkoutDayExercisesSelector(userworkout));
    

    const loadUserWorkoutDayExercises = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(userworkout) await dispatch(getUserWorkoutDayExercises({ userworkout: userworkout, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, userworkout]);

    useEffect(() => {
        if (!initialised && userworkout) {
            loadUserWorkoutDayExercises({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserWorkoutDayExercises, initialised, userworkout]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [userworkout]);
    

    return {
        LoadMoreUserWorkoutDayExercisesButton: () => <Pressable testID={'load-more-userworkoutdayexercises'} onPress={() => loadUserWorkoutDayExercises({ offset: userworkoutdayexercises?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userworkoutdayexercises?.length && userworkoutdayexercises?.length > loadMoreLimit ? userworkoutdayexercises?.length - loadMoreLimit : 0
            loadUserWorkoutDayExercises({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userworkoutdayexercises,
        initialised,
        loadMore: () =>  loadUserWorkoutDayExercises({ offset: userworkoutdayexercises?.length, limit: loadMoreLimit }),
    };
};
