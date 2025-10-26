/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitPacksSelector, getHabitPacks } from "./collection-slice"

export const useHabitPackCollection = (company?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habitpacks = useSelector(habitPacksSelector(company));
    

    const loadHabitPacks = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(company) await dispatch(getHabitPacks({ company: company, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, company]);

    useEffect(() => {
        if (!initialised && company) {
            loadHabitPacks({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabitPacks, initialised, company]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [company]);
    

    return {
        LoadMoreHabitPacksButton: () => <Pressable testID={'load-more-habitpacks'} onPress={() => loadHabitPacks({ offset: habitpacks?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habitpacks?.length && habitpacks?.length > loadMoreLimit ? habitpacks?.length - loadMoreLimit : 0
            loadHabitPacks({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habitpacks,
        initialised,
        loadMore: () =>  loadHabitPacks({ offset: habitpacks?.length, limit: loadMoreLimit }),
    };
};
