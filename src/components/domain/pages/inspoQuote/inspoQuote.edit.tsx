/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import InspoQuoteForm, { defaultTextValues } from "src/components/domain/inspoQuote/inspoQuote.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearInspoQuoteItems, createInspoQuote, updateInspoQuote } from "src/redux/domain/features/inspoQuote/collection-slice";
import {
  getInspoQuote,
  inspoQuoteLoading,
  inspoQuoteSelector,
} from "src/redux/domain/features/inspoQuote/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import { Inspoquote } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;



const InspoQuoteEditScreen = React.forwardRef(({
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
  const { viewOnly, inspoQuoteId,  } = route.params;
  const inspoQuote: Inspoquote = useSelector(
    inspoQuoteSelector(inspoQuoteId === "new" ? -1 : inspoQuoteId),
  );
  const loading = useSelector(inspoQuoteLoading);
  const [wasNew, setWasNew] = useState(inspoQuoteId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("InspoQuote", inspoQuote, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (inspoQuoteId !== "new" && wasNew === false) {
         dispatch(getInspoQuote(inspoQuoteId));
      }
    }, [dispatch, inspoQuoteId, wasNew]),
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
  getAppendees("InspoQuote", fieldAppendees, inspoQuote, formRef, navigation, route);

  

  

  

  return (
    <>
      <WebFadeIn background={true}>
        <View style={[[layoutStyles.page, layoutStyles.parentEditPage, cmsStyles?.inspoQuoteEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.inspoQuoteEditPageBody]}>
            <>
              
              {(inspoQuoteId === "new" || (inspoQuote !== undefined && inspoQuote !== "")) && (
                <InspoQuoteForm
                  ref={formRef}
                  key={inspoQuoteId}
                  fieldAppendees={fieldAppendees}
                  formItem={inspoQuote || formConfig?.default}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                      navigation.setParams({inspoQuoteId: response.payload.Id});
                      setAlertTitle(t("inspoQuote.onCreated") || "Inspo Quote created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("inspoQuote.onUpdated") || "Inspo Quote updated");
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
                      setAlertTitle(t("inspoQuote.onDeleted") || "Inspo Quote deleted");
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
              {(loading && (inspoQuote === undefined || inspoQuote === "")) &&
                inspoQuoteId !== "new" && (
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
        title={t("inspoQuote.deleteWarningTitle") || "Delete Inspo Quote"}
        text={t("inspoQuote.deleteWarningText") || "Are you sure you want to delete this Inspo Quote?"}
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

export default InspoQuoteEditScreen;
