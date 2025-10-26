/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { exploreFeaturesSelector, getExploreFeatures } from "./collection-slice"

export const useExploreFeatureCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const explorefeatures = useSelector(exploreFeaturesSelector(user));
    

    const loadExploreFeatures = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getExploreFeatures({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadExploreFeatures({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadExploreFeatures, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreExploreFeaturesButton: () => <Pressable testID={'load-more-explorefeatures'} onPress={() => loadExploreFeatures({ offset: explorefeatures?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = explorefeatures?.length && explorefeatures?.length > loadMoreLimit ? explorefeatures?.length - loadMoreLimit : 0
            loadExploreFeatures({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: explorefeatures,
        initialised,
        loadMore: () =>  loadExploreFeatures({ offset: explorefeatures?.length, limit: loadMoreLimit }),
    };
};
