/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { companyUsersSelector, getCompanyUsers } from "./collection-slice"

export const useCompanyUserCollection = (company?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const companyusers = useSelector(companyUsersSelector(company));
    

    const loadCompanyUsers = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(company) await dispatch(getCompanyUsers({ company: company, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, company]);

    useEffect(() => {
        if (!initialised && company) {
            loadCompanyUsers({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadCompanyUsers, initialised, company]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [company]);
    

    return {
        LoadMoreCompanyUsersButton: () => <Pressable testID={'load-more-companyusers'} onPress={() => loadCompanyUsers({ offset: companyusers?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = companyusers?.length && companyusers?.length > loadMoreLimit ? companyusers?.length - loadMoreLimit : 0
            loadCompanyUsers({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: companyusers,
        initialised,
        loadMore: () =>  loadCompanyUsers({ offset: companyusers?.length, limit: loadMoreLimit }),
    };
};
