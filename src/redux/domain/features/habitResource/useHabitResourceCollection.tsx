/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitResourcesSelector, getHabitResources } from "./collection-slice"

export const useHabitResourceCollection = (habit?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habitresources = useSelector(habitResourcesSelector(habit));
    

    const loadHabitResources = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(habit) await dispatch(getHabitResources({ habit: habit, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, habit]);

    useEffect(() => {
        if (!initialised && habit) {
            loadHabitResources({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabitResources, initialised, habit]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [habit]);
    

    return {
        LoadMoreHabitResourcesButton: () => <Pressable testID={'load-more-habitresources'} onPress={() => loadHabitResources({ offset: habitresources?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habitresources?.length && habitresources?.length > loadMoreLimit ? habitresources?.length - loadMoreLimit : 0
            loadHabitResources({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habitresources,
        initialised,
        loadMore: () =>  loadHabitResources({ offset: habitresources?.length, limit: loadMoreLimit }),
    };
};
