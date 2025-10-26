/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearHabitCompletedRecordItems, habitCompletedRecordsSelector, searchHabitCompletedRecords, habitCompletedRecordsLoading } from "./collection-slice";
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

export const useHabitCompletedRecordsSearchCollection = (habit?: number,  initialLoadSize?: number, initialFilters?: InitialFilter[], filterKeys?: FilterKeys, initialHardFilters?: HardFilter[]) => {
    const dispatch = useDispatch();
    const cmsStyles = useCmsStyles();
    const [initialised, setInitialised] = useState(false);
    const initialisedSubKey = useRef(habit);
    
    const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
    const [textFilter, setTextFilter] = useState<string | undefined>();

    
    const habitcompletedrecords = useSelector(habitCompletedRecordsSelector(habit)); 
    

    const loading = useSelector(habitCompletedRecordsLoading);
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
        dispatch(clearHabitCompletedRecordItems());
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

    const loadHabitCompletedRecords = useCallback(({ offset, limit, filter }: { offset?: number, limit: number, filter?: string }) => {
        setTextFilter(filter);
        setBasicParams({offset, limit, filter});
        if(habit) dispatch(searchHabitCompletedRecords({ habit: habit, search: search, offset: offset || 0, limit: limit, filter: filter }));
    }, [search, dispatch, habit]);

    //limit and offset reset but filter remains
    const reSearch = (_search?: Search) => {
        setBasicParams({offset : 0, limit: initialLoadSize || 3, filter: basicParams?.filter});
        dispatch(searchHabitCompletedRecords({
            habit: habit, 
            search: _search || search,
            offset:  0,
            limit: initialLoadSize || 3,
            filter: basicParams?.filter }));
    };

    

    useEffect(() => {
        if (!loading && (!habitcompletedrecords ||
        habitcompletedrecords.length === 0) && 
        (!initialised || initialisedSubKey.current !== habit)
          && habit) {
            setInitialised(true);
            initialisedSubKey.current = habit;
            loadHabitCompletedRecords({ offset: 0, limit: initialLoadSize || 3, filter: textFilter });
        }
    }, [loading, 
        habitcompletedrecords, 
        loadHabitCompletedRecords, 
        initialised, habit
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
        LoadMoreHabitCompletedRecordsSearchButton: () => (
          <Button
            title="Load more"
            style={{ maxWidth: 400  }}
            type={ButtonTypes.Secondary}
            onPress={() =>
              loadHabitCompletedRecords({
                offset: habitcompletedrecords?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
              })
            }
          />
        ),
        loadMore: () => {
            loadHabitCompletedRecords({
                offset: habitcompletedrecords?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
            });
        },
        Filters,
        Selects,
        loadHabitCompletedRecords,
        searchDataLoaded: true,
        searchResult: habitcompletedrecords,
        search,
        setSearch,
        doSearch,
        reSearch,
        basicParams,
    };
};

