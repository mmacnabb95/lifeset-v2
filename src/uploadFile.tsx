import { Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { uploadFile } from "./imagekit/lib/imagekit";
import { UploadResponse } from "imagekit-javascript/dist/src/interfaces";
import { ImagePickerAsset } from "expo-image-picker";

type OnUploaded = (data: {
  url: string;
  key?: string;
  meta: string;
}) => Promise<void>;

interface UploadFileToImagekitProps {
  fileData: any;
  key: string;
  onUploaded: OnUploaded;
}

interface TriggerUploadPictureProps {
  key: string;
  onUploaded: OnUploaded;
}

export const triggerUploadPicture = async ({
  key,
  onUploaded,
}: TriggerUploadPictureProps) => {
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
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            //console.log("camera res", res);

            // setLoading(true);
            //  setFreshUpload([]);

            if (res.canceled) {
              // setLoading(false);
              return;
            }

            const fileData = {
              name: res.assets![0].uri?.split("/")?.pop(),
              uri: res.assets![0].uri,
            };

            await uploadFileToImagekit(fileData, key);

            // setLoading(false);
          },
          style: "cancel",
        },
        {
          text: "Document",
          onPress: async () => {
            ///hmmm type for ImagePicker.ImagePickerMultipleResult | ImagePickerResult | ImageInfo
            let res: any = await ImagePicker.launchImageLibraryAsync({
              allowsMultipleSelection: false,
              selectionLimit: 1,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            // setLoading(true);
            // !multiple && setFreshUpload([]);

            if (res.canceled) {
              // setLoading(false);
              return;
            }

            // console.log("res.assets", res.assets);

            res.assets.forEach((file: any) => {
              file.name = file.uri?.split("/")?.pop();
            });

            for (let i = 0; i < res.assets.length; i++) {
              await uploadFileToImagekit(res.assets[i], key);
            }

            // setLoading(false);
          },
        },
      ]);
      return;
    }

    let res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      selectionLimit: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    // setLoading(true);
    // !multiple && setFreshUpload([]);

    if (res.canceled) {
      // setLoading(false);
      return;
    }

    res.assets.forEach((file: ImagePickerAsset & { name?: string }) => {
      file.name = file.fileName || undefined;
    });

    for (let i = 0; i < res.assets.length; i++) {
      await uploadFileToImagekit(res.assets[i], key);
    }

    // setLoading(false);
  } catch (err) {
    // setLoading(false);
    console.log("upload error 2", err);
    throw err;
  }

  async function uploadFileToImagekit(fileData: any, key: string) {
    try {
      console.log("uploading file");
      const uploadedFile: any = await uploadFile(fileData);
      console.log("file uploaded");

      await onUploaded({
        url: uploadedFile.url,
        key,
        meta: JSON.stringify(uploadedFile),
      });

      // console.log(uploadedFile.url, key, JSON.stringify(uploadedFile));
    } catch (err) {
      console.log("upload file error 1", err);
    }
  }
};
