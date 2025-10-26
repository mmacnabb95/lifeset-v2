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
import { clearHabitItems } from "src/redux/domain/features/habit/collection-slice";
import { deleteHabit, updateHabit } from "src/redux/domain/features/habit/item-slice";
import { Habit } from "../../../../../../types/domain/flat-types";
import { useHabitCollection } from "src/redux/domain/features/habit/useHabitCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useHabitsSearchCollection } from "src/redux/domain/features/habit/useHabitSearchCollection";
import { habitsLoading } from "src/redux/domain/features/habit/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import HabitEdit from "src/components/domain/pages/habit/habit.edit"
import { SafeAreaView } from 'react-native-safe-area-context';


import { useFocusEffect } from "@react-navigation/native";

import TextSearch from "src/redux/domain/features/habit/textSearch";


import { useHabitInlineEditListDrawerHandler } from "src/components/common/config/hooks/useHabitInlineEditListDrawerHandler";

//draw items


const HabitEditListScreen = ({
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
  const {onOpen, onClose} = useHabitInlineEditListDrawerHandler(setDrawerOpen, setDrawerItem);

  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions()

  const dispatch = useDispatch();
  
    
  const {
    loadMore,
    loadHabits,
    basicParams,
    searchResult: habits,
    setSearch,
    search,
    reSearch,
  } = useHabitsSearchCollection(initialLoadSize, rootLanguage)
    
  

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(habitsLoading);
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
        <View style={[layoutStyles.page, layoutStyles.paddingMob20, cmsStyles?.habitEditList, style]}>
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
            title={showTitle ? text("habitEditList.title")[0] || "Habits" : ""}
            // preamble={showPreamble ? text("habitEditList.preamble")[0] || "All habits" : ""}
            navigation={navigation}
            addNewDestination="HabitEdit"
            addNewParams={{ habitId: "new",  }}
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
                loadHabits={loadHabits}
              />}
            
          />
          

          <ListBody
            navigation={navigation}
            route={route}
            listItems={habits}
            loading={loading}
            style={style}
            basicParams={basicParams}
            loadMore={loadMore}
            doLoad={loadHabits}
            destination={"HabitEdit"}
            // orderBy={['Order', ]}
            paramKey="habitId"
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleClose}
            
            
            
          />
          
          </ScrollView>
        </View>
      </WebFadeIn>} rightItem={
        <>
          {drawerItem === 0 && <HabitEdit navigation={navigation} route={route} showHeader={false}/>}
          
        </>
      } 
      />
  );
};

export default HabitEditListScreen;
