/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { exerciseResourcesSelector, getExerciseResources } from "./collection-slice"

export const useExerciseResourceCollection = (exercise?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const exerciseresources = useSelector(exerciseResourcesSelector(exercise));
    

    const loadExerciseResources = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(exercise) await dispatch(getExerciseResources({ exercise: exercise, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, exercise]);

    useEffect(() => {
        if (!initialised && exercise) {
            loadExerciseResources({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadExerciseResources, initialised, exercise]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [exercise]);
    

    return {
        LoadMoreExerciseResourcesButton: () => <Pressable testID={'load-more-exerciseresources'} onPress={() => loadExerciseResources({ offset: exerciseresources?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = exerciseresources?.length && exerciseresources?.length > loadMoreLimit ? exerciseresources?.length - loadMoreLimit : 0
            loadExerciseResources({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: exerciseresources,
        initialised,
        loadMore: () =>  loadExerciseResources({ offset: exerciseresources?.length, limit: loadMoreLimit }),
    };
};
