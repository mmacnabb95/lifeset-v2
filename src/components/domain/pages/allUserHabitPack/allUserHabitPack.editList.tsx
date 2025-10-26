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
import { clearAllUserHabitPackItems } from "src/redux/domain/features/allUserHabitPack/collection-slice";
// import { deleteAllUserHabitPack, updateAllUserHabitPack } from "src/redux/domain/features/allUserHabitPack/item-slice";
import { Alluserhabitpack } from "../../../../../../types/domain/flat-types";
import { useAllUserHabitPackCollection } from "src/redux/domain/features/allUserHabitPack/useAllUserHabitPackCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useAllUserHabitPacksSearchCollection } from "src/redux/domain/features/allUserHabitPack/useAllUserHabitPackSearchCollection";
import { allUserHabitPacksLoading } from "src/redux/domain/features/allUserHabitPack/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import { useEditListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";




import { useFocusEffect } from "@react-navigation/native";
import TextSearch from "src/redux/domain/features/allUserHabitPack/textSearch";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const AllUserHabitPackEditListScreen = ({
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
  destination = "AllUserHabitPackEdit",
  
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
  const editListConfig = useEditListConfig("AllUserHabitPack", route);

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
    loadAllUserHabitPacks,
    basicParams,
    searchResult: allUserHabitPacks,
    Filters
  } = useAllUserHabitPacksSearchCollection(initialLoadSize)
    

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(allUserHabitPacksLoading);
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
      <View style={[layoutStyles.page, layoutStyles.paddingMob20, layoutStyles.parentEditList, cmsStyles?.allUserHabitPackEditList, style]}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[layoutStyles.body,cmsStyles?.allUserHabitPackEditListContentContainerStyle ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
        <Header
          title={showTitle ? text("allUserHabitPackEditList.title")[0] || "All user habit packs" : ""}
          preamble={text("allUserHabitPackEditList.preamble")[0] || ""}
          navigation={navigation}
          addNewDestination={route.params?.viewOnly || newPosition === "bottom" ? undefined :"AllUserHabitPackEdit"}
          addNewParams={{ allUserHabitPackId: "new" }}
          
          hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
          newEnabled={newEnabled}
          style={[style, layoutStyles.editListHeaderStyle, cmsStyles?.allUserHabitPackEditListHeaderStyle]}
          titleStyle={[layoutStyles.parentListPageTitle, cmsStyles?.allUserHabitPackEditListTitleStyle]}
          underHeaderComponents={
            <View style={layoutStyles.searchSection}>
            <TextSearch
              navigation={navigation}
              loadAllUserHabitPacks={loadAllUserHabitPacks}
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
          listItems={allUserHabitPacks}
          loading={loading}
          style={style}
          contentStyle={contentStyle}
          basicParams={basicParams}
          loadMore={loadMore}
          doLoad={loadAllUserHabitPacks}
          destination={destination}
          orderBy={['Order', ]}
          paramKey="allUserHabitPackId"
          
          
          
        />
        
        </ScrollView>
        {!route.params?.viewOnly && newPosition === "bottom" && (
          <AddNew
            destinationScreen={route.params?.viewOnly ? "" : "AllUserHabitPackEdit"}
            params={{ allUserHabitPackId: "new" }}
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

export default AllUserHabitPackEditListScreen;
