/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import UserHabitPackHabitForm, { defaultTextValues } from "src/components/domain/userHabitPackHabit/userHabitPackHabit.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearUserHabitPackHabitItems, createUserHabitPackHabit, updateUserHabitPackHabit } from "src/redux/domain/features/userHabitPackHabit/collection-slice";
import {
  getUserHabitPackHabit,
  userHabitPackHabitLoading,
  userHabitPackHabitSelector,
} from "src/redux/domain/features/userHabitPackHabit/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import { Userhabitpackhabit } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;



const UserHabitPackHabitEditScreen = React.forwardRef(({
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
  const { viewOnly, userHabitPackHabitId, userHabitPackId,  } = route.params;
  const userHabitPackHabit: Userhabitpackhabit = useSelector(
    userHabitPackHabitSelector(userHabitPackHabitId === "new" ? -1 : userHabitPackHabitId),
  );
  const loading = useSelector(userHabitPackHabitLoading);
  const [wasNew, setWasNew] = useState(userHabitPackHabitId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("UserHabitPackHabit", userHabitPackHabit, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (userHabitPackHabitId !== "new" && wasNew === false) {
         dispatch(getUserHabitPackHabit(userHabitPackHabitId));
      }
    }, [dispatch, userHabitPackHabitId, wasNew]),
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
  getAppendees("UserHabitPackHabit", fieldAppendees, userHabitPackHabit, formRef, navigation, route);

  

  

  

  return (
    <>
      <WebFadeIn background={true}>
        <View style={[[layoutStyles.page, cmsStyles?.userHabitPackHabitEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.userHabitPackHabitEditPageBody]}>
            <>
              
              {(userHabitPackHabitId === "new" || (userHabitPackHabit !== undefined && userHabitPackHabit !== "")) && (
                <UserHabitPackHabitForm
                  ref={formRef}
                  key={userHabitPackHabitId}
                  fieldAppendees={fieldAppendees}
                  formItem={userHabitPackHabit || formConfig?.default || {UserHabitPack: userHabitPackId, }}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                      navigation.setParams({userHabitPackHabitId: response.payload.Id});
                      setAlertTitle(t("userHabitPackHabit.onCreated") || "User Habit Pack Habit created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("userHabitPackHabit.onUpdated") || "User Habit Pack Habit updated");
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
                      setAlertTitle(t("userHabitPackHabit.onDeleted") || "User Habit Pack Habit deleted");
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
              {(loading && (userHabitPackHabit === undefined || userHabitPackHabit === "")) &&
                userHabitPackHabitId !== "new" && (
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
        title={t("userHabitPackHabit.deleteWarningTitle") || "Delete User Habit Pack Habit"}
        text={t("userHabitPackHabit.deleteWarningText") || "Are you sure you want to delete this User Habit Pack Habit?"}
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

export default UserHabitPackHabitEditScreen;
