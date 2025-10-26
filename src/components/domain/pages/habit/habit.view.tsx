/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  habitLoading,
  getHabit,
  habitSelector,
} from "src/redux/domain/features/habit/collection-slice";

import { Habit } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const HabitViewScreen = ({
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
  const { habitId } = route.params;
  const loading = useSelector(habitLoading);
  const habit: Habit = useSelector(
    habitSelector(habitId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (habitId !== "new") {
        dispatch(getHabit(habitId));
      }
    }, [dispatch, habitId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.habit]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !habit && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"Habit"}
                navigation={navigation}
                route={route}
                source={habit}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={habit?.Title || habit?.Name} />
              
              { habit?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={habit?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={habit?.Article || habit?.Description || habit?.Text} />
              <Slot
                index={'last'}
                componentName={"Habit"}
                navigation={navigation}
                route={route}
                source={habit}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default HabitViewScreen;


