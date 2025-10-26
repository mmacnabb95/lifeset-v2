/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { companyMediaKeysSelector, getCompanyMediaKeys } from "./collection-slice"

export const useCompanyMediaKeyCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const companymediakeys = useSelector(companyMediaKeysSelector);

    const loadCompanyMediaKeys = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getCompanyMediaKeys({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadCompanyMediaKeys({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadCompanyMediaKeys, initialised]);

    

    return {
        LoadMoreCompanyMediaKeysButton: () => <Pressable testID={'load-more-companymediakeys'} onPress={() => loadCompanyMediaKeys({ offset: companymediakeys?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = companymediakeys?.length && companymediakeys?.length > loadMoreLimit ? companymediakeys?.length - loadMoreLimit : 0
            loadCompanyMediaKeys({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: companymediakeys,
        initialised,
        loadMore: () =>  loadCompanyMediaKeys({ offset: companymediakeys?.length, limit: loadMoreLimit }),
    };
};
