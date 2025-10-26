/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { exercisesSelector, getExercises } from "./collection-slice"

export const useExerciseCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const exercises = useSelector(exercisesSelector);

    const loadExercises = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getExercises({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadExercises({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadExercises, initialised]);

    

    return {
        LoadMoreExercisesButton: () => <Pressable testID={'load-more-exercises'} onPress={() => loadExercises({ offset: exercises?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = exercises?.length && exercises?.length > loadMoreLimit ? exercises?.length - loadMoreLimit : 0
            loadExercises({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: exercises,
        initialised,
        loadMore: () =>  loadExercises({ offset: exercises?.length, limit: loadMoreLimit }),
    };
};
