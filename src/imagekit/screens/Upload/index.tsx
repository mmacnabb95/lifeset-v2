import React, { useState } from "react";
import { View, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { uploadFile } from "../../lib/imagekit";
import { Button } from "src/components/common/button";

const useFormStyles = require("../../../../themes/form/styles/styles").default;
const useStyles = require("./styles/styles").default;

function Upload({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const formStyles = useFormStyles();
  const styles = useStyles();

  const [uploadFileUrl, setUploadFileUrl] = useState();

  async function openFileSelector() {
    try {
      //https://docs.expo.dev/versions/latest/sdk/document-picker/#documentpickergetdocumentasyncnamedparameters
      var res = await DocumentPicker.getDocumentAsync();

      uploadFileToImagekit(res);
    } catch (err) {
      //   if (DocumentPicker.isCancel(err)) {
      //     // User cancelled the picker, exit any dialogs or menus and move on
      //   } else {
      console.log(err);
      throw err;
      //   }
    }
  }

  async function uploadFileToImagekit(fileData: any) {
    try {
      const uploadedFile: any = await uploadFile(fileData);
      if (onUploaded) {
        onUploaded(uploadedFile.url);
      }
      setUploadFileUrl(uploadedFile.url);
    } catch (err) {
      //handle error in uploading file
      console.log(err);
    }
  }

  return (
    <>
      <View style={[formStyles.form, formStyles.container]}>
        <Button onPress={() => openFileSelector()} title={"Upload File"} />
        <View style={styles.captionView}>
          {uploadFileUrl && <Text>Uploaded File - {uploadFileUrl}</Text>}
        </View>
      </View>
    </>
  );
}

export default Upload;
