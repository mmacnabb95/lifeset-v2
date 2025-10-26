/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitMediaKeysSelector, getHabitMediaKeys } from "./collection-slice"

export const useHabitMediaKeyCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habitmediakeys = useSelector(habitMediaKeysSelector);

    const loadHabitMediaKeys = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getHabitMediaKeys({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadHabitMediaKeys({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabitMediaKeys, initialised]);

    

    return {
        LoadMoreHabitMediaKeysButton: () => <Pressable testID={'load-more-habitmediakeys'} onPress={() => loadHabitMediaKeys({ offset: habitmediakeys?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habitmediakeys?.length && habitmediakeys?.length > loadMoreLimit ? habitmediakeys?.length - loadMoreLimit : 0
            loadHabitMediaKeys({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habitmediakeys,
        initialised,
        loadMore: () =>  loadHabitMediaKeys({ offset: habitmediakeys?.length, limit: loadMoreLimit }),
    };
};
