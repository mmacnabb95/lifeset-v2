/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  workoutExerciseSetLoading,
  getWorkoutExerciseSet,
  workoutExerciseSetSelector,
} from "src/redux/domain/features/workoutExerciseSet/collection-slice";

import { Workoutexerciseset } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const WorkoutExerciseSetViewScreen = ({
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
  const { workoutExerciseSetId } = route.params;
  const loading = useSelector(workoutExerciseSetLoading);
  const workoutExerciseSet: Workoutexerciseset = useSelector(
    workoutExerciseSetSelector(workoutExerciseSetId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (workoutExerciseSetId !== "new") {
        dispatch(getWorkoutExerciseSet(workoutExerciseSetId));
      }
    }, [dispatch, workoutExerciseSetId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.workoutExerciseSet]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !workoutExerciseSet && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"WorkoutExerciseSet"}
                navigation={navigation}
                route={route}
                source={workoutExerciseSet}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={workoutExerciseSet?.Title || workoutExerciseSet?.Name} />
              
              { workoutExerciseSet?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={workoutExerciseSet?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={workoutExerciseSet?.Article || workoutExerciseSet?.Description || workoutExerciseSet?.Text} />
              <Slot
                index={'last'}
                componentName={"WorkoutExerciseSet"}
                navigation={navigation}
                route={route}
                source={workoutExerciseSet}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default WorkoutExerciseSetViewScreen;


