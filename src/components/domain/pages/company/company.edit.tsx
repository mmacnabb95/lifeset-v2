/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, ReactNode, useRef } from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CompanyForm, { defaultTextValues } from "src/components/domain/company/company.form";
import {WebFadeIn, Body, Header, Button, Modal, Typography} from 'src/components/common'
import {TypographyTypes} from "src/components/common/typography";
import {ButtonTypes} from "src/components/common/button";
import { clearCompanyItems, createCompany, updateCompany } from "src/redux/domain/features/company/collection-slice";
import {
  getCompany,
  companyLoading,
  companySelector,
} from "src/redux/domain/features/company/collection-slice";

// (media)Resource support - convention is <ResourceName>Resource
import UploadViewer from "src/lib/imagekit/screens/Upload/uploadViewer";
import { getCompanyResources, companyResourcesLoading, companyResourcesSelector } from "src/redux/domain/features/companyResource/collection-slice";
import { createCompanyResource, deleteCompanyResource } from "src/redux/domain/features/companyResource/collection-slice";
import { Companyresource } from "../../../../../../types/domain/flat-types";
import { getCompanyMediaKeys, companyMediaKeysSelector } from "src/redux/domain/features/companyMediaKey/collection-slice";

import { MediaKey,SupportedLanguages, WithTranslations, ClientEnvironement } from "src/redux/customTypes/types";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";

import { Company } from "../../../../../../types/domain/flat-types";
import { getAppendees, getConfig } from "src/components/common/config/formInjection/getAppendees";
import { useTranslation } from "src/translations/useTranslation";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";
import { useReRenderOnFormRef } from "src/components/common/useReRenderOnFormRef/useReRenderOnFormRef";

const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles = require("../../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../../themes/typography/styles/styles").default;


interface PendingMediaAssignment {
  [index: string]: (company?: Company) => Promise<void>;
}


