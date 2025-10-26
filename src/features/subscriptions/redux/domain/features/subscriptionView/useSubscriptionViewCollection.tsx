/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { subscriptionViewsSelector, getSubscriptionViews } from "./collection-slice"

export const useSubscriptionViewCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const subscriptionviews = useSelector(subscriptionViewsSelector(user));
    

    const loadSubscriptionViews = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getSubscriptionViews({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadSubscriptionViews({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadSubscriptionViews, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreSubscriptionViewsButton: () => <Pressable testID={'load-more-subscriptionviews'} onPress={() => loadSubscriptionViews({ offset: subscriptionviews?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = subscriptionviews?.length && subscriptionviews?.length > loadMoreLimit ? subscriptionviews?.length - loadMoreLimit : 0
            loadSubscriptionViews({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: subscriptionviews,
        initialised,
        loadMore: () =>  loadSubscriptionViews({ offset: subscriptionviews?.length, limit: loadMoreLimit }),
    };
};
