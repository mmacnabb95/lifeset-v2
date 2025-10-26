/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { adminViewUsersSelector, getAdminViewUsers } from "./collection-slice"

export const useAdminViewUserCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const adminviewusers = useSelector(adminViewUsersSelector);

    const loadAdminViewUsers = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getAdminViewUsers({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadAdminViewUsers({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadAdminViewUsers, initialised]);

    

    return {
        LoadMoreAdminViewUsersButton: () => <Pressable testID={'load-more-adminviewusers'} onPress={() => loadAdminViewUsers({ offset: adminviewusers?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = adminviewusers?.length && adminviewusers?.length > loadMoreLimit ? adminviewusers?.length - loadMoreLimit : 0
            loadAdminViewUsers({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: adminviewusers,
        initialised,
        loadMore: () =>  loadAdminViewUsers({ offset: adminviewusers?.length, limit: loadMoreLimit }),
    };
};
