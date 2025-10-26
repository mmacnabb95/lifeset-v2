/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  userHabitPackHabitLoading,
  getUserHabitPackHabit,
  userHabitPackHabitSelector,
} from "src/redux/domain/features/userHabitPackHabit/collection-slice";

import { Userhabitpackhabit } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const UserHabitPackHabitViewScreen = ({
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
  const { userHabitPackHabitId } = route.params;
  const loading = useSelector(userHabitPackHabitLoading);
  const userHabitPackHabit: Userhabitpackhabit = useSelector(
    userHabitPackHabitSelector(userHabitPackHabitId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (userHabitPackHabitId !== "new") {
        dispatch(getUserHabitPackHabit(userHabitPackHabitId));
      }
    }, [dispatch, userHabitPackHabitId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.userHabitPackHabit]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !userHabitPackHabit && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"UserHabitPackHabit"}
                navigation={navigation}
                route={route}
                source={userHabitPackHabit}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={userHabitPackHabit?.Title || userHabitPackHabit?.Name} />
              
              { userHabitPackHabit?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={userHabitPackHabit?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={userHabitPackHabit?.Article || userHabitPackHabit?.Description || userHabitPackHabit?.Text} />
              <Slot
                index={'last'}
                componentName={"UserHabitPackHabit"}
                navigation={navigation}
                route={route}
                source={userHabitPackHabit}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default UserHabitPackHabitViewScreen;


