/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userWorkoutExerciseSetsSelector, getUserWorkoutExerciseSets } from "./collection-slice"

export const useUserWorkoutExerciseSetCollection = (userworkout?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userworkoutexercisesets = useSelector(userWorkoutExerciseSetsSelector(userworkout));
    

    const loadUserWorkoutExerciseSets = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(userworkout) await dispatch(getUserWorkoutExerciseSets({ userworkout: userworkout, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, userworkout]);

    useEffect(() => {
        if (!initialised && userworkout) {
            loadUserWorkoutExerciseSets({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserWorkoutExerciseSets, initialised, userworkout]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [userworkout]);
    

    return {
        LoadMoreUserWorkoutExerciseSetsButton: () => <Pressable testID={'load-more-userworkoutexercisesets'} onPress={() => loadUserWorkoutExerciseSets({ offset: userworkoutexercisesets?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userworkoutexercisesets?.length && userworkoutexercisesets?.length > loadMoreLimit ? userworkoutexercisesets?.length - loadMoreLimit : 0
            loadUserWorkoutExerciseSets({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userworkoutexercisesets,
        initialised,
        loadMore: () =>  loadUserWorkoutExerciseSets({ offset: userworkoutexercisesets?.length, limit: loadMoreLimit }),
    };
};