const CompanyEditScreen = React.forwardRef(({
  navigation,
  route,
  showHeader = true,
  hideButtons = false,
  hideDeleteButton = false,
  buttonsTop = false,
  imageSlot,
}: {
  navigation: any;
  route: any;
    showHeader?: boolean;
    hideButtons?: boolean;
    hideDeleteButton?: boolean;
    buttonsTop?: boolean;
    imageSlot?: number;
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
  const { viewOnly, companyId,  } = route.params;
  const company: Company = useSelector(
    companySelector(companyId === "new" ? -1 : companyId),
  );
  const loading = useSelector(companyLoading);
  const [wasNew, setWasNew] = useState(companyId === "new");
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined)

  const isDelete: any = React.useRef(undefined)

  
  const companyResources = useSelector(companyResourcesSelector(companyId));
  const resourcesLoading = useSelector(companyResourcesLoading);
  const companyMediaKeys = useSelector(companyMediaKeysSelector);
  const [pendingMediaAssignments, setPendingMediaAssignments] = useState<PendingMediaAssignment>({});
  
  const localRef = useRef(null);
  const formRef = ref ? ref : localRef;
  useReRenderOnFormRef({formRef});
  const formConfig = getConfig("Company", company, formRef, navigation, route);

  useFocusEffect(
    React.useCallback(() => {
      if (companyId !== "new" && wasNew === false) {
         dispatch(getCompany(companyId));
      }
    }, [dispatch, companyId, wasNew]),
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setWasNew(false);
      };
    }, []),
  );

  
    useEffect(() => {
      if (companyId !== 'new') {
        dispatch(getCompanyResources({ company: companyId }));
      }
    }, [dispatch, companyId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!companyMediaKeys) {
        dispatch(getCompanyMediaKeys());
      }
    }, [dispatch, companyMediaKeys]),
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
  getAppendees("Company", fieldAppendees, company, formRef, navigation, route);

  
  const onUploaded = async (url: string, key: string, meta?: string, multiple?: boolean) => {
    const mediaAssignment = async (_company?: Company) => {
      const companyResource: Companyresource = {
        Company: _company?.Id || companyId,
        Key: key,
        Url: url.replace(urlEndpoint, ''),
        Meta: meta,
      };

      //delete the previous resource if there can be only one
      if (!multiple && companyResources?.find(r => r.Key === key)){
        await dispatch(deleteCompanyResource(companyResources.find(r => r.Key === key).Id!));
      }

      await dispatch(createCompanyResource(companyResource));
      dispatch(updateCompany(_company || company));
    };

    if (companyId === "new") {
      //@ts-ignore
      const parsedMeta = JSON.parse(meta);
      const fileId: string = parsedMeta.fileId;
      pendingMediaAssignments[fileId] = mediaAssignment;

      if (parsedMeta.fileType === "non-image") {
        const _hasVideo = (formRef as any).current.values.HasVideo || 0;
        (formRef as any).current.setFieldValue("HasVideo", _hasVideo + 1, false);
      }

      if (parsedMeta.fileType === "image") {
        const _hasImage = (formRef as any).current.values.HasImage || 0;
        (formRef as any).current.setFieldValue("HasImage", _hasImage + 1, false);
      }

      setPendingMediaAssignments(pendingMediaAssignments);
    } else {
      await mediaAssignment();
    }
 };

    const deleteResource = async (id?: number, meta?: any) => {
      if (!id) {
        //there is no resource yet so just remove pending media assignment
        delete (pendingMediaAssignments[meta.fileId]);

        if (meta?.fileType === "non-image") {
          const _hasVideo = (formRef as any).current.values.HasVideo;
          (formRef as any).current.setFieldValue("HasVideo", _hasVideo - 1, false);
        }

        if (meta?.fileType === "image") {
          const _hasImage = (formRef as any).current.values.HasImage;
          (formRef as any).current.setFieldValue("HasImage", _hasImage - 1, false);
        }
        
        //todo: delete from imagekit
        return;
      }

      await dispatch(deleteCompanyResource(id));
      dispatch(updateCompany(company));
    };

    useEffect(() => {
      if (companyResources && companyResources.length > 0) {
        let imageCount = 0;
        let videoCount = 0;
        companyResources.forEach((lr: any) => {
          const parsedMeta = JSON.parse(lr.Meta);
          
          if (parsedMeta?.fileType === "non-image") {
            videoCount++;
          }
      
          if (parsedMeta?.fileType === "image") {
            imageCount++;
          }
        });

        (formRef as any).current?.setFieldValue("HasVideo", videoCount, false);
        (formRef as any).current?.setFieldValue("HasImage", imageCount, false);
        
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[companyResources]);

 companyMediaKeys?.forEach((mediaKey: { Key: MediaKey; Multiple:boolean}) => {
      fieldAppendees.push({
        fieldName: imageSlot ? defaultTextValues[imageSlot].propertyName : "FormTop",
        el: <UploadViewer
                key={`up_${companyId}_${mediaKey.Key}`}
                mediaKey={mediaKey}
                onUploaded={onUploaded}
                resources={companyResources?.filter(r => r.Key === mediaKey.Key)}
                resourceLoading={resourcesLoading}
                viewOnly={viewOnly ?? formConfig?.readOnly?.includes(mediaKey.Key)}
                showLabel={true}
                deleteResource={deleteResource}
                multiple={mediaKey.Multiple}
                labelStyle={cmsStyles?.companyEditPageUploaderViewerLabelStyle}
                labelTextStyle={cmsStyles?.listingEditPageUploaderViewerLabelTextStyle}
                labelText={formConfig?.uploadViewerLabelText?.(mediaKey.Key) || ""}
                baseViewerStyle={cmsStyles?.companyEditPageBaseViewerStyle}
                showInfoModal={Object.keys(formConfig?.infoModals || {}).includes(mediaKey.Key)}
                InfoModalContent={formConfig?.infoModals?.[mediaKey.Key]?.content}
                />,
      });
      });

  

  

  return (
    <>
      <WebFadeIn background={true}>
        <View style={[videoFullScreen ? layoutStyles.fullScreenPage : [layoutStyles.page, layoutStyles.parentEditPage, cmsStyles?.companyEditPage]]}>
          {showHeader && <Header navigation={navigation}/>}
          <Body contentStyle={[cmsStyles?.companyEditPageBody]}>
            <>
              
              {(companyId === "new" || (company !== undefined && company !== "")) && (
                <CompanyForm
                  ref={formRef}
                  key={companyId}
                  fieldAppendees={fieldAppendees}
                  formItem={company || formConfig?.default}
                  viewOnly={viewOnly}
                  hideDeleteButton={hideDeleteButton || viewOnly}
                  hideButtons={hideButtons || viewOnly}
                  buttonsTop={buttonsTop}
                  afterCreate={(response: any) => {
                    if (!handleError(response)) {
                      
                        if (pendingMediaAssignments) {
                          Object.keys(pendingMediaAssignments).forEach(key => {
                            pendingMediaAssignments[key](response.payload);
                          });
                        }
                      navigation.setParams({companyId: response.payload.Id});
                      setAlertTitle(t("company.onCreated") || "Company created");
                      setAlertIcon("check");
                      if (formConfig?.onCreated) {
                        formConfig.onCreated(navigation, response.payload);
                      }
                      setIsAlertOpen(true);
                    }
                  }}
                  afterUpdate={(response: any) => {
                    if (!handleError(response)) {
                      setAlertTitle(t("company.onUpdated") || "Company updated");
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
                      setAlertTitle(t("company.onDeleted") || "Company deleted");
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
              {(loading && (company === undefined || company === "")) &&
                companyId !== "new" && (
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
        title={t("company.deleteWarningTitle") || "Delete Company"}
        text={t("company.deleteWarningText") || "Are you sure you want to delete this Company?"}
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

export default CompanyEditScreen;
