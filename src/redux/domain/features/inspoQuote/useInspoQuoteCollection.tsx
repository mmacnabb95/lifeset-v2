/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { inspoQuotesSelector, getInspoQuotes } from "./collection-slice"

export const useInspoQuoteCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const inspoquotes = useSelector(inspoQuotesSelector);

    const loadInspoQuotes = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getInspoQuotes({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadInspoQuotes({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadInspoQuotes, initialised]);

    

    return {
        LoadMoreInspoQuotesButton: () => <Pressable testID={'load-more-inspoquotes'} onPress={() => loadInspoQuotes({ offset: inspoquotes?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = inspoquotes?.length && inspoquotes?.length > loadMoreLimit ? inspoquotes?.length - loadMoreLimit : 0
            loadInspoQuotes({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: inspoquotes,
        initialised,
        loadMore: () =>  loadInspoQuotes({ offset: inspoquotes?.length, limit: loadMoreLimit }),
    };
};
