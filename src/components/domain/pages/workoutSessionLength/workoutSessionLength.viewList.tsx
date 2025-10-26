/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from "react";
import {
  Icon,
  Header,
  ListBody,
  Typography,
  WebFadeIn,
  AddNew,
} from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import commonConstants from "src/themes/constants";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles =
  require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;
import { Animated, View } from "react-native";
import { useWindowDimensions, Pressable, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { clearWorkoutSessionLengthItems } from "src/redux/domain/features/workoutSessionLength/collection-slice";
// import { deleteWorkoutSessionLength, updateWorkoutSessionLength } from "src/redux/domain/features/workoutSessionLength/item-slice";
import { Workoutsessionlength } from "../../../../../../types/domain/flat-types";
import { useWorkoutSessionLengthCollection } from "src/redux/domain/features/workoutSessionLength/useWorkoutSessionLengthCollection";
import { initialLoadSize, rootLanguage } from "src/utils";
import { useWorkoutSessionLengthsSearchCollection } from "src/redux/domain/features/workoutSessionLength/useWorkoutSessionLengthSearchCollection";
import { workoutSessionLengthsLoading } from "src/redux/domain/features/workoutSessionLength/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import { useOnScrollContainerCloseToBottom } from "src/utils";
import { useViewListConfig } from "src/components/common/config/formInjection/getAppendees";
import { fireMediumHapticFeedback } from "src/utils/haptics";

import { useFocusEffect } from "@react-navigation/native";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const WorkoutSessionLengthViewListScreen = ({
  navigation,
  route,
  showTitle = true,
  // showPreamble = true,
  hideGoBack,
  style,
  contentStyle,
  fadeIn = true,
  parentPageIsCloseToBottomOfScroll,
  scrollEnabled = true,
  destination = "WorkoutSessionLengthView",
  customListComponent = false,
}: {
  navigation: any;
  route?: any;
  showTitle?: boolean;
  // showPreamble?: boolean;
  hideGoBack?: boolean;
  style?: any;
  contentStyle?: any;
  fadeIn?: boolean;
  parentPageIsCloseToBottomOfScroll?: boolean;
  scrollEnabled?: boolean;
  destination?: string;
  customListComponent?: any;
}) => {
  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions();
  const { userId } = useUserInfo();
  const viewListConfig = useViewListConfig("WorkoutSessionLength", route);

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
    loadWorkoutSessionLengths,
    basicParams,
    searchResult: workoutSessionLengths,
    Filters,
  } = useWorkoutSessionLengthsSearchCollection(initialLoadSize);

  const { scrollCallback } = useOnScrollContainerCloseToBottom({
    parentPageIsCloseToBottomOfScroll,
    onScrollContainerCloseToBottom: loadMore,
  });

  const loading = useSelector(workoutSessionLengthsLoading);
  const { text } = useTranslation();

  const getSubText = (item: any): string | JSX.Element | undefined => {
    if (item?.Description || item?.Text) {
      const text =
        item?.Introduction || item?.Description || item?.Text || item?.Article;
      return (
        <>
          <Typography
            type={TypographyTypes.Body1}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={text.replace(/\n/g, " ")}
          />
        </>
      );
    } else if (item?.category?.Name)
      return (
        <>
          <Typography type={TypographyTypes.Body1} text={"Category:"} />
          <Typography type={TypographyTypes.Body1} text={item.category.Name} />
        </>
      );
  };

  return (
    <WebFadeIn off={!fadeIn} style={style} background={true}>
      <View
        style={[
          layoutStyles.page,
          layoutStyles.paddingMob20,
          layoutStyles.parentViewList,
          cmsStyles?.workoutSessionLengthViewList,
          style,
        ]}
      >
        <ScrollView
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          style={[layoutStyles.scrollViewContainer]}
          contentContainerStyle={[
            layoutStyles.body,
            cmsStyles?.workoutSessionLengthViewListContentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollCallback}
          scrollEventThrottle={1000}
        >
          <Header
            title={
              showTitle
                ? text("workoutSessionLengthViewList.title")[0] ||
                  "WorkoutSessionLengths"
                : ""
            }
            preamble={text("workoutSessionLengthViewList.preamble")[0] || ""}
            navigation={navigation}
            addNewDestination={undefined}
            hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
            newEnabled={false}
            style={[
              style,
              layoutStyles.viewListHeaderStyle,
              cmsStyles?.workoutSessionLengthViewListHeaderStyle,
            ]}
            titleStyle={cmsStyles?.workoutSessionLengthViewListTitleStyle}
          />

          <Animated.View
            style={[
              {
                height: viewListConfig?.initialFilterHeight || filterHeight,
                overflow: "hidden",
              },
            ]}
          >
            <View
              style={{
                paddingLeft: 5,
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: "auto",
              }}
            >
              <Filters
                hidden={viewListConfig?.hidden}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  if (height > filterTargetHeight) {
                    setFilterTargetHeight(height);
                  }
                }}
              />
            </View>
          </Animated.View>
          <ListBody
            navigation={navigation}
            route={route}
            listItems={workoutSessionLengths}
            mode="view"
            loading={loading}
            style={style}
            contentStyle={contentStyle}
            basicParams={basicParams}
            loadMore={loadMore}
            doLoad={loadWorkoutSessionLengths}
            destination={destination}
            orderBy={["Order"]}
            paramKey="workoutSessionLengthId"
            customListComponent={customListComponent}
          />
        </ScrollView>
      </View>
    </WebFadeIn>
  );
};

export default WorkoutSessionLengthViewListScreen;
