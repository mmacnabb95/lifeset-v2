/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAllUserHabitPackItems, allUserHabitPacksSelector, searchAllUserHabitPacks, allUserHabitPacksLoading } from "./collection-slice";
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
import { getUserHabitPackStatuss, userHabitPackStatussSelector } from "../userHabitPackStatus/collection-slice";




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

export const useAllUserHabitPacksSearchCollection = ( initialLoadSize?: number, initialFilters?: InitialFilter[], filterKeys?: FilterKeys, initialHardFilters?: HardFilter[]) => {
    const dispatch = useDispatch();
    const cmsStyles = useCmsStyles();
    const [initialised, setInitialised] = useState(false);
    
    
    const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
    const [textFilter, setTextFilter] = useState<string | undefined>();

    
    const alluserhabitpacks = useSelector(allUserHabitPacksSelector); 
    

    const loading = useSelector(allUserHabitPacksLoading);
    const [basicParams, setBasicParams] = useState<BasicParams>();
    
    const userHabitPackStatuss = useSelector(userHabitPackStatussSelector);
    
    
    const [search, setSearch] = useState<Search>({
      selects: [
        
      ],
      filters: initialFilters || [
        { fieldName: 'UserHabitPackStatus', filter: [], maxFilterCount: 10 }
      ],
      
      
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
        dispatch(clearAllUserHabitPackItems());
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

    const loadAllUserHabitPacks = useCallback(({ offset, limit, filter }: { offset?: number, limit: number, filter?: string }) => {
        setTextFilter(filter);
        setBasicParams({offset, limit, filter});
        dispatch(searchAllUserHabitPacks({ search: search, offset: offset || 0, limit: limit, filter: filter }));
    }, [search, dispatch]);

    //limit and offset reset but filter remains
    const reSearch = (_search?: Search) => {
        setBasicParams({offset : 0, limit: initialLoadSize || 3, filter: basicParams?.filter});
        dispatch(searchAllUserHabitPacks({
            
            search: _search || search,
            offset:  0,
            limit: initialLoadSize || 3,
            filter: basicParams?.filter }));
    };

    

    useEffect(() => {
        if (!loading && (!alluserhabitpacks ||
        alluserhabitpacks.length === 0) && 
        (!initialised )
         ) {
            setInitialised(true);
            
            loadAllUserHabitPacks({ offset: 0, limit: initialLoadSize || 3, filter: textFilter });
        }
    }, [loading, 
        alluserhabitpacks, 
        loadAllUserHabitPacks, 
        initialised
    ]);

    useEffect(() => {
        if(!searchParamsLoaded){
          setSearchParamsLoaded(true);
             dispatch(getUserHabitPackStatuss());

        
        }
    }, [dispatch, searchParamsLoaded]);


    const Filters = ({
          disabled,
          hidden,
          inline = true,
          modalTitle,
          modalButtonText,
          modalPreamble,
          setFilterOpen,
          filterOpen,
          pressableStyle,
          selectedStyle,
          onLayout,
      } : {
          disabled?: boolean,
          hidden?: string[];
          /** Whether or not to run the filter as soon as a filter option is selected. Default is false.*/
          inline?: boolean;
          modalTitle?: string;
          modalButtonText?: string;
          modalPreamble?: string;
          /** If the filter is nested in a modal*/
          setFilterOpen?: (value: React.SetStateAction<boolean>) => void;
          filterOpen?: boolean;
          pressableStyle?: any;
          selectedStyle?: any;
          onLayout?: any;
      }) => {
          return <ListFilter
                      modalTitle={modalTitle}
                      modalPreamble={modalPreamble}
                      modalButtonText={modalButtonText}
                      setFilterOpen={setFilterOpen}
                      disabled={disabled}
                      inline={inline}
                      search={search}
                      setSearch={setSearch}
                      doSearch={doSearch}
                      reSearch={reSearch}
                      clearingThunk={clearAllUserHabitPackItems}
                      pressableStyle={pressableStyle}
                      selectedStyle={selectedStyle}
                      onLayout={onLayout}
                      searchFields={[
                        {
                            name: "UserHabitPackStatus",
                            title: "User habit pack status",
                            hidden: hidden?.includes("UserHabitPackStatus"),
                            values: userHabitPackStatuss!,
                            filterType: "filter",
                          }]}
                />;
      };
    
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
        LoadMoreAllUserHabitPacksSearchButton: () => (
          <Button
            title="Load more"
            style={{ maxWidth: 400  }}
            type={ButtonTypes.Secondary}
            onPress={() =>
              loadAllUserHabitPacks({
                offset: alluserhabitpacks?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
              })
            }
          />
        ),
        loadMore: () => {
            loadAllUserHabitPacks({
                offset: alluserhabitpacks?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
            });
        },
        Filters,
        Selects,
        loadAllUserHabitPacks,
        searchDataLoaded: userHabitPackStatuss,
        searchResult: alluserhabitpacks,
        search,
        setSearch,
        doSearch,
        reSearch,
        basicParams,
    };
};

