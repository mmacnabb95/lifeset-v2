/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Slot } from "src/components/common/config/slot/slot";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import {
  todoListJournalLoading,
  getTodoListJournal,
  todoListJournalSelector,
} from "src/redux/domain/features/todoListJournal/collection-slice";

import { Todolistjournal } from "../../../../../../types/domain/flat-types";
import { useTranslation } from "src/translations/useTranslation";
import {useOnScrollContainerCloseToBottom} from 'src/utils'

import {Body, Header, Typography, WebFadeIn} from "src/components/common";
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import {TypographyTypes} from "../../../common/typography";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;

const TodoListJournalViewScreen = ({
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
  const { todoListJournalId } = route.params;
  const loading = useSelector(todoListJournalLoading);
  const todoListJournal: Todolistjournal = useSelector(
    todoListJournalSelector(todoListJournalId),
  );
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  

  useFocusEffect(
    React.useCallback(() => {
      if (todoListJournalId !== "new") {
        dispatch(getTodoListJournal(todoListJournalId));
      }
    }, [dispatch, todoListJournalId]),
  );

  const {scrollCallback, isCloseToBottom} = useOnScrollContainerCloseToBottom();



  return (
    <WebFadeIn>
      <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, cmsStyles?.todoListJournal]]}>
        <Header style={[formStyles.form]} backButtonStyle={{}} navigation={navigation} />
        <Body  onScrollCallback={scrollCallback}>
          <View style={[formStyles.form, {flexGrow: 1}]}>
            {loading && !todoListJournal && <Text>{text("common.loading")}...</Text>}
            
            <View style={[videoFullScreen ? {} : [layoutStyles.itemPage]]}>
              <Slot
                index={'first'}
                componentName={"TodoListJournal"}
                navigation={navigation}
                route={route}
                source={todoListJournal}
              />
              <Typography type={TypographyTypes.H1} style={[cmsStyles.title, layoutStyles.title]} text={todoListJournal?.Title || todoListJournal?.Name} />
              
              { todoListJournal?.Introduction && (
                <Typography type={TypographyTypes.Body1} style={[cmsStyles.intro, layoutStyles.intro]} text={todoListJournal?.Introduction} />
              )}
              
              <Typography type={TypographyTypes.Body1} style={[cmsStyles.article, layoutStyles.article]} text={todoListJournal?.Article || todoListJournal?.Description || todoListJournal?.Text} />
              <Slot
                index={'last'}
                componentName={"TodoListJournal"}
                navigation={navigation}
                route={route}
                source={todoListJournal}
                parentPageIsCloseToBottomOfScroll={isCloseToBottom}
              />
            </View>
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default TodoListJournalViewScreen;


