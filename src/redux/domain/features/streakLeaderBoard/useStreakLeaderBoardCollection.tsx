/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { streakLeaderBoardsSelector, getStreakLeaderBoards } from "./collection-slice"

export const useStreakLeaderBoardCollection = (company?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const streakleaderboards = useSelector(streakLeaderBoardsSelector(company));
    

    const loadStreakLeaderBoards = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(company) await dispatch(getStreakLeaderBoards({ company: company, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, company]);

    useEffect(() => {
        if (!initialised && company) {
            loadStreakLeaderBoards({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadStreakLeaderBoards, initialised, company]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [company]);
    

    return {
        LoadMoreStreakLeaderBoardsButton: () => <Pressable testID={'load-more-streakleaderboards'} onPress={() => loadStreakLeaderBoards({ offset: streakleaderboards?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = streakleaderboards?.length && streakleaderboards?.length > loadMoreLimit ? streakleaderboards?.length - loadMoreLimit : 0
            loadStreakLeaderBoards({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: streakleaderboards,
        initialised,
        loadMore: () =>  loadStreakLeaderBoards({ offset: streakleaderboards?.length, limit: loadMoreLimit }),
    };
};
