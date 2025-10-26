/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userWorkoutsSelector, getUserWorkouts } from "./collection-slice"

export const useUserWorkoutCollection = (user?: number,  initialLoadSize?: number) => {
    const dispatch = useDispatch();
    const loadMoreLimit = initialLoadSize || 3;
    const [initialised, setInitialised] = useState(false);
    const userworkouts = useSelector(userWorkoutsSelector(user));
    

    const loadUserWorkouts = useCallback( async({ offset, limit }: { offset?: number, limit: number }) => {
        if(user) await dispatch(getUserWorkouts({ user: user, offset: offset || 0, limit: limit }));
        setInitialised(true);
    }, [dispatch, user]);

    useEffect(() => {
        if (!initialised && user) {
            loadUserWorkouts({ offset: 0, limit: initialLoadSize || loadMoreLimit });
        }
    }, [initialLoadSize, loadMoreLimit, loadUserWorkouts, initialised, user]);

    
    //reset should the subkey change
    useEffect(() => {
        setInitialised(false);
    }, [user]);
    

    return {
        LoadMoreUserWorkoutsButton: () => <Pressable testID={'load-more-userworkouts'} onPress={() => loadUserWorkouts({ offset: userworkouts?.length, limit: loadMoreLimit })}>Load more</Pressable>,
        Refresh: () => {
            const refreshOffset = userworkouts?.length && userworkouts?.length > loadMoreLimit ? userworkouts?.length - loadMoreLimit : 0
            loadUserWorkouts({ offset: refreshOffset, limit: loadMoreLimit });
        },
        results: userworkouts,
        initialised,
        loadMore: () =>  loadUserWorkouts({ offset: userworkouts?.length, limit: loadMoreLimit }),
    };
};
