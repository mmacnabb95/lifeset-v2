/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { checkInJournalsSelector, getCheckInJournals } from "./collection-slice"

export const useCheckInJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const checkinjournals = useSelector(checkInJournalsSelector(user));
    

    const loadCheckInJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getCheckInJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadCheckInJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadCheckInJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreCheckInJournalsButton: () => <Pressable testID={'load-more-checkinjournals'} onPress={() => loadCheckInJournals({ offset: checkinjournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = checkinjournals?.length && checkinjournals?.length > loadMoreLimit ? checkinjournals?.length - loadMoreLimit : 0
            loadCheckInJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: checkinjournals,
        initialised,
        loadMore: () =>  loadCheckInJournals({ offset: checkinjournals?.length, limit: loadMoreLimit }),
    };
};
