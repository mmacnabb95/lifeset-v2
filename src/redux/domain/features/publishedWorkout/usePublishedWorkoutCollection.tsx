/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { publishedWorkoutsSelector, getPublishedWorkouts } from "./collection-slice"

export const usePublishedWorkoutCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const publishedworkouts = useSelector(publishedWorkoutsSelector);

    const loadPublishedWorkouts = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getPublishedWorkouts({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadPublishedWorkouts({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadPublishedWorkouts, initialised]);

    

    return {
        LoadMorePublishedWorkoutsButton: () => <Pressable testID={'load-more-publishedworkouts'} onPress={() => loadPublishedWorkouts({ offset: publishedworkouts?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = publishedworkouts?.length && publishedworkouts?.length > loadMoreLimit ? publishedworkouts?.length - loadMoreLimit : 0
            loadPublishedWorkouts({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: publishedworkouts,
        initialised,
        loadMore: () =>  loadPublishedWorkouts({ offset: publishedworkouts?.length, limit: loadMoreLimit }),
    };
};
