/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { journalsSelector, getJournals } from "./collection-slice"

export const useJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const journals = useSelector(journalsSelector(user));
    

    const loadJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreJournalsButton: () => <Pressable testID={'load-more-journals'} onPress={() => loadJournals({ offset: journals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = journals?.length && journals?.length > loadMoreLimit ? journals?.length - loadMoreLimit : 0
            loadJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: journals,
        initialised,
        loadMore: () =>  loadJournals({ offset: journals?.length, limit: loadMoreLimit }),
    };
};
