/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUserHabitPackHabitItems, userHabitPackHabitsSelector, searchUserHabitPackHabits, userHabitPackHabitsLoading } from "./collection-slice";
import { Search, HardFilter } from "../../../../../../types/search/search";
// import TagButtons from "../../../../containers/pages/layout/components/tagButton";
import _ from "lodash";
import {Button, Typography} from "src/components/common";
import {ButtonTypes} from "src/components/common/button";
import { Platform, Pressable, View } from "react-native";
import { TypographyTypes } from "src/components/common/typography";
import * as Haptics from "expo-haptics";
import { ListFilter } from "src/components/common/listFilter/listFilter";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;




export interface InitialFilter {
    fieldName: string;
    filter: number[];
    maxFilterCount: number; 
}

export interface BasicParams {
    offset?: number;
    limit: number;
    filter?: string;
}

export interface FilterKeys {
    [key: string]: number
}

export const useUserHabitPackHabitsSearchCollection = (userhabitpack?: number,  initialLoadSize?: number, initialFilters?: InitialFilter[], filterKeys?: FilterKeys, initialHardFilters?: HardFilter[]) => {
    const dispatch = useDispatch();
    const cmsStyles = useCmsStyles();
    const [initialised, setInitialised] = useState(false);
    const initialisedSubKey = useRef(userhabitpack);
    
    const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
    const [textFilter, setTextFilter] = useState<string | undefined>();

    
    const userhabitpackhabits = useSelector(userHabitPackHabitsSelector(userhabitpack)); 
    

    const loading = useSelector(userHabitPackHabitsLoading);
    const [basicParams, setBasicParams] = useState<BasicParams>();
    
    
    
    
    const [search, setSearch] = useState<Search>({
      selects: [],
      filters: []
    });


    const toggleFilter = (fieldName: string, filterTypeId?: number) => {

        if(!filterTypeId) return;


        let filter = _.find(search.filters, { fieldName: fieldName })?.filter;

        if (filter && filter.indexOf(filterTypeId) !== -1) {
            _.remove(filter, val => val === filterTypeId);
        } else if (filter) {
            filter.push(filterTypeId);
        }

        setSearch(search);
        setInitialised(false);
        dispatch(clearUserHabitPackHabitItems());
        reSearch();
    };

    const toggleBoolFilter = (fieldName: string) => {
        let filter = _.find(search.filters, { fieldName: fieldName })?.filter;

        if (filter && filter[0] === true) {
            _.remove(filter, val => val === true);
        } else if (filter) {
            filter.push(true);
        }

        setSearch(search);
        setInitialised(false);
    };

    const filterOn = (fieldName: string, filterTypeId?: number): boolean => {

        if(!filterTypeId) return false;

        let filter = _.find(search.filters, { fieldName: fieldName })?.filter;

        if (filter && filter.indexOf(filterTypeId) !== -1) {
            return true;
        }

        return false;
    };

    const filterOnBool = (fieldName: string): boolean => {
        let filter = _.find(search.filters, { fieldName: fieldName })?.filter;

        if (filter && filter[0] === true) {
            return true;
        }

        return false;
    };

    const setSelect = (selectName: string, value: any) => {
        let selectItem = _.find(search.selects, { fieldName: selectName });

        if (selectItem && value === -1) {
            selectItem.select = [];
        } else if (selectItem) {
            selectItem.select[0] = value;
        }

        setSearch(search);
        setInitialised(false);
    };

    const setMultipleSelect = (selectName: string, value: any) => {
        let selectItem = _.find(search.selects, { fieldName: selectName });

        if (value.indexOf(-1) !== -1) value.splice(value.indexOf(-1), 1);

        if (selectItem?.select) selectItem.select = value

        setSearch(search);
    };

    const loadUserHabitPackHabits = useCallback(({ offset, limit, filter }: { offset?: number, limit: number, filter?: string }) => {
        setTextFilter(filter);
        setBasicParams({offset, limit, filter});
        if(userhabitpack) dispatch(searchUserHabitPackHabits({ userhabitpack: userhabitpack, search: search, offset: offset || 0, limit: limit, filter: filter }));
    }, [search, dispatch, userhabitpack]);

    //limit and offset reset but filter remains
    const reSearch = (_search?: Search) => {
        setBasicParams({offset : 0, limit: initialLoadSize || 3, filter: basicParams?.filter});
        dispatch(searchUserHabitPackHabits({
            userhabitpack: userhabitpack, 
            search: _search || search,
            offset:  0,
            limit: initialLoadSize || 3,
            filter: basicParams?.filter }));
    };

    

    useEffect(() => {
        if (!loading && (!userhabitpackhabits ||
        userhabitpackhabits.length === 0) && 
        (!initialised || initialisedSubKey.current !== userhabitpack)
          && userhabitpack) {
            setInitialised(true);
            initialisedSubKey.current = userhabitpack;
            loadUserHabitPackHabits({ offset: 0, limit: initialLoadSize || 3, filter: textFilter });
        }
    }, [loading, 
        userhabitpackhabits, 
        loadUserHabitPackHabits, 
        initialised, userhabitpack
    ]);

    useEffect(() => {
        if(!searchParamsLoaded){
          setSearchParamsLoaded(true);
        
        
        }
    }, [dispatch, searchParamsLoaded]);


    const Filters = () => null;
    
    const Selects = ({ disabled }: { disabled?: boolean }) => {
        const [renderTarget, setRenderTarget] = React.useState<any[-1]>();
        return (
            <>
            
            </>
        );
    };

    const doSearch = () => {
        setInitialised(false);
    };

    return {
        LoadMoreUserHabitPackHabitsSearchButton: () => (
          <Button
            title="Load more"
            style={{ maxWidth: 400  }}
            type={ButtonTypes.Secondary}
            onPress={() =>
              loadUserHabitPackHabits({
                offset: userhabitpackhabits?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
              })
            }
          />
        ),
        loadMore: () => {
            loadUserHabitPackHabits({
                offset: userhabitpackhabits?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
            });
        },
        Filters,
        Selects,
        loadUserHabitPackHabits,
        searchDataLoaded: true,
        searchResult: userhabitpackhabits,
        search,
        setSearch,
        doSearch,
        reSearch,
        basicParams,
    };
};

