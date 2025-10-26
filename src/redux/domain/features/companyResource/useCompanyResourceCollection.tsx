/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { companyResourcesSelector, getCompanyResources } from "./collection-slice"

export const useCompanyResourceCollection = (company?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const companyresources = useSelector(companyResourcesSelector(company));
    

    const loadCompanyResources = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(company) await dispatch(getCompanyResources({ company: company, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, company]);

    useEffect(() => {
        if (!initialised && company) {
            loadCompanyResources({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadCompanyResources, initialised, company]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [company]);
    

    return {
        LoadMoreCompanyResourcesButton: () => <Pressable testID={'load-more-companyresources'} onPress={() => loadCompanyResources({ offset: companyresources?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = companyresources?.length && companyresources?.length > loadMoreLimit ? companyresources?.length - loadMoreLimit : 0
            loadCompanyResources({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: companyresources,
        initialised,
        loadMore: () =>  loadCompanyResources({ offset: companyresources?.length, limit: loadMoreLimit }),
    };
};
