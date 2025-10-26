/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearWorkoutItems, workoutsSelector, searchWorkouts, workoutsLoading } from "./collection-slice";
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
import { getCardioIncludeds, cardioIncludedsSelector } from "../cardioIncluded/collection-slice";
import { getCurrentFitnessLevels, currentFitnessLevelsSelector } from "../currentFitnessLevel/collection-slice";
import { getDaysPerWeeks, daysPerWeeksSelector } from "../daysPerWeek/collection-slice";
import { getFitnessGoals, fitnessGoalsSelector } from "../fitnessGoal/collection-slice";
import { getWorkoutLocations, workoutLocationsSelector } from "../workoutLocation/collection-slice";
import { getWorkoutSessionLengths, workoutSessionLengthsSelector } from "../workoutSessionLength/collection-slice";




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

export const useWorkoutsSearchCollection = ( initialLoadSize?: number, initialFilters?: InitialFilter[], filterKeys?: FilterKeys, initialHardFilters?: HardFilter[]) => {
    const dispatch = useDispatch();
    const cmsStyles = useCmsStyles();
    const [initialised, setInitialised] = useState(false);
    
    
    const [searchParamsLoaded, setSearchParamsLoaded] = useState(false);
    const [textFilter, setTextFilter] = useState<string | undefined>();

    
    const workouts = useSelector(workoutsSelector); 
    

    const loading = useSelector(workoutsLoading);
    const [basicParams, setBasicParams] = useState<BasicParams>();
    
    const cardioIncludeds = useSelector(cardioIncludedsSelector);
    const currentFitnessLevels = useSelector(currentFitnessLevelsSelector);
    const daysPerWeeks = useSelector(daysPerWeeksSelector);
    const fitnessGoals = useSelector(fitnessGoalsSelector);
    const workoutLocations = useSelector(workoutLocationsSelector);
    const workoutSessionLengths = useSelector(workoutSessionLengthsSelector);
    
    
    const [search, setSearch] = useState<Search>({
      selects: [
        
      ],
      filters: initialFilters || [
        { fieldName: 'FitnessGoal', filter: [], maxFilterCount: 10 },
        { fieldName: 'WorkoutSessionLength', filter: [], maxFilterCount: 10 }
      ],
      hardFilters: initialHardFilters || [
        { fieldName: 'CardioIncluded', value: undefined },
        { fieldName: 'CurrentFitnessLevel', value: undefined },
        { fieldName: 'DaysPerWeek', value: undefined },
        { fieldName: 'WorkoutLocation', value: undefined }  
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
        dispatch(clearWorkoutItems());
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

    const loadWorkouts = useCallback(({ offset, limit, filter }: { offset?: number, limit: number, filter?: string }) => {
        setTextFilter(filter);
        setBasicParams({offset, limit, filter});
        dispatch(searchWorkouts({ search: search, offset: offset || 0, limit: limit, filter: filter }));
    }, [search, dispatch]);

    //limit and offset reset but filter remains
    const reSearch = (_search?: Search) => {
        setBasicParams({offset : 0, limit: initialLoadSize || 3, filter: basicParams?.filter});
        dispatch(searchWorkouts({
            
            search: _search || search,
            offset:  0,
            limit: initialLoadSize || 3,
            filter: basicParams?.filter }));
    };

    

    useEffect(() => {
        if (!loading && (!workouts ||
        workouts.length === 0) && 
        (!initialised )
         ) {
            setInitialised(true);
            
            loadWorkouts({ offset: 0, limit: initialLoadSize || 3, filter: textFilter });
        }
    }, [loading, 
        workouts, 
        loadWorkouts, 
        initialised
    ]);

    useEffect(() => {
        if(!searchParamsLoaded){
          setSearchParamsLoaded(true);
             dispatch(getCardioIncludeds());
        dispatch(getCurrentFitnessLevels());
        dispatch(getDaysPerWeeks());
        dispatch(getFitnessGoals());
        dispatch(getWorkoutLocations());
        dispatch(getWorkoutSessionLengths());

        
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
                      clearingThunk={clearWorkoutItems}
                      pressableStyle={pressableStyle}
                      selectedStyle={selectedStyle}
                      onLayout={onLayout}
                      searchFields={[
                        {
                            name: "CardioIncluded",
                            title: "Do you want to include cardio in your routine?",
                            hidden: hidden?.includes("CardioIncluded"),
                            values: cardioIncludeds!,
                            filterType: "hardFilter",
                          },{
                            name: "CurrentFitnessLevel",
                            title: "What is your current fitness level?",
                            hidden: hidden?.includes("CurrentFitnessLevel"),
                            values: currentFitnessLevels!,
                            filterType: "hardFilter",
                          },{
                            name: "DaysPerWeek",
                            title: "How many days do you want to workout per week?",
                            hidden: hidden?.includes("DaysPerWeek"),
                            values: daysPerWeeks!,
                            filterType: "hardFilter",
                          },{
                            name: "FitnessGoal",
                            title: "What is your fitness goal?",
                            hidden: hidden?.includes("FitnessGoal"),
                            values: fitnessGoals!,
                            filterType: "filter",
                          },{
                            name: "WorkoutLocation",
                            title: "Where do you plan to workout?",
                            hidden: hidden?.includes("WorkoutLocation"),
                            values: workoutLocations!,
                            filterType: "hardFilter",
                          },{
                            name: "WorkoutSessionLength",
                            title: "How much time can you dedicate per workout session?",
                            hidden: hidden?.includes("WorkoutSessionLength"),
                            values: workoutSessionLengths!,
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
        LoadMoreWorkoutsSearchButton: () => (
          <Button
            title="Load more"
            style={{ maxWidth: 400  }}
            type={ButtonTypes.Secondary}
            onPress={() =>
              loadWorkouts({
                offset: workouts?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
              })
            }
          />
        ),
        loadMore: () => {
            loadWorkouts({
                offset: workouts?.length,
                limit: initialLoadSize || 3,
                filter: textFilter,
            });
        },
        Filters,
        Selects,
        loadWorkouts,
        searchDataLoaded: cardioIncludeds && currentFitnessLevels && daysPerWeeks && fitnessGoals && workoutLocations && workoutSessionLengths,
        searchResult: workouts,
        search,
        setSearch,
        doSearch,
        reSearch,
        basicParams,
    };
};

