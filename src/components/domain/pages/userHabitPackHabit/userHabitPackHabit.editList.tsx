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
import { clearUserHabitPackHabitItems } from "src/redux/domain/features/userHabitPackHabit/collection-slice";
// import { deleteUserHabitPackHabit, updateUserHabitPackHabit } from "src/redux/domain/features/userHabitPackHabit/item-slice";
import { Userhabitpackhabit } from "../../../../../../types/domain/flat-types";
import { useUserHabitPackHabitCollection } from "src/redux/domain/features/userHabitPackHabit/useUserHabitPackHabitCollection";
import { initialLoadSize, rootLanguage } from "src/utils"
import { useUserHabitPackHabitsSearchCollection } from "src/redux/domain/features/userHabitPackHabit/useUserHabitPackHabitSearchCollection";
import { userHabitPackHabitsLoading } from "src/redux/domain/features/userHabitPackHabit/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'
import { useEditListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";




import { useFocusEffect } from "@react-navigation/native";
import TextSearch from "src/redux/domain/features/userHabitPackHabit/textSearch";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const UserHabitPackHabitEditListScreen = ({
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
  destination = "UserHabitPackHabitEdit",
  
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
  const editListConfig = useEditListConfig("UserHabitPackHabit", route);

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
  
  const { userHabitPackId } = route.params;
  // const { results: userHabitPackHabits, Refresh, initialised } = useUserHabitPackHabitCollection(userHabitPackId === "new" ? undefined : userHabitPackId, 100);
  
  
  
  const {
    loadMore,
    loadUserHabitPackHabits,
    basicParams,
    searchResult: userHabitPackHabits,
    Filters,
  } = useUserHabitPackHabitsSearchCollection(userHabitPackId === "new" ? undefined : userHabitPackId, initialLoadSize, undefined, );
    

      const {scrollCallback} = useOnScrollContainerCloseToBottom({
        parentPageIsCloseToBottomOfScroll,
        onScrollContainerCloseToBottom: loadMore,
      });


  const loading = useSelector(userHabitPackHabitsLoading);
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
      <View style={[layoutStyles.page, layoutStyles.paddingMob20, layoutStyles.childSubList, cmsStyles?.userHabitPackHabitEditList, style]}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[layoutStyles.body, layoutStyles.childSubListScrollContent, cmsStyles?.userHabitPackHabitEditListContentContainerStyle ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
        <Header
          title={showTitle ? text("userHabitPackHabitEditList.title")[0] || "User habit pack habits" : ""}
          preamble={text("userHabitPackHabitEditList.preamble")[0] || ""}
          navigation={navigation}
          addNewDestination={route.params?.viewOnly || newPosition === "bottom" ? undefined :"UserHabitPackHabitEdit"}
          addNewParams={{ userHabitPackHabitId: "new", userHabitPackId }}
          
          hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
          newEnabled={newEnabled}
          style={[style, cmsStyles?.userHabitPackHabitEditListHeaderStyle]}
          titleStyle={[layoutStyles.childSubListPageTitle, cmsStyles?.userHabitPackHabitEditListTitleStyle]}
          
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
          listItems={userHabitPackHabits}
          loading={loading}
          style={style}
          contentStyle={contentStyle}
          basicParams={basicParams}
          loadMore={loadMore}
          doLoad={loadUserHabitPackHabits}
          destination={destination}
          orderBy={['Order',  'Name']}
          paramKey="userHabitPackHabitId"
          
          
          
        />
        
        </ScrollView>
        {!route.params?.viewOnly && newPosition === "bottom" && (
          <AddNew
            destinationScreen={route.params?.viewOnly ? "" : "UserHabitPackHabitEdit"}
            params={{ userHabitPackHabitId: "new" }}
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

export default UserHabitPackHabitEditListScreen;
