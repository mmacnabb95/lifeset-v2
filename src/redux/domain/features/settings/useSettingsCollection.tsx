/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { settingssSelector, getSettingss } from "./collection-slice"

export const useSettingsCollection = (id?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const settingss = useSelector(settingssSelector(id));
    

    const loadSettingss = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(id) await dispatch(getSettingss({ id: id, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, id]);

    useEffect(() => {
        if (!initialised && id) {
            loadSettingss({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadSettingss, initialised, id]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [id]);
    

    return {
        LoadMoreSettingssButton: () => <Pressable testID={'load-more-settingss'} onPress={() => loadSettingss({ offset: settingss?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = settingss?.length && settingss?.length > loadMoreLimit ? settingss?.length - loadMoreLimit : 0
            loadSettingss({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: settingss,
        initialised,
        loadMore: () =>  loadSettingss({ offset: settingss?.length, limit: loadMoreLimit }),
    };
};
