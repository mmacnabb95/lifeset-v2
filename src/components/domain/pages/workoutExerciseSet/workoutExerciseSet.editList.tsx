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
import { clearWorkoutExerciseSetItems } from "src/redux/domain/features/workoutExerciseSet/collection-slice";
// import { deleteWorkoutExerciseSet, updateWorkoutExerciseSet } from "src/redux/domain/features/workoutExerciseSet/item-slice";
import { Workoutexerciseset } from "../../../../../../types/domain/flat-types";
import { useWorkoutExerciseSetCollection } from "src/redux/domain/features/workoutExerciseSet/useWorkoutExerciseSetCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useWorkoutExerciseSetsSearchCollection } from "src/redux/domain/features/workoutExerciseSet/useWorkoutExerciseSetSearchCollection";
import { workoutExerciseSetsLoading } from "src/redux/domain/features/workoutExerciseSet/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import { useEditListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";




import { useFocusEffect } from "@react-navigation/native";
import TextSearch from "src/redux/domain/features/workoutExerciseSet/textSearch";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const WorkoutExerciseSetEditListScreen = ({
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
  destination = "WorkoutExerciseSetEdit",
  
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
  const editListConfig = useEditListConfig("WorkoutExerciseSet", route);

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
  
  const { workoutDayExerciseId } = route.params;
  // const { results: workoutExerciseSets, Refresh, initialised } = useWorkoutExerciseSetCollection(workoutDayExerciseId === "new" ? undefined : workoutDayExerciseId, 100);
  
  
  
  const {
    loadMore,
    loadWorkoutExerciseSets,
    basicParams,
    searchResult: workoutExerciseSets,
    Filters,
  } = useWorkoutExerciseSetsSearchCollection(workoutDayExerciseId === "new" ? undefined : workoutDayExerciseId, initialLoadSize, undefined, );
    

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(workoutExerciseSetsLoading);
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
      <View style={[layoutStyles.page, layoutStyles.paddingMob20, layoutStyles.childSubList, cmsStyles?.workoutExerciseSetEditList, style]}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[layoutStyles.body, layoutStyles.childSubListScrollContent, cmsStyles?.workoutExerciseSetEditListContentContainerStyle ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
        <Header
          title={showTitle ? text("workoutExerciseSetEditList.title")[0] || "Workout exercise sets" : ""}
          preamble={text("workoutExerciseSetEditList.preamble")[0] || ""}
          navigation={navigation}
          addNewDestination={route.params?.viewOnly || newPosition === "bottom" ? undefined :"WorkoutExerciseSetEdit"}
          addNewParams={{ workoutExerciseSetId: "new", workoutDayExerciseId }}
          
          hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
          newEnabled={newEnabled}
          style={[style, cmsStyles?.workoutExerciseSetEditListHeaderStyle]}
          titleStyle={[layoutStyles.childSubListPageTitle, cmsStyles?.workoutExerciseSetEditListTitleStyle]}
          
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
          listItems={workoutExerciseSets}
          loading={loading}
          style={style}
          contentStyle={contentStyle}
          basicParams={basicParams}
          loadMore={loadMore}
          doLoad={loadWorkoutExerciseSets}
          destination={destination}
          orderBy={['Order',  'SetNumber']}
          paramKey="workoutExerciseSetId"
          
          editNavItem={"WorkoutExerciseSetEditNav"} 
          
        />
        
        </ScrollView>
        {!route.params?.viewOnly && newPosition === "bottom" && (
          <AddNew
            destinationScreen={route.params?.viewOnly ? "" : "WorkoutExerciseSetEdit"}
            params={{ workoutExerciseSetId: "new" }}
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

export default WorkoutExerciseSetEditListScreen;
