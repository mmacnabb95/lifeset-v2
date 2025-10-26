/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import {Header, ListBody, Typography, WebFadeIn, Drawer, OrderBy} from "src/components/common";
import {TypographyTypes} from "src/components/common/typography";
import commonConstants from "src/themes/constants";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;
import { View } from "react-native";
import {useWindowDimensions, ScrollView} from 'react-native';
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { clearExerciseItems } from "src/redux/domain/features/exercise/collection-slice";
import { deleteExercise, updateExercise } from "src/redux/domain/features/exercise/item-slice";
import { Exercise } from "../../../../../../types/domain/flat-types";
import { useExerciseCollection } from "src/redux/domain/features/exercise/useExerciseCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useExercisesSearchCollection } from "src/redux/domain/features/exercise/useExerciseSearchCollection";
import { exercisesLoading } from "src/redux/domain/features/exercise/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import ExerciseEdit from "src/components/domain/pages/exercise/exercise.edit"
import { SafeAreaView } from 'react-native-safe-area-context';


import { exerciseMediaKeysSelector, getExerciseMediaKeys } from "src/redux/domain/features/exerciseMediaKey/collection-slice";

import { useFocusEffect } from "@react-navigation/native";

import TextSearch from "src/redux/domain/features/exercise/textSearch";


import { useExerciseInlineEditListDrawerHandler } from "src/components/common/config/hooks/useExerciseInlineEditListDrawerHandler";

//draw items


const ExerciseEditListScreen = ({
  navigation,
  route,
  showTitle = true,
  // showPreamble = true,
  hideGoBack,
  style,
  newEnabled = true,
  fadeIn = true,
  parentPageIsCloseToBottomOfScroll,
  
}: {
  navigation: any;
  route?: any;
  showTitle?: boolean;
  // showPreamble?: boolean;
  hideGoBack?: boolean;
  style?: any;
  newEnabled?: boolean;
  fadeIn?: boolean;
  parentPageIsCloseToBottomOfScroll?: boolean;
  
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState(0);  // drawer items//0 - default, 1 .. or more
  const {onOpen, onClose} = useExerciseInlineEditListDrawerHandler(setDrawerOpen, setDrawerItem);

  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions()

  const dispatch = useDispatch();
  
    
  const {
    loadMore,
    loadExercises,
    basicParams,
    searchResult: exercises,
    setSearch,
    search,
    reSearch,
  } = useExercisesSearchCollection(initialLoadSize, rootLanguage)
    
  

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
    const iconPath = exercise?.resources?.find(r => r.Key === 'Icon')?.Url;
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
  

  const handleDrawerOpen = async (_drawerItem?: number) => {

    const result = await onOpen({drawerItem: _drawerItem, setDrawerItem});

    if (result === false)       {
      return false;
    }
    //wait until drawer contents re-rendered - avoiding jank
    setTimeout(() => {
      setDrawerOpen(true);
    }, 0);

    return true;
  };

    const handleClose = async () => {
      await onClose({drawerItem});
      setDrawerOpen(false);
    }

  return (
    <Drawer open={drawerOpen}  handleClose={handleClose} leftItem={
      <WebFadeIn off={!fadeIn} style={style}>
        <View style={[layoutStyles.page, layoutStyles.paddingMob20, cmsStyles?.exerciseEditList, style]}>
              <ScrollView
                scrollEnabled={true}
                nestedScrollEnabled={true}
                style={[layoutStyles.scrollViewContainer]}
                contentContainerStyle={[layoutStyles.scrollViewBody, { paddingBottom: 20 }]}
                showsVerticalScrollIndicator={false}
                onScroll={scrollCallback}
                keyboardShouldPersistTaps="handled"
              >
          <Header
            title={showTitle ? text("exerciseEditList.title")[0] || "Exercises" : ""}
            // preamble={showPreamble ? text("exerciseEditList.preamble")[0] || "All exercises" : ""}
            navigation={navigation}
            addNewDestination="ExerciseEdit"
            addNewParams={{ exerciseId: "new",  }}
            hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
            newEnabled={!drawerOpen && newEnabled}
            
            handleDrawerOpen={handleDrawerOpen}
            style={style}
            aboveResultsLeftComponents={
              
                <View />
              
            }
            underHeaderComponents={
              <TextSearch
                navigation={navigation}
                loadExercises={loadExercises}
              />}
            
          />
          

          <ListBody
            navigation={navigation}
            route={route}
            listItems={exercises}
            loading={loading}
            style={style}
            basicParams={basicParams}
            loadMore={loadMore}
            doLoad={loadExercises}
            destination={"ExerciseEdit"}
            showIcon
            // orderBy={['Order',  'Name']}
            paramKey="exerciseId"
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleClose}
            getIconPath={getIconPath}
            
            
          />
          
          </ScrollView>
        </View>
      </WebFadeIn>} rightItem={
        <>
          {drawerItem === 0 && <ExerciseEdit navigation={navigation} route={route} showHeader={false}/>}
          
        </>
      } 
      />
  );
};

export default ExerciseEditListScreen;
