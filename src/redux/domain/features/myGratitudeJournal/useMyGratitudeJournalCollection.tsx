/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { myGratitudeJournalsSelector, getMyGratitudeJournals } from "./collection-slice"

export const useMyGratitudeJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const mygratitudejournals = useSelector(myGratitudeJournalsSelector(user));
    

    const loadMyGratitudeJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getMyGratitudeJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadMyGratitudeJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadMyGratitudeJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreMyGratitudeJournalsButton: () => <Pressable testID={'load-more-mygratitudejournals'} onPress={() => loadMyGratitudeJournals({ offset: mygratitudejournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = mygratitudejournals?.length && mygratitudejournals?.length > loadMoreLimit ? mygratitudejournals?.length - loadMoreLimit : 0
            loadMyGratitudeJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: mygratitudejournals,
        initialised,
        loadMore: () =>  loadMyGratitudeJournals({ offset: mygratitudejournals?.length, limit: loadMoreLimit }),
    };
};
