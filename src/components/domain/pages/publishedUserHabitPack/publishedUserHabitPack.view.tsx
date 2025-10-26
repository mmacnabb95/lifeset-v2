/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  publishedUserHabitPackLoading,
  getPublishedUserHabitPack,
  publishedUserHabitPackSelector,
} from "src/redux/domain/features/publishedUserHabitPack/collection-slice";

import { Publisheduserhabitpack } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const PublishedUserHabitPackViewScreen = ({
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
  const { publishedUserHabitPackId } = route.params;
  const loading = useSelector(publishedUserHabitPackLoading);
  const publishedUserHabitPack: Publisheduserhabitpack = useSelector(
    publishedUserHabitPackSelector(publishedUserHabitPackId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (publishedUserHabitPackId !== "new") {
        dispatch(getPublishedUserHabitPack(publishedUserHabitPackId));
      }
    }, [dispatch, publishedUserHabitPackId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.publishedUserHabitPack]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !publishedUserHabitPack && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"PublishedUserHabitPack"}
                navigation={navigation}
                route={route}
                source={publishedUserHabitPack}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={publishedUserHabitPack?.Title || publishedUserHabitPack?.Name} />
              
              { publishedUserHabitPack?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={publishedUserHabitPack?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={publishedUserHabitPack?.Article || publishedUserHabitPack?.Description || publishedUserHabitPack?.Text} />
              <Slot
                index={'last'}
                componentName={"PublishedUserHabitPack"}
                navigation={navigation}
                route={route}
                source={publishedUserHabitPack}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default PublishedUserHabitPackViewScreen;


