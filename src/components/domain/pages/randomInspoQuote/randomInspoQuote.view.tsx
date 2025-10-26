/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  randomInspoQuoteLoading,
  getRandomInspoQuote,
  randomInspoQuoteSelector,
} from "src/redux/domain/features/randomInspoQuote/collection-slice";

import { Randominspoquote } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const RandomInspoQuoteViewScreen = ({
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
  const { randomInspoQuoteId } = route.params;
  const loading = useSelector(randomInspoQuoteLoading);
  const randomInspoQuote: Randominspoquote = useSelector(
    randomInspoQuoteSelector(randomInspoQuoteId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (randomInspoQuoteId !== "new") {
        dispatch(getRandomInspoQuote(randomInspoQuoteId));
      }
    }, [dispatch, randomInspoQuoteId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.randomInspoQuote]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !randomInspoQuote && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"RandomInspoQuote"}
                navigation={navigation}
                route={route}
                source={randomInspoQuote}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={randomInspoQuote?.Title || randomInspoQuote?.Name} />
              
              { randomInspoQuote?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={randomInspoQuote?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={randomInspoQuote?.Article || randomInspoQuote?.Description || randomInspoQuote?.Text} />
              <Slot
                index={'last'}
                componentName={"RandomInspoQuote"}
                navigation={navigation}
                route={route}
                source={randomInspoQuote}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default RandomInspoQuoteViewScreen;


