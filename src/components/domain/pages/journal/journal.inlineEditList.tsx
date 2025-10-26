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
import { clearJournalItems } from "src/redux/domain/features/journal/collection-slice";
import { deleteJournal, updateJournal } from "src/redux/domain/features/journal/item-slice";
import { Journal } from "../../../../../../types/domain/flat-types";
import { useJournalCollection } from "src/redux/domain/features/journal/useJournalCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useJournalsSearchCollection } from "src/redux/domain/features/journal/useJournalSearchCollection";
import { journalsLoading } from "src/redux/domain/features/journal/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import JournalEdit from "src/components/domain/pages/journal/journal.edit"
import { SafeAreaView } from 'react-native-safe-area-context';


import { useFocusEffect } from "@react-navigation/native";


import { useJournalInlineEditListDrawerHandler } from "src/components/common/config/hooks/useJournalInlineEditListDrawerHandler";

//draw items


const JournalEditListScreen = ({
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
  const {onOpen, onClose} = useJournalInlineEditListDrawerHandler(setDrawerOpen, setDrawerItem);

  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions()

  const dispatch = useDispatch();
  
    
  const {
    loadMore,
    loadJournals,
    basicParams,
    searchResult: journals,
    setSearch,
    search,
    reSearch,
  } = useJournalsSearchCollection(initialLoadSize, rootLanguage)
    
  

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(journalsLoading);
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
        <View style={[layoutStyles.page, layoutStyles.paddingMob20, cmsStyles?.journalEditList, style]}>
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
            title={showTitle ? text("journalEditList.title")[0] || "Journals" : ""}
            // preamble={showPreamble ? text("journalEditList.preamble")[0] || "All journals" : ""}
            navigation={navigation}
            addNewDestination="JournalEdit"
            addNewParams={{ journalId: "new",  }}
            hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
            newEnabled={!drawerOpen && newEnabled}
            
            handleDrawerOpen={handleDrawerOpen}
            style={style}
            aboveResultsLeftComponents={
              
                <View />
              
            }
            
          />
          

          <ListBody
            navigation={navigation}
            route={route}
            listItems={journals}
            loading={loading}
            style={style}
            basicParams={basicParams}
            loadMore={loadMore}
            doLoad={loadJournals}
            destination={"JournalEdit"}
            // orderBy={['Order', ]}
            paramKey="journalId"
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleClose}
            
            
            
          />
          
          </ScrollView>
        </View>
      </WebFadeIn>} rightItem={
        <>
          {drawerItem === 0 && <JournalEdit navigation={navigation} route={route} showHeader={false}/>}
          
        </>
      } 
      />
  );
};

export default JournalEditListScreen;
