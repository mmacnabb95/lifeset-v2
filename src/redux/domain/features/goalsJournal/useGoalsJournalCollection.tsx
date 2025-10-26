/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { goalsJournalsSelector, getGoalsJournals } from "./collection-slice"

export const useGoalsJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const goalsjournals = useSelector(goalsJournalsSelector(user));
    

    const loadGoalsJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getGoalsJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadGoalsJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadGoalsJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreGoalsJournalsButton: () => <Pressable testID={'load-more-goalsjournals'} onPress={() => loadGoalsJournals({ offset: goalsjournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = goalsjournals?.length && goalsjournals?.length > loadMoreLimit ? goalsjournals?.length - loadMoreLimit : 0
            loadGoalsJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: goalsjournals,
        initialised,
        loadMore: () =>  loadGoalsJournals({ offset: goalsjournals?.length, limit: loadMoreLimit }),
    };
};
