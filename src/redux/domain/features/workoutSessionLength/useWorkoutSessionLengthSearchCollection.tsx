/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearWorkoutSessionLengthItems, workoutSessionLengthsSelector, searchWorkoutSessionLengths, workoutSessionLengthsLoading } from "./collection-slice";
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

export const useWorkoutSessionLengthsSearchCollection = ( initialLoadSize?: number, initialFilters?: InitialFilter[], filterKeys?: FilterKeys, initialHardFilters?: HardFilter[]) => {
    const dispatch = useDispatch();
    const cmsStyles = useCmsStyles();
    const [initialised, setInitialised] = useState(false);
    
    
    const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
    const [textFilter, setTextFilter] = useState<string | undefined>();

    
    const workoutsessionlengths = useSelector(workoutSessionLengthsSelector); 
    

    const loading = useSelector(workoutSessionLengthsLoading);
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
        dispatch(clearWorkoutSessionLengthItems());
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

    const loadWorkoutSessionLengths = useCallback(({ offset, limit, filter }: { offset?: number, limit: number, filter?: string }) => {
        setTextFilter(filter);
        setBasicParams({offset, limit, filter});
        dispatch(searchWorkoutSessionLengths({ search: search, offset: offset || 0, limit: limit, filter: filter }));
    }, [search, dispatch]);

    //limit and offset reset but filter remains
    const reSearch = (_search?: Search) => {
        setBasicParams({offset : 0, limit: initialLoadSize || 3, filter: basicParams?.filter});
        dispatch(searchWorkoutSessionLengths({
            
            search: _search || search,
            offset:  0,
            limit: initialLoadSize || 3,
            filter: basicParams?.filter }));
    };

    

    useEffect(() => {
        if (!loading && (!workoutsessionlengths ||
        workoutsessionlengths.length === 0) && 
        (!initialised )
         ) {
            setInitialised(true);
            
            loadWorkoutSessionLengths({ offset: 0, limit: initialLoadSize || 3, filter: textFilter });
        }
    }, [loading, 
        workoutsessionlengths, 
        loadWorkoutSessionLengths, 
        initialised
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
        LoadMoreWorkoutSessionLengthsSearchButton: () => (
          <Button
            title="Load more"
            style={{ maxWidth: 400  }}
            type={ButtonTypes.Secondary}
            onPress={() =>
              loadWorkoutSessionLengths({
                offset: workoutsessionlengths?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
              })
            }
          />
        ),
        loadMore: () => {
            loadWorkoutSessionLengths({
                offset: workoutsessionlengths?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
            });
        },
        Filters,
        Selects,
        loadWorkoutSessionLengths,
        searchDataLoaded: true,
        searchResult: workoutsessionlengths,
        search,
        setSearch,
        doSearch,
        reSearch,
        basicParams,
    };
};

