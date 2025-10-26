/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { companysSelector, getCompanys } from "./collection-slice"

export const useCompanyCollection = ( initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const companys = useSelector(companysSelector);

    const loadCompanys = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        await dispatch(getCompanys({ offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch]);

    useEffect(() => {
        if (!initialised) {
            loadCompanys({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadCompanys, initialised]);

    

    return {
        LoadMoreCompanysButton: () => <Pressable testID={'load-more-companys'} onPress={() => loadCompanys({ offset: companys?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = companys?.length && companys?.length > loadMoreLimit ? companys?.length - loadMoreLimit : 0
            loadCompanys({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: companys,
        initialised,
        loadMore: () =>  loadCompanys({ offset: companys?.length, limit: loadMoreLimit }),
    };
};
