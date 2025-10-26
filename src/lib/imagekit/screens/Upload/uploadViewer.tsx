/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import {
  View,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";

// import getStyleSheet from "./styles";
import { uploadFile } from "../../lib/imagekit";
import IkImageViewer from "../Fetch/ikImageViewer";
import { VideoPlay } from "src/components/common/video/video";
import { useSelector } from "react-redux";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import { MediaKey } from "src/redux/customTypes/types";
// import buttonStyles from "src/components/buttons/button-styles";
import { supportedImage, supportedVideo } from "./supportedMimeTypes";
import commonConstants from "src/themes/constants";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { Button, Typography } from "../../../../components/common";
import { ButtonTypes } from "../../../../components/common/button";
import { TypographyTypes } from "src/components/common/typography";
import { usePlayerDimensions } from "src/components/common/video/usePlayerDimensions";
import { ImagePickerAsset, MediaTypeOptions } from "expo-image-picker";

const useInputStyles =
  require("../../../../themes/input/styles/styles").default;
const useStyles = require("./styles/styles").default;

function UploadViewer({
  onUploaded,
  resources,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resourceLoading,
  viewOnly,
  mediaKey,
  showLabel,
  deleteResource,
  multiple = false,
  labelStyle,
  baseViewerStyle,
}: {
  onUploaded?: (
    url: string,
    key: string,
    meta?: string,
    multiple?: boolean,
  ) => Promise<void>;
  resources?: { Url: string; Meta: string; Key: string }[];
  resourceLoading: boolean;
  viewOnly?: boolean;
  mediaKey: { Key: MediaKey; MediaRestriction?: string };
  showLabel?: boolean;
  deleteResource?: (id?: number, meta?: any) => void;
  multiple?: boolean;
  labelStyle?: StyleProp<ViewStyle>;
  baseViewerStyle?: StyleProp<ViewStyle>;
}) {
  const { playerHeight } = usePlayerDimensions();
  const inputStyles = useInputStyles();
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [freshUpload, setFreshUpload] = useState<any>([]);
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  // let styleSheet = getStyleSheet({});

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

          if (Platform.OS !== "web") {
            Alert.alert("Which one do you prefer?", "", [
              {
                text: "Camera",
                onPress: async () => {
                  await ImagePicker.requestCameraPermissionsAsync();
                  //await requestCameraPermission();

                  //res is not a collectoin from camera  - just one object i.e:
                  // res = {"assetId": null, "cancelled": false, "fileName": null, "fileSize": 452289, "height": 3024, "type": "image", "uri": "file:///var/mobile/Containers/
                  let res = await ImagePicker.launchCameraAsync({
                    mediaTypes:
                      mediaKey.Key === "Video"
                        ? MediaTypeOptions.Videos
                        : MediaTypeOptions.Images,
                  });

                  //console.log("camera res", res);

                  setLoading(true);
                  !multiple && setFreshUpload([]);

                  if (res.canceled) {
                    setLoading(false);
                    return;
                  }

                  const fileData = {
                    name: res.assets![0].uri?.split("/")?.pop(),
                    uri: res.assets![0].uri,
                  };

                  await uploadFileToImagekit(fileData, key);

                  setLoading(false);
                },
                style: "cancel",
              },
              {
                text: "Document",
                onPress: async () => {
                  ///hmmm type for ImagePicker.ImagePickerMultipleResult | ImagePickerResult | ImageInfo
                  let res: any = await ImagePicker.launchImageLibraryAsync({
                    allowsMultipleSelection: !!multiple,
                    selectionLimit: multiple ? 100 : 1,
                    mediaTypes:
                      mediaKey.Key === "Video"
                        ? MediaTypeOptions.Videos
                        : MediaTypeOptions.Images,
                  });

                  setLoading(true);
                  !multiple && setFreshUpload([]);

                  if (res.canceled) {
                    setLoading(false);
                    return;
                  }

                  // console.log("res.assets", res.assets);

                  res.assets.forEach((file: any) => {
                    file.name = file.uri?.split("/")?.pop();
                  });

                  for (let i = 0; i < res.assets.length; i++) {
                    await uploadFileToImagekit(res.assets[i], key);
                  }

                  setLoading(false);
                },
              },
            ]);
            return;
          }

          let res = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: multiple,
            selectionLimit: multiple ? 100 : 1,
            mediaTypes:
              mediaKey.Key === "Video"
                ? MediaTypeOptions.Videos
                : MediaTypeOptions.Images,
          });

          setLoading(true);
          !multiple && setFreshUpload([]);

          if (res.canceled) {
            setLoading(false);
            return;
          }

          res.assets.forEach((file: ImagePickerAsset & { name?: string }) => {
            file.name = file.fileName || undefined;
          });

          for (let i = 0; i < res.assets.length; i++) {
            await uploadFileToImagekit(res.assets[i], key);
          }

          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.log("upload error 2", err);
          throw err;
        }
      };

  async function uploadFileToImagekit(fileData: any, key: string) {
    try {
      console.log("uploading file");
      const uploadedFile: any = await uploadFile(fileData);
      console.log("file uploaded");
      if (onUploaded) {
        multiple
          ? setFreshUpload((prev: any[]) => [...prev, uploadedFile])
          : setFreshUpload([uploadedFile]);

        await onUploaded(
          uploadedFile.url,
          key,
          JSON.stringify(uploadedFile),
          multiple,
        );

        // console.log(uploadedFile.url, key, JSON.stringify(uploadedFile));
      }
    } catch (err) {
      console.log("upload error 1", err);
    }
  }

  // console.log("meta", meta);

  const getViewerBaseHeight = (key: MediaKey) => {
    if (key === "Hero" || key === "Video" || key === "Logo") {
      const height = videoFullScreen
        ? Dimensions.get("window").height
        : playerHeight;

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
    if (key === "Hero" || key === "Logo") {
      return playerHeight;
    } else if (key === "Icon") {
      return 100;
    }
  };

  const getImageViewerWidth = (key: MediaKey) => {
    if (key === "Hero" || key === "Logo") {
      return undefined;
    } else if (key === "Icon") {
      return 100;
    }
  };

  const getImageViewerStyles = (key: MediaKey) => {
    if (key === "Video") {
      return inputStyles.imageInputHero;
    } else if (key === "Hero") {
      return inputStyles.imageInputHero;
    } else if (key === "Logo") {
      return inputStyles.imageInputHero;
    } else if (key === "Icon") {
      return inputStyles.imageInputIcon;
    }
  };

  const getUploadButtonStyle = (key: MediaKey) => {
    if (key === "Logo") {
      return {};
    } else if (key === "Icon") {
      return {
        right: -60,
        top: -8,
      };
    }
  };

  const ViewerLabel = () => {
    if ((!viewOnly && showLabel !== false) || showLabel === true) {
      return (
        <View
          style={[
            { width: "100%", marginBottom: 10, marginTop: 10 },
            labelStyle,
          ]}
        >
          <Typography
            type={TypographyTypes.Default}
            text={`${mediaKey?.Key}`}
            style={inputStyles.label}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View
      testID="base-viewer-container"
      style={{
        width: "100%",
        marginVertical: videoFullScreen ? 0 : 10,
        zIndex: mediaKey.Key === "Video" ? 1000 : 10,
        position: videoFullScreen ? "absolute" : "relative",
      }}
    >
      <ViewerLabel />
      <View
        testID="base-viewer"
        style={[
          {
            height: getViewerBaseHeight(mediaKey.Key),
            width: "100%",
            zIndex: 100,
            position: videoFullScreen ? "absolute" : "relative",
            borderRadius: videoFullScreen ? 0 : 12,
            overflow: "hidden",
          },
          baseViewerStyle,
        ]}
      >
        {!loading &&
          !!resources?.length &&
          resources.map((resource) => {
            const meta = resource ? JSON.parse(resource?.Meta) : "";
            return (
              <View
                key={resource?.Url || "empty"}
                style={[styles.inputContainer]}
                testID="ikContainer"
              >
                {meta?.fileType === "image" && (
                  <IkImageViewer
                    style={[
                      inputStyles.imageInput,
                      getImageViewerStyles(mediaKey.Key),
                    ]}
                    uploadButtonStyle={{
                      backgroundColor: "rgba(0,0,0,0.2)",
                      width: "100%",
                      height: "100%",
                    }}
                    openFileSelector={() =>
                      openFileSelector && openFileSelector(mediaKey?.Key)
                    }
                    uploadButtonProps={{}}
                    height={
                      viewOnly && showLabel !== true
                        ? getViewerBaseHeight(mediaKey.Key)
                        : getImageViewerHeight(mediaKey.Key)
                    }
                    width={getImageViewerWidth(mediaKey.Key)}
                    imagePath={resource?.Url}
                    deleteResource={() => {
                      setFreshUpload([]);
                      deleteResource && deleteResource(resource.Id);
                    }}
                    transform
                  />
                )}
                {meta?.fileType === "non-image" && (
                  // will always have 16:9 dimensions and depends on width of container
                  <VideoPlay
                    path={resource?.Url}
                    openFileSelector={
                      openFileSelector
                        ? () => openFileSelector(mediaKey?.Key)
                        : undefined
                    }
                    deleteResource={() => {
                      setFreshUpload([]);
                      deleteResource && deleteResource(resource.Id);
                    }}
                  />
                )}
              </View>
            );
          })}
        {/* not sure Fresh upload is useful anymore? */}
        {!loading &&
          (!resources || resources.length === 0) &&
          freshUpload?.length > 0 &&
          freshUpload.map((item) => (
            <View key={item.url} style={styles.inputContainer}>
              <IkImageViewer
                style={[
                  inputStyles.imageInput,
                  getImageViewerStyles(mediaKey.Key),
                ]}
                uploadButtonStyle={getUploadButtonStyle(mediaKey.Key)}
                imagePath={item.filePath}
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
                deleteResource={() => {
                  const updatedFreshUploads = freshUpload.filter(
                    (i) => i.fileId !== item.fileId,
                  );
                  setFreshUpload([...updatedFreshUploads]);

                  deleteResource && deleteResource(undefined, item);
                }}
                transform
              />
              {item?.fileType === "non-image" && (
                <VideoPlay
                  path={item.filePath}
                  openFileSelector={
                    openFileSelector
                      ? () => openFileSelector(mediaKey?.Key)
                      : undefined
                  }
                />
              )}
            </View>
          ))}
        {multiple &&
          !resources?.length &&
          !viewOnly &&
          freshUpload?.length === 0 &&
          !loading && (
            <View style={styles.loadingContainer}>
              <Image
                style={{ width: 140, height: 87, marginTop: -10 }}
                source={require("../../../../../assets/empty-image.png")}
              />
            </View>
          )}
        {!multiple &&
          (!resources || resources.length === 0) &&
          !viewOnly &&
          // freshUpload?.length === 0 &&
          !loading && (
            <View
              style={[
                {
                  height: "100%",
                  width: "100%",
                  paddingHorizontal: 0,
                },
              ]}
            >
              <Button
                testID="edit-media"
                type={ButtonTypes.IconButton}
                icon="edit-pencil"
                iconSize={20}
                onPress={() =>
                  openFileSelector ? openFileSelector(mediaKey?.Key) : undefined
                }
                style={[
                  styles.editButton,
                  {
                    zIndex: 1,
                    position: "absolute",
                    top: 8,
                    right: 8,
                    marginRight: 0,
                  },
                ]}
              />
              <Image
                style={{
                  height: "100%",
                  width: "100%",
                }}
                source={require("../../../../../assets/empty-image.png")}
              />
            </View>
          )}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              style={{ marginTop: 15 }}
              size="large"
              color={commonConstants.primaryColor}
            />
          </View>
        )}
      </View>
      {multiple && openFileSelector && (
        <Button
          type={ButtonTypes.Secondary}
          style={styles.addButton}
          onPress={() => openFileSelector(mediaKey.Key)}
          title="Add photo"
        />
      )}
    </View>
  );
}

export default UploadViewer;
