/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import WorkoutDayExerciseForm, { defaultTextValues } from "src/components/domain/workoutDayExercise/workoutDayExercise.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearWorkoutDayExerciseItems, createWorkoutDayExercise, updateWorkoutDayExercise } from "src/redux/domain/features/workoutDayExercise/collection-slice";
import {
  getWorkoutDayExercise,
  workoutDayExerciseLoading,
  workoutDayExerciseSelector,
} from "src/redux/domain/features/workoutDayExercise/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import WorkoutExerciseSetEditListScreen from "../workoutExerciseSet/workoutExerciseSet.editList";

import { Workoutdayexercise } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;



const WorkoutDayExerciseEditScreen = React.forwardRef(({
  navigation,
  route,
  showHeader = true,
  hideButtons = false,
  hideDeleteButton = false,
  buttonsTop = false,
}: {
  navigation: any;
  route: any;
    showHeader?: boolean;
    hideButtons?: boolean;
    hideDeleteButton?: boolean;
    buttonsTop?: boolean;
  
}, ref) => {

    const layoutStyles = useLayoutStyles();
    const cmsStyles = useCmsStyles();
    const commonTypographyStyles = useCommonTypographyStyles();

    const _urlEndpoint = useSelector(
      clientEnvironmentSelector(ClientEnvironement.REACT_APP_IMAGEKIT_ENDPOINT),
    );
    const urlEndpoint = _urlEndpoint?.Value || "_";


  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { userId } = useUserInfo();
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  const { viewOnly, workoutDayExerciseId, workoutDayId,  } = route.params;
  const workoutDayExercise: Workoutdayexercise = useSelector(
    workoutDayExerciseSelector(workoutDayExerciseId === "new" ? -1 : workoutDayExerciseId),
  );
  const loading = useSelector(workoutDayExerciseLoading);
  const [wasNew, setWasNew] = useState(workoutDayExerciseId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("WorkoutDayExercise", workoutDayExercise, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (workoutDayExerciseId !== "new" && wasNew === false) {
         dispatch(getWorkoutDayExercise(workoutDayExerciseId));
      }
    }, [dispatch, workoutDayExerciseId, wasNew]),
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setWasNew(false);
      };
    }, []),
  );

  

  const handleError = (response: any) => {
    if (response?.meta?.requestStatus !== "fulfilled") {
      setAlertTitle(response?.error?.message || 'Error')
      setIsAlertOpen(true)
      return true;
    }
    return false;
  };

  const fieldAppendees: {el: ReactNode, fieldName: string}[] = [];
  getAppendees("WorkoutDayExercise", fieldAppendees, workoutDayExercise, formRef, navigation, route);

  

  fieldAppendees.push({
    fieldName: defaultTextValues[defaultTextValues.length > 1 ? defaultTextValues.length - 1 : 0].propertyName,
    el: (
      <>
        
        <WorkoutExerciseSetEditListScreen
          key={`sublist_${workoutDayExerciseId}_0`}
          navigation={navigation}
          style={layoutStyles.subList}
          hideGoBack={true}
          showTitle={true}
          route={route}
          newEnabled={workoutDayExerciseId !== "new" && !formConfig?.viewOnly}
          fadeIn={false}
          setScrollEnabled={setScrollEnabled}
          scrollEnabled={false}
        />
      </>
    ),
  });

  

  return (
    <>
      <WebFadeIn background={true}>
        <View style={[[layoutStyles.page, cmsStyles?.workoutDayExerciseEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.workoutDayExerciseEditPageBody]}>
            <>
              
              {(workoutDayExerciseId === "new" || (workoutDayExercise !== undefined && workoutDayExercise !== "")) && (
                <WorkoutDayExerciseForm
                  ref={formRef}
                  key={workoutDayExerciseId}
                  fieldAppendees={fieldAppendees}
                  formItem={workoutDayExercise || formConfig?.default || {WorkoutDay: workoutDayId, }}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                      navigation.setParams({workoutDayExerciseId: response.payload.Id});
                      setAlertTitle(t("workoutDayExercise.onCreated") || "Workout Day Exercise created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("workoutDayExercise.onUpdated") || "Workout Day Exercise updated");
                      setAlertIcon("check");
                      if (formConfig?.onUpdated) {
                        formConfig.onUpdated(navigation);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  
                  beforeDelete={async () => {
                    setIsDeleteModalOpen(true);
                    isDelete.current = undefined;
                    while(isDelete.current === undefined) {
                      await new Promise(r => setTimeout(r, 500));
                    }
                    if (isDelete.current === true) {
                      isDelete.current = false;
                      return true;
                    }
                    return isDelete.current
                  }}
                  afterDelete={(response) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("workoutDayExercise.onDeleted") || "Workout Day Exercise deleted");
                      setAlertIcon("check");
                      setIsAlertOpen(true);
                      if (formConfig?.onDeleted) {
                        formConfig.onDeleted(navigation);
                      } else { 
                        setTimeout(() => navigation.goBack(), 2000);
                      }
                    }
                  }}
                  {...formConfig}
                />
              )}
              {(loading && (workoutDayExercise === undefined || workoutDayExercise === "")) &&
                workoutDayExerciseId !== "new" && (
                  <View>
                    <Text>{t("common.loading")}...</Text>
                  </View>
              )}
            </>
          </Body>
        </View>
      </WebFadeIn>
      <Modal
        visible={isDeleteModalOpen}
        title={t("workoutDayExercise.deleteWarningTitle") || "Delete Workout Day Exercise"}
        text={t("workoutDayExercise.deleteWarningText") || "Are you sure you want to delete this Workout Day Exercise?"}
        acceptButton={(
          <Button
            title="Delete"
            onPress={() => {
              setIsDeleteModalOpen(false)
              isDelete.current = true
            }}
          />
        )}
        declineButton={(
          <Button
            title="Cancel"
            type={ButtonTypes.Secondary}
            titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
            onPress={() => {
              setIsDeleteModalOpen(false)
              isDelete.current = false
            }}
          />
        )}
      />
      <Modal
        icon={alertIcon}
        visible={isAlertOpen}
        title={alertTitle}
        acceptButton={(
          <Button
            type={ButtonTypes.Primary}
            title="Ok"
            onPress={() => {
              setIsAlertOpen(false);
              setTimeout(() => {
                setAlertIcon(undefined);
                setAlertTitle("");
              }, 1000); //fading modal needs to wait
              if(formConfig?.onAlertClosed) formConfig.onAlertClosed(navigation);
            }}
          />
        )}
      />
    </>
  );
});

export default WorkoutDayExerciseEditScreen;
