/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { todoListJournalsSelector, getTodoListJournals } from "./collection-slice"

export const useTodoListJournalCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const todolistjournals = useSelector(todoListJournalsSelector(user));
    

    const loadTodoListJournals = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getTodoListJournals({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadTodoListJournals({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadTodoListJournals, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreTodoListJournalsButton: () => <Pressable testID={'load-more-todolistjournals'} onPress={() => loadTodoListJournals({ offset: todolistjournals?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = todolistjournals?.length && todolistjournals?.length > loadMoreLimit ? todolistjournals?.length - loadMoreLimit : 0
            loadTodoListJournals({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: todolistjournals,
        initialised,
        loadMore: () =>  loadTodoListJournals({ offset: todolistjournals?.length, limit: loadMoreLimit }),
    };
};
