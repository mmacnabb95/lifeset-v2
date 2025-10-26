/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { allTimeStreaksSelector, getAllTimeStreaks } from "./collection-slice"

export const useAllTimeStreakCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const alltimestreaks = useSelector(allTimeStreaksSelector(user));
    

    const loadAllTimeStreaks = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getAllTimeStreaks({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadAllTimeStreaks({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadAllTimeStreaks, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreAllTimeStreaksButton: () => <Pressable testID={'load-more-alltimestreaks'} onPress={() => loadAllTimeStreaks({ offset: alltimestreaks?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = alltimestreaks?.length && alltimestreaks?.length > loadMoreLimit ? alltimestreaks?.length - loadMoreLimit : 0
            loadAllTimeStreaks({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: alltimestreaks,
        initialised,
        loadMore: () =>  loadAllTimeStreaks({ offset: alltimestreaks?.length, limit: loadMoreLimit }),
    };
};
