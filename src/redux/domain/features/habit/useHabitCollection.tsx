/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitsSelector, getHabits } from "./collection-slice"

export const useHabitCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habits = useSelector(habitsSelector(user));
    

    const loadHabits = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getHabits({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadHabits({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabits, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreHabitsButton: () => <Pressable testID={'load-more-habits'} onPress={() => loadHabits({ offset: habits?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habits?.length && habits?.length > loadMoreLimit ? habits?.length - loadMoreLimit : 0
            loadHabits({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habits,
        initialised,
        loadMore: () =>  loadHabits({ offset: habits?.length, limit: loadMoreLimit }),
    };
};
