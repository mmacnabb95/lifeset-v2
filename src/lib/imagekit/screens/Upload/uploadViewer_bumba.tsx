/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import {
  View,
  Pressable,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import getStyleSheet from "./styles";
import { uploadFile } from "../../lib/imagekit";
import useStyles from "src/components/forms/form.styles";
import { StyledText } from "src/styles/text";
import IkImageViewer from "../Fetch/ikImageViewer";
import { VideoPlay } from "src/components/video/video";
import { useSelector } from "react-redux";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import { MediaKey } from "src/redux/customTypes/types";
import buttonStyles from "src/components/buttons/button-styles";
import { supportedImage, supportedVideo } from "./supportedMimeTypes";
import { CustomButton } from "src/uikit";
import { usePlayerDimensions } from "src/components/forms/usePlayerDimensions";
import { vars } from "../../../styles";

function UploadViewer({
  onUploaded,
  resource,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resourceLoading,
  viewOnly,
  mediaKey,
  showLabel,
}: {
  onUploaded?: (url: string, key: string, meta?: string) => Promise<void>;
  resource?: { Url: string; Meta: string; Key: string };
  resourceLoading: boolean;
  viewOnly?: boolean;
  mediaKey: { Key: MediaKey; MediaRestriction?: string };
  showLabel?: boolean;
}) {
  const { playerHeight } = usePlayerDimensions();
  const formStyles = useStyles();
  const [loading, setLoading] = useState(false);
  const [freshUpload, setFreshUpload] = useState<any>();
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  let styleSheet = getStyleSheet({});

  const getSupportedMimeTypes = () => {
    if (!mediaKey.MediaRestriction) {
      return [...supportedImage, ...supportedVideo];
    } else if (mediaKey.MediaRestriction === "Image") {
      return supportedImage;
    }
  };

  const openFileSelector = viewOnly
    ? undefined
    : async (key: string) => {
        try {
          //https://docs.expo.dev/versions/latest/sdk/document-picker/#documentpickergetdocumentasyncnamedparameters
          var res = await DocumentPicker.getDocumentAsync({
            type: getSupportedMimeTypes(),
          });

          setLoading(true);
          setFreshUpload(undefined);

          if (res.type === "cancel") {
            setLoading(false);
            return;
          }

          await uploadFileToImagekit(res, key);
        } catch (err) {
          setLoading(false);
          console.log("upload error", err);
          throw err;
        }
      };

  async function uploadFileToImagekit(fileData: any, key: string) {
    try {
      if (fileData.type === "cancel") {
        setLoading(false);
        return;
      }
      const uploadedFile: any = await uploadFile(fileData);
      if (onUploaded) {
        setFreshUpload(uploadedFile);
        //todo: pass other meta in uploadedFile i.e. fileId and original dimensions etc.

        await onUploaded(uploadedFile.url, key, JSON.stringify(uploadedFile));

        console.log(uploadedFile.url, key, JSON.stringify(uploadedFile));

        setLoading(false);
      }
      // setUploadFileUrl(uploadedFile.url);
    } catch (err) {
      //handle error in uploading file
      console.log(err);
    }
  }

  const meta = resource ? JSON.parse(resource?.Meta) : "";

  // console.log("meta", meta);

  const getViewerBaseHeight = (key: MediaKey) => {
    if (key === "Hero") {
      const height = videoFullScreen
        ? Dimensions.get("window").height
        : playerHeight + 30 + 19;

      return height;
    } else if (key === "Icon") {
      const extraHeightForLabelAndLowerMargin = 30 + 19;
      return 100 + extraHeightForLabelAndLowerMargin;
    }
  };
  // const getViewerBaseWidth = (key: MediaKey) => {
  //   if (key === "Hero") {
  //     return;
  //   } else if (key === "Icon") {
  //     return 150;
  //   }
  // };

  const getImageViewerHeight = (key: MediaKey) => {
    if (key === "Hero") {
      return playerHeight;
    } else if (key === "Icon") {
      return 100;
    }
  };

  const getImageViewerWidth = (key: MediaKey) => {
    if (key === "Hero") {
      return undefined;
    } else if (key === "Icon") {
      return 100;
    }
  };

  const getImageViewerStyles = (key: MediaKey) => {
    if (key === "Hero") {
      return formStyles.imageInputHero;
    } else if (key === "Icon") {
      return formStyles.imageInputIcon;
    }
  };

  const getUploadButtonStyle = (key: MediaKey) => {
    if (key === "Hero") {
      return {};
    } else if (key === "Icon") {
      return buttonStyles.iconUpload;
    }
  };

  const ViewerLabel = () => {
    if ((!viewOnly && showLabel !== false) || showLabel === true) {
      return (
        <View style={[formStyles.labelView]}>
          <Text style={[formStyles.label]}>{mediaKey?.Key}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View
      testID="base-viewer"
      style={{
        marginBottom: 20,
        height: getViewerBaseHeight(mediaKey.Key),
        // width: getViewerBaseWidth(mediaKey.Key),
        width: "100%",
        zIndex: 100,
        position: videoFullScreen ? "absolute" : "relative",
      }}
    >
      {!loading && !freshUpload && resource && (
        <View
          key={resource.Url}
          style={[
            formStyles.inputContainer,
            styleSheet.container,
            { zIndex: 110 },
          ]}
        >
          <ViewerLabel />
          {meta.fileType === "image" && (
            // different media keys can have different heights. However, if mediaKey can be image or video will follow same rules
            // as video below with regards to dimensions
            <IkImageViewer
              style={[
                formStyles.imageInput,
                getImageViewerStyles(mediaKey.Key),
              ]}
              uploadButtonStyle={getUploadButtonStyle(mediaKey.Key)}
              imagePath={resource.Url}
              height={
                viewOnly && showLabel !== true
                  ? getViewerBaseHeight(mediaKey.Key)
                  : getImageViewerHeight(mediaKey.Key)
              }
              width={getImageViewerWidth(mediaKey.Key)}
              openFileSelector={
                openFileSelector
                  ? () => openFileSelector(mediaKey.Key)
                  : undefined
              }
              transform
            />
          )}
          {meta.fileType === "non-image" && (
            // will always have 16:9 dimensions and depends on width of container
            <VideoPlay
              path={resource.Url}
              openFileSelector={
                openFileSelector
                  ? () => openFileSelector(mediaKey?.Key)
                  : undefined
              }
            />
          )}
        </View>
      )}
      {freshUpload !== undefined && (
        <View
          key={freshUpload.url}
          style={[formStyles.inputContainer, styleSheet.container]}
        >
          <ViewerLabel />
          {freshUpload.fileType === "image" && (
            <IkImageViewer
              style={[
                formStyles.imageInput,
                getImageViewerStyles(mediaKey.Key),
              ]}
              uploadButtonStyle={getUploadButtonStyle(mediaKey.Key)}
              imagePath={freshUpload.filePath}
              height={
                viewOnly && showLabel !== true
                  ? getViewerBaseHeight(mediaKey.Key)
                  : getImageViewerHeight(mediaKey.Key)
              }
              width={getImageViewerWidth(mediaKey.Key)}
              openFileSelector={
                openFileSelector
                  ? () => openFileSelector(mediaKey?.Key)
                  : undefined
              }
              transform
            />
          )}
          {freshUpload.fileType === "non-image" && (
            <VideoPlay
              path={freshUpload.filePath}
              openFileSelector={
                openFileSelector
                  ? () => openFileSelector(mediaKey?.Key)
                  : undefined
              }
            />
          )}
        </View>
      )}
      {!resource && !viewOnly && !freshUpload && !loading && (
        <View
          style={[
            formStyles.fieldContainer,
            { height: getViewerBaseHeight(mediaKey.Key) },
          ]}
        >
          <ViewerLabel />
          <View
            style={[
              formStyles.input,
              formStyles.imageInput,
              styleSheet.container,
              styleSheet.uploadInputContainer,
            ]}
          >
            <CustomButton
              style={styleSheet.uploader}
              onPress={() =>
                openFileSelector ? openFileSelector(mediaKey?.Key) : undefined
              }
              title="Upload"
              theme="secondary"
            />
          </View>
        </View>
      )}
      {loading && !freshUpload && (
        <View
          style={[
            formStyles.fieldContainer,
            { height: getViewerBaseHeight(mediaKey.Key) },
          ]}
        >
          <ViewerLabel />
          <View
            style={[
              formStyles.input,
              formStyles.imageInput,
              styleSheet.container,
              styleSheet.uploadInputContainer,
            ]}
          >
            <Pressable
              style={styleSheet.uploader}
              // onPress={() => openFileSelector()}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                }}
              >
                <ActivityIndicator
                  size="large"
                  color={vars.primaryColor}
                  style={{ marginTop: 50 }}
                />
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default UploadViewer;
