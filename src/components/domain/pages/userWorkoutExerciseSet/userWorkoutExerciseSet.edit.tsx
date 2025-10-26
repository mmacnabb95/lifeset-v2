/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import UserWorkoutExerciseSetForm, { defaultTextValues } from "src/components/domain/userWorkoutExerciseSet/userWorkoutExerciseSet.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearUserWorkoutExerciseSetItems, createUserWorkoutExerciseSet, updateUserWorkoutExerciseSet } from "src/redux/domain/features/userWorkoutExerciseSet/collection-slice";
import {
  getUserWorkoutExerciseSet,
  userWorkoutExerciseSetLoading,
  userWorkoutExerciseSetSelector,
} from "src/redux/domain/features/userWorkoutExerciseSet/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import { Userworkoutexerciseset } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;



const UserWorkoutExerciseSetEditScreen = React.forwardRef(({
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
  const { viewOnly, userWorkoutExerciseSetId, userWorkoutId,  } = route.params;
  const userWorkoutExerciseSet: Userworkoutexerciseset = useSelector(
    userWorkoutExerciseSetSelector(userWorkoutExerciseSetId === "new" ? -1 : userWorkoutExerciseSetId),
  );
  const loading = useSelector(userWorkoutExerciseSetLoading);
  const [wasNew, setWasNew] = useState(userWorkoutExerciseSetId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("UserWorkoutExerciseSet", userWorkoutExerciseSet, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (userWorkoutExerciseSetId !== "new" && wasNew === false) {
         dispatch(getUserWorkoutExerciseSet(userWorkoutExerciseSetId));
      }
    }, [dispatch, userWorkoutExerciseSetId, wasNew]),
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
  getAppendees("UserWorkoutExerciseSet", fieldAppendees, userWorkoutExerciseSet, formRef, navigation, route);

  

  

  

  return (
    <>
      <WebFadeIn background={true}>
        <View style={[[layoutStyles.page, cmsStyles?.userWorkoutExerciseSetEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.userWorkoutExerciseSetEditPageBody]}>
            <>
              
              {(userWorkoutExerciseSetId === "new" || (userWorkoutExerciseSet !== undefined && userWorkoutExerciseSet !== "")) && (
                <UserWorkoutExerciseSetForm
                  ref={formRef}
                  key={userWorkoutExerciseSetId}
                  fieldAppendees={fieldAppendees}
                  formItem={userWorkoutExerciseSet || formConfig?.default || {UserWorkout: userWorkoutId, }}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                      navigation.setParams({userWorkoutExerciseSetId: response.payload.Id});
                      setAlertTitle(t("userWorkoutExerciseSet.onCreated") || "User Workout Exercise Set created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("userWorkoutExerciseSet.onUpdated") || "User Workout Exercise Set updated");
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
                      setAlertTitle(t("userWorkoutExerciseSet.onDeleted") || "User Workout Exercise Set deleted");
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
              {(loading && (userWorkoutExerciseSet === undefined || userWorkoutExerciseSet === "")) &&
                userWorkoutExerciseSetId !== "new" && (
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
        title={t("userWorkoutExerciseSet.deleteWarningTitle") || "Delete User Workout Exercise Set"}
        text={t("userWorkoutExerciseSet.deleteWarningText") || "Are you sure you want to delete this User Workout Exercise Set?"}
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

export default UserWorkoutExerciseSetEditScreen;
