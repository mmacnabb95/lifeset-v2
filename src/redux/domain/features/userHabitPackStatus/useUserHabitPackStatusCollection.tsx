/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackStatussSelector, getUserHabitPackStatuss } from "./collection-slice"

export const useUserHabitPackStatusCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userhabitpackstatuss = useSelector(userHabitPackStatussSelector);

    const loadUserHabitPackStatuss = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getUserHabitPackStatuss({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadUserHabitPackStatuss({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserHabitPackStatuss, initialised]);

    

    return {
        LoadMoreUserHabitPackStatussButton: () => <Pressable testID={'load-more-userhabitpackstatuss'} onPress={() => loadUserHabitPackStatuss({ offset: userhabitpackstatuss?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userhabitpackstatuss?.length && userhabitpackstatuss?.length > loadMoreLimit ? userhabitpackstatuss?.length - loadMoreLimit : 0
            loadUserHabitPackStatuss({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userhabitpackstatuss,
        initialised,
        loadMore: () =>  loadUserHabitPackStatuss({ offset: userhabitpackstatuss?.length, limit: loadMoreLimit }),
    };
};
