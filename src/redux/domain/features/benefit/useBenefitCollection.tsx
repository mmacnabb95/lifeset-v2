/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { benefitsSelector, getBenefits } from "./collection-slice"

export const useBenefitCollection = (company?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const benefits = useSelector(benefitsSelector(company));
    

    const loadBenefits = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(company) await dispatch(getBenefits({ company: company, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, company]);

    useEffect(() => {
        if (!initialised && company) {
            loadBenefits({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadBenefits, initialised, company]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [company]);
    

    return {
        LoadMoreBenefitsButton: () => <Pressable testID={'load-more-benefits'} onPress={() => loadBenefits({ offset: benefits?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = benefits?.length && benefits?.length > loadMoreLimit ? benefits?.length - loadMoreLimit : 0
            loadBenefits({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: benefits,
        initialised,
        loadMore: () =>  loadBenefits({ offset: benefits?.length, limit: loadMoreLimit }),
    };
};
