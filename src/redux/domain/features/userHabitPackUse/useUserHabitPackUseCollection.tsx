/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackUsesSelector, getUserHabitPackUses } from "./collection-slice"

export const useUserHabitPackUseCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userhabitpackuses = useSelector(userHabitPackUsesSelector(user));
    

    const loadUserHabitPackUses = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getUserHabitPackUses({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadUserHabitPackUses({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserHabitPackUses, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreUserHabitPackUsesButton: () => <Pressable testID={'load-more-userhabitpackuses'} onPress={() => loadUserHabitPackUses({ offset: userhabitpackuses?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userhabitpackuses?.length && userhabitpackuses?.length > loadMoreLimit ? userhabitpackuses?.length - loadMoreLimit : 0
            loadUserHabitPackUses({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userhabitpackuses,
        initialised,
        loadMore: () =>  loadUserHabitPackUses({ offset: userhabitpackuses?.length, limit: loadMoreLimit }),
    };
};
