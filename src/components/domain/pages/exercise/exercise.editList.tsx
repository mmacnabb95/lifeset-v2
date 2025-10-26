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
import { clearExerciseItems } from "src/redux/domain/features/exercise/collection-slice";
// import { deleteExercise, updateExercise } from "src/redux/domain/features/exercise/item-slice";
import { Exercise } from "../../../../../../types/domain/flat-types";
import { useExerciseCollection } from "src/redux/domain/features/exercise/useExerciseCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useExercisesSearchCollection } from "src/redux/domain/features/exercise/useExerciseSearchCollection";
import { exercisesLoading } from "src/redux/domain/features/exercise/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import { useEditListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";




import { exerciseMediaKeysSelector, getExerciseMediaKeys } from "src/redux/domain/features/exerciseMediaKey/collection-slice";

import { useFocusEffect } from "@react-navigation/native";
import TextSearch from "src/redux/domain/features/exercise/textSearch";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const ExerciseEditListScreen = ({
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
  destination = "ExerciseEdit",
  
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
  const editListConfig = useEditListConfig("Exercise", route);

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
  
  
  
  const {
    loadMore,
    loadExercises,
    basicParams,
    searchResult: exercises,
    Filters
  } = useExercisesSearchCollection(initialLoadSize)
    

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(exercisesLoading);
  const { text } = useTranslation();

  
  const exerciseMediaKeys = useSelector(exerciseMediaKeysSelector);
  

  
  useFocusEffect(
    React.useCallback(() => {
      if (!exerciseMediaKeys) {
        dispatch(getExerciseMediaKeys());
      }
    }, [dispatch, exerciseMediaKeys]),
  );
  

  

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

  
  const getIconPath = (exercise: Exercise ) => {
    const iconPath = exercise?.resources?.find(r => {
      const meta = JSON.parse(r?.Meta);
      return meta?.fileType === "image";
    })?.Url;
    if (iconPath){
      return iconPath;
    }

    //we can't do this in the editList if it isn't support in the viewList
    // ... and to do that we need a concept of the source resource - i.e. view don't have resources...
    // if (!exerciseMediaKeys?.find(k => k.MediaRestriction === 'Image')){
    //   return;
    // }

    // const heroPath = exercise?.resources?.find(r => r.Key === 'Hero')?.Url;
    // return heroPath;
  };
  

  return (
    <WebFadeIn off={!fadeIn} style={style} background={true}>
      <View style={[layoutStyles.page, layoutStyles.paddingMob20, layoutStyles.parentEditList, cmsStyles?.exerciseEditList, style]}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[layoutStyles.body,cmsStyles?.exerciseEditListContentContainerStyle ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
        <Header
          title={showTitle ? text("exerciseEditList.title")[0] || "Exercises" : ""}
          preamble={text("exerciseEditList.preamble")[0] || ""}
          navigation={navigation}
          addNewDestination={route.params?.viewOnly || newPosition === "bottom" ? undefined :"ExerciseEdit"}
          addNewParams={{ exerciseId: "new" }}
          
          hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
          newEnabled={newEnabled}
          style={[style, layoutStyles.editListHeaderStyle, cmsStyles?.exerciseEditListHeaderStyle]}
          titleStyle={[layoutStyles.parentListPageTitle, cmsStyles?.exerciseEditListTitleStyle]}
          underHeaderComponents={
            <View style={layoutStyles.searchSection}>
            <TextSearch
              navigation={navigation}
              loadExercises={loadExercises}
              style={{inputContainer: {flex: 1}}}
            />
            {filterTargetHeight > 0 && <Pressable
              onPress={() => {
                fireMediumHapticFeedback();
                setShowFilters(!showFilters);
              }}
              style={({ pressed }) => [
                layoutStyles.searchFilterButton,
                pressed ? { opacity: 0.5 } : {},
                // !showFilters ? { backgroundColor: "lightgrey" } : {},
              ]}
            >
              <Icon
                iconType="filter"
                iconColor="white"
                iconSize={30}
              />
            </Pressable>}
           </View>}
          
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
          listItems={exercises}
          loading={loading}
          style={style}
          contentStyle={contentStyle}
          basicParams={basicParams}
          loadMore={loadMore}
          doLoad={loadExercises}
          destination={destination}
          showIcon
          orderBy={['Order',  'Name']}
          paramKey="exerciseId"
          getIconPath={getIconPath}
          
          
        />
        
        </ScrollView>
        {!route.params?.viewOnly && newPosition === "bottom" && (
          <AddNew
            destinationScreen={route.params?.viewOnly ? "" : "ExerciseEdit"}
            params={{ exerciseId: "new" }}
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

export default ExerciseEditListScreen;
