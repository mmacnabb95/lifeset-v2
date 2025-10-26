import { Platform } from "react-native";
import {
  clearCompanyUserItems,
  createCompanyUser,
  getCompanyUsers,
} from "src/redux/domain/features/companyUser/collection-slice";
import { Companyuser } from "../../../../../../types/domain/flat-types";
import * as DocumentPicker from "expo-document-picker";
import store from "src/redux/stores/store";

export interface BulkUploadResult {
  result: "Success" | "Error" | "Cancelled";
  error?: string;
}

export const bulkUploadCompanyUsers = async ({
  route,
}: {
  route: any;
}): Promise<BulkUploadResult | undefined> => {
  const bulUploadPromise = new Promise(
    async (resolve): Promise<BulkUploadResult | undefined> => {
      if (Platform.OS === "web") {
        //only supports bulk csv's on web

        //open the document picker csv only
        //each row should have the parameters for a new object in alphatical order (comma delimited)
        //images not supported i.e. they should not have an entry
        const res = await DocumentPicker.getDocumentAsync();

        if (res.type === "cancel") {
          resolve({ result: "Cancelled" });
        }

        if (res.mimeType !== "text/csv") {
          const message = `Unsupported mime type: ${res.mimeType}`;
          console.error(message);
          resolve({ result: "Error", error: message });
        }

        var reader = new FileReader();
        reader.onload = async (e) => {
          // console.log(e.target!.result);
          const items = (e.target!.result as string).split("\n"); //on mac csv ends with \n and windows its \r\n

          const crossPlatformArray: string[] = [];
          items?.forEach((item: string) => {
            crossPlatformArray.push(item.replace("\r", ""));
          });

          //piggy back the array onto the create api call
          const companyUser: Partial<Companyuser & any> = {
            Company: route.params?.companyId,
            bulkUpload: {
              companyUsers: crossPlatformArray,
            },
          };

          store.dispatch(clearCompanyUserItems());
          const uploadResult: any = await store.dispatch(
            createCompanyUser(companyUser),
          );

          if (uploadResult.meta.requestStatus === "rejected") {
            console.error(uploadResult.error.message);
            resolve({ result: "Error", error: uploadResult.error.message });
          }

          store.dispatch(
            getCompanyUsers({
              company: route.params?.companyId,
              offset: 0,
              limit: 20,
            }),
          );

          resolve({ result: "Success" });
        };

        reader.readAsText(res.file!);

        return;
      }

      resolve({ result: "Cancelled" });

      return;
    },
  );

  return bulUploadPromise;
};
