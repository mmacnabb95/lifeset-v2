/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  workoutLoading,
  getWorkout,
  workoutSelector,
} from "src/redux/domain/features/workout/collection-slice";

import { Workout } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const WorkoutViewScreen = ({
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
  const { workoutId } = route.params;
  const loading = useSelector(workoutLoading);
  const workout: Workout = useSelector(
    workoutSelector(workoutId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (workoutId !== "new") {
        dispatch(getWorkout(workoutId));
      }
    }, [dispatch, workoutId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.workout]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !workout && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"Workout"}
                navigation={navigation}
                route={route}
                source={workout}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={workout?.Title || workout?.Name} />
              
              { workout?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={workout?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={workout?.Article || workout?.Description || workout?.Text} />
              <Slot
                index={'last'}
                componentName={"Workout"}
                navigation={navigation}
                route={route}
                source={workout}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default WorkoutViewScreen;


