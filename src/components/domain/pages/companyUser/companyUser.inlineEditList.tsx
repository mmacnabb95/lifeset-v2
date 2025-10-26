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
import { clearCompanyUserItems } from "src/redux/domain/features/companyUser/collection-slice";
import { deleteCompanyUser, updateCompanyUser } from "src/redux/domain/features/companyUser/item-slice";
import { Companyuser } from "../../../../../../types/domain/flat-types";
import { useCompanyUserCollection } from "src/redux/domain/features/companyUser/useCompanyUserCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useCompanyUsersSearchCollection } from "src/redux/domain/features/companyUser/useCompanyUserSearchCollection";
import { companyUsersLoading } from "src/redux/domain/features/companyUser/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import CompanyUserEdit from "src/components/domain/pages/companyUser/companyUser.edit"
import { SafeAreaView } from 'react-native-safe-area-context';


import { useFocusEffect } from "@react-navigation/native";

import TextSearch from "src/redux/domain/features/companyUser/textSearch";


import { useCompanyUserInlineEditListDrawerHandler } from "src/components/common/config/hooks/useCompanyUserInlineEditListDrawerHandler";

//draw items


const CompanyUserEditListScreen = ({
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
  const {onOpen, onClose} = useCompanyUserInlineEditListDrawerHandler(setDrawerOpen, setDrawerItem);

  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions()

  const dispatch = useDispatch();
  
    
  const { companyId,  } = route.params; //lessonId === "new" ? undefined : lessonId, 1
  const {
    loadMore,
    loadCompanyUsers,
    basicParams,
    searchResult: companyUsers,
    setSearch,
    search,
    reSearch,
  } = useCompanyUsersSearchCollection(companyId === "new" ? undefined : companyId, 100, undefined, );
    
  

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(companyUsersLoading);
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
        <View style={[layoutStyles.page, layoutStyles.paddingMob20, cmsStyles?.companyUserEditList, style]}>
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
            title={showTitle ? text("companyUserEditList.title")[0] || "CompanyUsers" : ""}
            // preamble={showPreamble ? text("companyUserEditList.preamble")[0] || "All companyusers" : ""}
            navigation={navigation}
            addNewDestination="CompanyUserEdit"
            addNewParams={{ companyUserId: "new", companyId,  }}
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
                loadCompanyUsers={loadCompanyUsers}
              />}
            
          />
          

          <ListBody
            navigation={navigation}
            route={route}
            listItems={companyUsers}
            loading={loading}
            style={style}
            basicParams={basicParams}
            loadMore={loadMore}
            doLoad={loadCompanyUsers}
            destination={"CompanyUserEdit"}
            // orderBy={['Order',  'Email']}
            paramKey="companyUserId"
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleClose}
            
            
            
          />
          
          </ScrollView>
        </View>
      </WebFadeIn>} rightItem={
        <>
          {drawerItem === 0 && <CompanyUserEdit navigation={navigation} route={route} showHeader={false}/>}
          
        </>
      } 
      />
  );
};

export default CompanyUserEditListScreen;
