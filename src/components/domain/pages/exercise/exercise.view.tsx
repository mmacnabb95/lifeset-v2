/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  exerciseLoading,
  getExercise,
  exerciseSelector,
} from "src/redux/domain/features/exercise/collection-slice";

import { dynamicSelOptsLoading } from "src/redux/domain/features/dynamicSelOpt/collection-slice";
import { useDynamicSelOptCollection } from "src/redux/domain/features/dynamicSelOpt/useDynamicSelOptCollection";

import { Exercise } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const ExerciseViewScreen = ({
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
  const { exerciseId } = route.params;
  const loading = useSelector(exerciseLoading);
  const exercise: Exercise = useSelector(
    exerciseSelector(exerciseId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  
  const { results: exercises } = useDynamicSelOptCollection(exerciseId);
  const resourcesLoading = useSelector(dynamicSelOptsLoading);
  

  useFocusEffect(
    React.useCallback(() => {
      if (exerciseId !== "new") {
        dispatch(getExercise(exerciseId));
      }
    }, [dispatch, exerciseId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.exercise]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !exercise && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"Exercise"}
                navigation={navigation}
                route={route}
                source={exercise}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={exercise?.Title || exercise?.Name} />
              
              { exercise?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={exercise?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={exercise?.Article || exercise?.Description || exercise?.Text} />
              <Slot
                index={'last'}
                componentName={"Exercise"}
                navigation={navigation}
                route={route}
                source={exercise}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default ExerciseViewScreen;


