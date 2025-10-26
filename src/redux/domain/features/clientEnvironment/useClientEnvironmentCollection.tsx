/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clientEnvironmentsSelector, getClientEnvironments } from "./collection-slice"

export const useClientEnvironmentCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const clientenvironments = useSelector(clientEnvironmentsSelector);

    const loadClientEnvironments = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getClientEnvironments({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadClientEnvironments({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadClientEnvironments, initialised]);

    

    return {
        LoadMoreClientEnvironmentsButton: () => <Pressable testID={'load-more-clientenvironments'} onPress={() => loadClientEnvironments({ offset: clientenvironments?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = clientenvironments?.length && clientenvironments?.length > loadMoreLimit ? clientenvironments?.length - loadMoreLimit : 0
            loadClientEnvironments({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: clientenvironments,
        initialised,
        loadMore: () =>  loadClientEnvironments({ offset: clientenvironments?.length, limit: loadMoreLimit }),
    };
};
