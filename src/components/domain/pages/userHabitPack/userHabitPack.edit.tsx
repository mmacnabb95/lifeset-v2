/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import UserHabitPackForm, { defaultTextValues } from "src/components/domain/userHabitPack/userHabitPack.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearUserHabitPackItems, createUserHabitPack, updateUserHabitPack } from "src/redux/domain/features/userHabitPack/collection-slice";
import {
  getUserHabitPack,
  userHabitPackLoading,
  userHabitPackSelector,
} from "src/redux/domain/features/userHabitPack/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import UserHabitPackHabitEditListScreen from "../userHabitPackHabit/userHabitPackHabit.editList";

import { Userhabitpack } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;



const UserHabitPackEditScreen = React.forwardRef(({
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
  const { viewOnly, userHabitPackId,  } = route.params;
  const userHabitPack: Userhabitpack = useSelector(
    userHabitPackSelector(userHabitPackId === "new" ? -1 : userHabitPackId),
  );
  const loading = useSelector(userHabitPackLoading);
  const [wasNew, setWasNew] = useState(userHabitPackId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("UserHabitPack", userHabitPack, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (userHabitPackId !== "new" && wasNew === false) {
         dispatch(getUserHabitPack(userHabitPackId));
      }
    }, [dispatch, userHabitPackId, wasNew]),
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
  getAppendees("UserHabitPack", fieldAppendees, userHabitPack, formRef, navigation, route);

  

  fieldAppendees.push({
    fieldName: defaultTextValues[defaultTextValues.length > 1 ? defaultTextValues.length - 1 : 0].propertyName,
    el: (
      <>
        
        <UserHabitPackHabitEditListScreen
          key={`sublist_${userHabitPackId}_0`}
          navigation={navigation}
          style={layoutStyles.subList}
          hideGoBack={true}
          showTitle={true}
          route={route}
          newEnabled={userHabitPackId !== "new" && !formConfig?.viewOnly}
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
        <View style={[[layoutStyles.page, layoutStyles.parentEditPage, cmsStyles?.userHabitPackEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.userHabitPackEditPageBody]}>
            <>
              
              {(userHabitPackId === "new" || (userHabitPack !== undefined && userHabitPack !== "")) && (
                <UserHabitPackForm
                  ref={formRef}
                  key={userHabitPackId}
                  fieldAppendees={fieldAppendees}
                  formItem={userHabitPack || formConfig?.default || {User: userId, }}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                      navigation.setParams({userHabitPackId: response.payload.Id});
                      setAlertTitle(t("userHabitPack.onCreated") || "User Habit Pack created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("userHabitPack.onUpdated") || "User Habit Pack updated");
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
                      setAlertTitle(t("userHabitPack.onDeleted") || "User Habit Pack deleted");
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
              {(loading && (userHabitPack === undefined || userHabitPack === "")) &&
                userHabitPackId !== "new" && (
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
        title={t("userHabitPack.deleteWarningTitle") || "Delete User Habit Pack"}
        text={t("userHabitPack.deleteWarningText") || "Are you sure you want to delete this User Habit Pack?"}
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

export default UserHabitPackEditScreen;
