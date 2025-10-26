/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  publishedWorkoutLoading,
  getPublishedWorkout,
  publishedWorkoutSelector,
} from "src/redux/domain/features/publishedWorkout/collection-slice";

import { Publishedworkout } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const PublishedWorkoutViewScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();

  const dispatch = useDispatch();
  const { text } = useTranslation();
  const { publishedWorkoutId } = route.params;
  const loading = useSelector(publishedWorkoutLoading);
  const publishedWorkout: Publishedworkout = useSelector(
    publishedWorkoutSelector(publishedWorkoutId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (publishedWorkoutId !== "new") {
        dispatch(getPublishedWorkout(publishedWorkoutId));
      }
    }, [dispatch, publishedWorkoutId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.publishedWorkout]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !publishedWorkout && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"PublishedWorkout"}
                navigation={navigation}
                route={route}
                source={publishedWorkout}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={publishedWorkout?.Title || publishedWorkout?.Name} />
              
              { publishedWorkout?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={publishedWorkout?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={publishedWorkout?.Article || publishedWorkout?.Description || publishedWorkout?.Text} />
              <Slot
                index={'last'}
                componentName={"PublishedWorkout"}
                navigation={navigation}
                route={route}
                source={publishedWorkout}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default PublishedWorkoutViewScreen;


