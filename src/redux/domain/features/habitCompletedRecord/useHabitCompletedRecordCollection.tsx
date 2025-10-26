/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { habitCompletedRecordsSelector, getHabitCompletedRecords } from "./collection-slice"

export const useHabitCompletedRecordCollection = (habit?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const habitcompletedrecords = useSelector(habitCompletedRecordsSelector(habit));
    

    const loadHabitCompletedRecords = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(habit) await dispatch(getHabitCompletedRecords({ habit: habit, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, habit]);

    useEffect(() => {
        if (!initialised && habit) {
            loadHabitCompletedRecords({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadHabitCompletedRecords, initialised, habit]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [habit]);
    

    return {
        LoadMoreHabitCompletedRecordsButton: () => <Pressable testID={'load-more-habitcompletedrecords'} onPress={() => loadHabitCompletedRecords({ offset: habitcompletedrecords?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = habitcompletedrecords?.length && habitcompletedrecords?.length > loadMoreLimit ? habitcompletedrecords?.length - loadMoreLimit : 0
            loadHabitCompletedRecords({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: habitcompletedrecords,
        initialised,
        loadMore: () =>  loadHabitCompletedRecords({ offset: habitcompletedrecords?.length, limit: loadMoreLimit }),
    };
};
