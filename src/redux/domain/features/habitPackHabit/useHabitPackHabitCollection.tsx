/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitPackHabitsSelector, getHabitPackHabits } from "./collection-slice"

export const useHabitPackHabitCollection = (habitpack?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habitpackhabits = useSelector(habitPackHabitsSelector(habitpack));
    

    const loadHabitPackHabits = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(habitpack) await dispatch(getHabitPackHabits({ habitpack: habitpack, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, habitpack]);

    useEffect(() => {
        if (!initialised && habitpack) {
            loadHabitPackHabits({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabitPackHabits, initialised, habitpack]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [habitpack]);
    

    return {
        LoadMoreHabitPackHabitsButton: () => <Pressable testID={'load-more-habitpackhabits'} onPress={() => loadHabitPackHabits({ offset: habitpackhabits?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habitpackhabits?.length && habitpackhabits?.length > loadMoreLimit ? habitpackhabits?.length - loadMoreLimit : 0
            loadHabitPackHabits({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habitpackhabits,
        initialised,
        loadMore: () =>  loadHabitPackHabits({ offset: habitpackhabits?.length, limit: loadMoreLimit }),
    };
};
