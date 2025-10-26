/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userHabitPackHabitsSelector, getUserHabitPackHabits } from "./collection-slice"

export const useUserHabitPackHabitCollection = (userhabitpack?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userhabitpackhabits = useSelector(userHabitPackHabitsSelector(userhabitpack));
    

    const loadUserHabitPackHabits = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(userhabitpack) await dispatch(getUserHabitPackHabits({ userhabitpack: userhabitpack, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, userhabitpack]);

    useEffect(() => {
        if (!initialised && userhabitpack) {
            loadUserHabitPackHabits({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserHabitPackHabits, initialised, userhabitpack]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [userhabitpack]);
    

    return {
        LoadMoreUserHabitPackHabitsButton: () => <Pressable testID={'load-more-userhabitpackhabits'} onPress={() => loadUserHabitPackHabits({ offset: userhabitpackhabits?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userhabitpackhabits?.length && userhabitpackhabits?.length > loadMoreLimit ? userhabitpackhabits?.length - loadMoreLimit : 0
            loadUserHabitPackHabits({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userhabitpackhabits,
        initialised,
        loadMore: () =>  loadUserHabitPackHabits({ offset: userhabitpackhabits?.length, limit: loadMoreLimit }),
    };
};
