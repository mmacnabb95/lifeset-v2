/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPacksSelector, getUserHabitPacks } from "./collection-slice"

export const useUserHabitPackCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userhabitpacks = useSelector(userHabitPacksSelector(user));
    

    const loadUserHabitPacks = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getUserHabitPacks({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadUserHabitPacks({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserHabitPacks, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreUserHabitPacksButton: () => <Pressable testID={'load-more-userhabitpacks'} onPress={() => loadUserHabitPacks({ offset: userhabitpacks?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userhabitpacks?.length && userhabitpacks?.length > loadMoreLimit ? userhabitpacks?.length - loadMoreLimit : 0
            loadUserHabitPacks({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userhabitpacks,
        initialised,
        loadMore: () =>  loadUserHabitPacks({ offset: userhabitpacks?.length, limit: loadMoreLimit }),
    };
};
