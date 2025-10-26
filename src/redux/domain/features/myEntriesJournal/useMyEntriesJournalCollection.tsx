/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { myEntriesJournalsSelector, getMyEntriesJournals } from "./collection-slice"

export const useMyEntriesJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const myentriesjournals = useSelector(myEntriesJournalsSelector(user));
    

    const loadMyEntriesJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getMyEntriesJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadMyEntriesJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadMyEntriesJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreMyEntriesJournalsButton: () => <Pressable testID={'load-more-myentriesjournals'} onPress={() => loadMyEntriesJournals({ offset: myentriesjournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = myentriesjournals?.length && myentriesjournals?.length > loadMoreLimit ? myentriesjournals?.length - loadMoreLimit : 0
            loadMyEntriesJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: myentriesjournals,
        initialised,
        loadMore: () =>  loadMyEntriesJournals({ offset: myentriesjournals?.length, limit: loadMoreLimit }),
    };
};
