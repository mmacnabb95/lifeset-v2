/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { exerciseMediaKeysSelector, getExerciseMediaKeys } from "./collection-slice"

export const useExerciseMediaKeyCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const exercisemediakeys = useSelector(exerciseMediaKeysSelector);

    const loadExerciseMediaKeys = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getExerciseMediaKeys({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadExerciseMediaKeys({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadExerciseMediaKeys, initialised]);

    

    return {
        LoadMoreExerciseMediaKeysButton: () => <Pressable testID={'load-more-exercisemediakeys'} onPress={() => loadExerciseMediaKeys({ offset: exercisemediakeys?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = exercisemediakeys?.length && exercisemediakeys?.length > loadMoreLimit ? exercisemediakeys?.length - loadMoreLimit : 0
            loadExerciseMediaKeys({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: exercisemediakeys,
        initialised,
        loadMore: () =>  loadExerciseMediaKeys({ offset: exercisemediakeys?.length, limit: loadMoreLimit }),
    };
};
