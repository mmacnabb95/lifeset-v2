/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { randomInspoQuotesSelector, getRandomInspoQuotes } from "./collection-slice"

export const useRandomInspoQuoteCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const randominspoquotes = useSelector(randomInspoQuotesSelector);

    const loadRandomInspoQuotes = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getRandomInspoQuotes({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadRandomInspoQuotes({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadRandomInspoQuotes, initialised]);

    

    return {
        LoadMoreRandomInspoQuotesButton: () => <Pressable testID={'load-more-randominspoquotes'} onPress={() => loadRandomInspoQuotes({ offset: randominspoquotes?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = randominspoquotes?.length && randominspoquotes?.length > loadMoreLimit ? randominspoquotes?.length - loadMoreLimit : 0
            loadRandomInspoQuotes({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: randominspoquotes,
        initialised,
        loadMore: () =>  loadRandomInspoQuotes({ offset: randominspoquotes?.length, limit: loadMoreLimit }),
    };
};
