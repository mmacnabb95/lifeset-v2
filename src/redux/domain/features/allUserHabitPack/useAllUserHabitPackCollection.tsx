/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { allUserHabitPacksSelector, getAllUserHabitPacks } from "./collection-slice"

export const useAllUserHabitPackCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const alluserhabitpacks = useSelector(allUserHabitPacksSelector);

    const loadAllUserHabitPacks = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getAllUserHabitPacks({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadAllUserHabitPacks({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadAllUserHabitPacks, initialised]);

    

    return {
        LoadMoreAllUserHabitPacksButton: () => <Pressable testID={'load-more-alluserhabitpacks'} onPress={() => loadAllUserHabitPacks({ offset: alluserhabitpacks?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = alluserhabitpacks?.length && alluserhabitpacks?.length > loadMoreLimit ? alluserhabitpacks?.length - loadMoreLimit : 0
            loadAllUserHabitPacks({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: alluserhabitpacks,
        initialised,
        loadMore: () =>  loadAllUserHabitPacks({ offset: alluserhabitpacks?.length, limit: loadMoreLimit }),
    };
};
