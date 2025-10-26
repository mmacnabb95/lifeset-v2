/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { remindersSelector, getReminders } from "./collection-slice"

export const useReminderCollection = (habit?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const reminders = useSelector(remindersSelector(habit));
    

    const loadReminders = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(habit) await dispatch(getReminders({ habit: habit, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, habit]);

    useEffect(() => {
        if (!initialised && habit) {
            loadReminders({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadReminders, initialised, habit]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [habit]);
    

    return {
        LoadMoreRemindersButton: () => <Pressable testID={'load-more-reminders'} onPress={() => loadReminders({ offset: reminders?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = reminders?.length && reminders?.length > loadMoreLimit ? reminders?.length - loadMoreLimit : 0
            loadReminders({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: reminders,
        initialised,
        loadMore: () =>  loadReminders({ offset: reminders?.length, limit: loadMoreLimit }),
    };
};
