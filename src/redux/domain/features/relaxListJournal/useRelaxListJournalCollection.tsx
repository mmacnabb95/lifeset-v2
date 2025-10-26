/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { relaxListJournalsSelector, getRelaxListJournals } from "./collection-slice"

export const useRelaxListJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const relaxlistjournals = useSelector(relaxListJournalsSelector(user));
    

    const loadRelaxListJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getRelaxListJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadRelaxListJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadRelaxListJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreRelaxListJournalsButton: () => <Pressable testID={'load-more-relaxlistjournals'} onPress={() => loadRelaxListJournals({ offset: relaxlistjournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = relaxlistjournals?.length && relaxlistjournals?.length > loadMoreLimit ? relaxlistjournals?.length - loadMoreLimit : 0
            loadRelaxListJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: relaxlistjournals,
        initialised,
        loadMore: () =>  loadRelaxListJournals({ offset: relaxlistjournals?.length, limit: loadMoreLimit }),
    };
};
