/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { publishedUserHabitPacksSelector, getPublishedUserHabitPacks } from "./collection-slice"

export const usePublishedUserHabitPackCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const publisheduserhabitpacks = useSelector(publishedUserHabitPacksSelector);

    const loadPublishedUserHabitPacks = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getPublishedUserHabitPacks({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadPublishedUserHabitPacks({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadPublishedUserHabitPacks, initialised]);

    

    return {
        LoadMorePublishedUserHabitPacksButton: () => <Pressable testID={'load-more-publisheduserhabitpacks'} onPress={() => loadPublishedUserHabitPacks({ offset: publisheduserhabitpacks?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = publisheduserhabitpacks?.length && publisheduserhabitpacks?.length > loadMoreLimit ? publisheduserhabitpacks?.length - loadMoreLimit : 0
            loadPublishedUserHabitPacks({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: publisheduserhabitpacks,
        initialised,
        loadMore: () =>  loadPublishedUserHabitPacks({ offset: publisheduserhabitpacks?.length, limit: loadMoreLimit }),
    };
};
