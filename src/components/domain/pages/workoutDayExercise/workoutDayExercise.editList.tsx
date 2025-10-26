/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from "react";
import {Icon, Header, ListBody, Typography, WebFadeIn, AddNew} from "src/components/common";
import {TypographyTypes} from "src/components/common/typography";
import commonConstants from "src/themes/constants";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;
import { Animated, View } from "react-native";
import {useWindowDimensions, Pressable, ScrollView} from 'react-native';
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { clearWorkoutDayExerciseItems } from "src/redux/domain/features/workoutDayExercise/collection-slice";
// import { deleteWorkoutDayExercise, updateWorkoutDayExercise } from "src/redux/domain/features/workoutDayExercise/item-slice";
import { Workoutdayexercise } from "../../../../../../types/domain/flat-types";
import { useWorkoutDayExerciseCollection } from "src/redux/domain/features/workoutDayExercise/useWorkoutDayExerciseCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useWorkoutDayExercisesSearchCollection } from "src/redux/domain/features/workoutDayExercise/useWorkoutDayExerciseSearchCollection";
import { workoutDayExercisesLoading } from "src/redux/domain/features/workoutDayExercise/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import { useEditListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";




import { useFocusEffect } from "@react-navigation/native";
import TextSearch from "src/redux/domain/features/workoutDayExercise/textSearch";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const WorkoutDayExerciseEditListScreen = ({
  navigation,
  route,
  showTitle = true,
  // showPreamble = true,
  hideGoBack,
  style,
  contentStyle,
  newEnabled = true,
  newPosition = "top",
  fadeIn = true,
  parentPageIsCloseToBottomOfScroll,
  scrollEnabled = true,
  destination = "WorkoutDayExerciseEdit",
  
}: {
  navigation: any;
  route?: any;
  showTitle?: boolean;
  // showPreamble?: boolean;
  hideGoBack?: boolean;
  style?: any;
  contentStyle?: any;
  newEnabled?: boolean;
  newPosition?: "top" | "bottom";
  fadeIn?: boolean;
  parentPageIsCloseToBottomOfScroll?: boolean;
  scrollEnabled?: boolean;
  destination?: string;
  
}) => {
  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions()
  const { userId } = useUserInfo();
  const editListConfig = useEditListConfig("WorkoutDayExercise", route);

  const [showFilters, setShowFilters] = useState(false);
  const filterHeight = useRef(new Animated.Value(0)).current;
  const [filterTargetHeight, setFilterTargetHeight] = useState(0);
  useEffect(() => {
    Animated.timing(filterHeight, {
      toValue: showFilters ? filterTargetHeight : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters, filterTargetHeight]);

  const dispatch = useDispatch();
  
  const { workoutDayId } = route.params;
  // const { results: workoutDayExercises, Refresh, initialised } = useWorkoutDayExerciseCollection(workoutDayId === "new" ? undefined : workoutDayId, 100);
  
  
  
  const {
    loadMore,
    loadWorkoutDayExercises,
    basicParams,
    searchResult: workoutDayExercises,
    Filters,
  } = useWorkoutDayExercisesSearchCollection(workoutDayId === "new" ? undefined : workoutDayId, initialLoadSize, undefined, );
    

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(workoutDayExercisesLoading);
  const { text } = useTranslation();

  

  

  

  const getSubText = (item: any): string | JSX.Element | undefined => {
    if (item?.Description || item?.Text) {
      const text = item?.Introduction || item?.Description || item?.Text || item?.Article;
      return (
        <>

               <Typography
                      type={TypographyTypes.Body1}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      text={text.replace(/\n/g, " ")}
                    />

        </>
      )
    }
    else if (item?.category?.Name)
      return (
        <>
              <Typography type={TypographyTypes.Body1} text={"Category:"} />
              <Typography
                  type={TypographyTypes.Body1}
                  text= {item.category.Name}
              />

        </>
      )
  };

  

  return (
    <WebFadeIn off={!fadeIn} style={style} background={true}>
      <View style={[layoutStyles.page, layoutStyles.paddingMob20, layoutStyles.childSubList, cmsStyles?.workoutDayExerciseEditList, style]}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[layoutStyles.body, layoutStyles.childSubListScrollContent, cmsStyles?.workoutDayExerciseEditListContentContainerStyle ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
        <Header
          title={showTitle ? text("workoutDayExerciseEditList.title")[0] || "Workout day exercises" : ""}
          preamble={text("workoutDayExerciseEditList.preamble")[0] || ""}
          navigation={navigation}
          addNewDestination={route.params?.viewOnly || newPosition === "bottom" ? undefined :"WorkoutDayExerciseEdit"}
          addNewParams={{ workoutDayExerciseId: "new", workoutDayId }}
          
          hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
          newEnabled={newEnabled}
          style={[style, cmsStyles?.workoutDayExerciseEditListHeaderStyle]}
          titleStyle={[layoutStyles.childSubListPageTitle, cmsStyles?.workoutDayExerciseEditListTitleStyle]}
          
        />
        

        <Animated.View
          style={[
            {
              height: editListConfig?.initialFilterHeight || filterHeight,
              overflow: "hidden",
            },
          ]}
        >
          <View style={{ paddingLeft: 5, flexGrow: 0, flexShrink: 1, flexBasis: "auto" }}>
            <Filters hidden={editListConfig?.hidden} onLayout={(event) => {
            const {height} = event.nativeEvent.layout;
            if (height > filterTargetHeight) {
              setFilterTargetHeight(height);
            }
          }}/>
          </View>
        </Animated.View>
        <ListBody
          navigation={navigation}
          route={route}
          listItems={workoutDayExercises}
          loading={loading}
          style={style}
          contentStyle={contentStyle}
          basicParams={basicParams}
          loadMore={loadMore}
          doLoad={loadWorkoutDayExercises}
          destination={destination}
          orderBy={['Order', ]}
          paramKey="workoutDayExerciseId"
          
          editNavItem={"WorkoutDayExerciseEditNav"} 
          
        />
        
        </ScrollView>
        {!route.params?.viewOnly && newPosition === "bottom" && (
          <AddNew
            destinationScreen={route.params?.viewOnly ? "" : "WorkoutDayExerciseEdit"}
            params={{ workoutDayExerciseId: "new" }}
            navigation={navigation as any}
            // title={`item`}
            newEnabled={newEnabled}
            style={{ bottom: 0, right: 13, opacity: 0.9 }}
          />
        )}
      </View>
    </WebFadeIn>
  );
};

export default WorkoutDayExerciseEditListScreen;
