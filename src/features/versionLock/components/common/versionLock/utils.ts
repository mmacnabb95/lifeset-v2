import { AxiosResponse } from "axios";
import Constants from "expo-constants";
import { fetchClient } from "src/utils/legacy-stubs";

export const versionLocked = async (): Promise<boolean> => {
  const client = await fetchClient();
  console.log("Checking lock");
  return client
    .get("auth/version")
    .then((res: AxiosResponse) => {
      const apiVersion = res.data;
      const appVersion = Constants.expoConfig?.version;

      console.log("API version", apiVersion);
      console.log("APP version", appVersion);

      if (apiVersion === appVersion) {
        return false;
      }
      return true; //its locked
    })
    .catch((err: AxiosResponse) => {
      console.error(err.data?.message || err);
      return false;
    });
};
