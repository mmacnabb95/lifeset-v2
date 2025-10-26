/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackStreakLeaderboardsSelector, getUserHabitPackStreakLeaderboards } from "./collection-slice"

export const useUserHabitPackStreakLeaderboardCollection = (userhabitpack?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userhabitpackstreakleaderboards = useSelector(userHabitPackStreakLeaderboardsSelector(userhabitpack));
    

    const loadUserHabitPackStreakLeaderboards = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(userhabitpack) await dispatch(getUserHabitPackStreakLeaderboards({ userhabitpack: userhabitpack, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, userhabitpack]);

    useEffect(() => {
        if (!initialised && userhabitpack) {
            loadUserHabitPackStreakLeaderboards({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserHabitPackStreakLeaderboards, initialised, userhabitpack]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [userhabitpack]);
    

    return {
        LoadMoreUserHabitPackStreakLeaderboardsButton: () => <Pressable testID={'load-more-userhabitpackstreakleaderboards'} onPress={() => loadUserHabitPackStreakLeaderboards({ offset: userhabitpackstreakleaderboards?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userhabitpackstreakleaderboards?.length && userhabitpackstreakleaderboards?.length > loadMoreLimit ? userhabitpackstreakleaderboards?.length - loadMoreLimit : 0
            loadUserHabitPackStreakLeaderboards({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userhabitpackstreakleaderboards,
        initialised,
        loadMore: () =>  loadUserHabitPackStreakLeaderboards({ offset: userhabitpackstreakleaderboards?.length, limit: loadMoreLimit }),
    };
};
