import ImageKit from "imagekit-javascript";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import {
  ImageKitOptions,
  UploadResponse,
} from "imagekit-javascript/dist/src/interfaces";
import IKResponse from "imagekit-javascript/dist/src/interfaces/IKResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "src/redux/stores/store";
import { ClientEnvironement } from "src/redux/customTypes/types";
import { cloneDeep } from "lodash";
import { getClientEnvironments } from "src/redux/domain/features/clientEnvironment/collection-slice";

let imagekit: ImageKit;

const getImageKit = async () => {
  const token =
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("signup")) ||
    "";

  if (!token && (!imagekit || imagekit?.options?.publicKey === "_")) {
    const _imageKit = intialiseImageKitInAppPublic();
    return _imageKit;
  } else if (token && (!imagekit || imagekit?.options?.publicKey === "_")) {
    const _imageKit = intialiseImageKit();
    return _imageKit;
  }

  return imagekit;
};

const getAuthenticationEndpoint = () => {
  const react_app_api_domain = store
    .getState()
    .clientEnvironments.items?.find(
      (e) => e.Id === ClientEnvironement.REACT_APP_API_DOMAIN,
    );

  if (!react_app_api_domain) {
    return undefined;
  }

  const authenticationEndpoint = `${react_app_api_domain.Value}/media/auth`;
  return authenticationEndpoint;
};

const getPublicKey = () => {
  const publicKey = store
    .getState()
    .clientEnvironments.items?.find(
      (e) => e.Id === ClientEnvironement.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    );
  return publicKey?.Value || "_";
};

const getUrlEndPoint = () => {
  const urlEndpoint = store
    .getState()
    .clientEnvironments.items?.find(
      (e) => e.Id === ClientEnvironement.REACT_APP_IMAGEKIT_ENDPOINT,
    );

  return urlEndpoint?.Value || "_";
};

const getMediaFolder = () => {
  const mediaFolder = store
    .getState()
    .clientEnvironments.items?.find(
      (e) => e.Id === ClientEnvironement.REACT_APP_MEDIA_FOLDER,
    );

  return mediaFolder?.Value || "_";
};

export const intialiseImageKit = async () => {
  const token =
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("signup")) ||
    "";

  await store.dispatch(getClientEnvironments({}));

  const authenticationEndpoint = getAuthenticationEndpoint();
  const publicKey = getPublicKey();
  const urlEndpoint = getUrlEndPoint();

  var imagekitConfigOptions: ImageKitOptions = { urlEndpoint };
  if (publicKey) {
    imagekitConfigOptions.publicKey = publicKey;
  }
  if (authenticationEndpoint) {
    imagekitConfigOptions.authenticationEndpoint = `${authenticationEndpoint}/${token}`;
    imagekitConfigOptions.sdkVersion = undefined; //or it gets added to the url
  }

  const _imagekit = new ImageKit(imagekitConfigOptions);
  imagekit = cloneDeep(_imagekit);

  return _imagekit;
};

export const intialiseImageKitInAppPublic = async () => {
  await store.dispatch(getClientEnvironments({}));

  const publicKey = getPublicKey();
  const urlEndpoint = getUrlEndPoint();

  var imagekitConfigOptions: ImageKitOptions = { urlEndpoint };
  if (publicKey) {
    imagekitConfigOptions.publicKey = publicKey;
  }

  const _imagekit = new ImageKit(imagekitConfigOptions);
  imagekit = cloneDeep(_imagekit);
  return _imagekit;
};

export const imageKitInitialisedInAppPublic = () => {
  if (imagekit && !imagekit.options.authenticationEndpoint) {
    return true;
  }
  return false;
};

export const getImagekitPathFromMeta = (meta?: string) => {
  let decodedMeta = { filePath: "" };
  if (meta && JSON.parse(meta)) {
    decodedMeta = JSON.parse(meta);
  }

  return decodedMeta?.filePath;
};
export const getImagekitUrlFromSrc = async (
  imageSrc: string,
  transformationArr?: Partial<{ [key: string]: string }>[],
) => {
  const ikOptions = {
    src: imageSrc,
    transformation: transformationArr,
  };
  const _imageKit = await getImageKit();
  const imageURL = _imageKit.url(ikOptions);

  return decodeURIComponent(imageURL);
};

export const getImagekitUrlFromPath = async (
  imagePath: string,
  transformationArr: Partial<{ [key: string]: string }>[],
  transformationPostion: Partial<{ [p: string]: string }>[],
) => {
  var ikOptions: {
    urlEndpoint: string;
    path: string;
    transformation: Partial<{ [key: string]: string }>[];
    transformationPostion?: Partial<{ [p: string]: string }>[];
  } = {
    urlEndpoint: getUrlEndPoint(),
    path: imagePath,
    transformation: transformationArr,
  };
  if (transformationPostion) {
    ikOptions.transformationPostion = transformationPostion;
  }

  const _imageKit = await getImageKit();
  const imageURL = _imageKit.url(ikOptions);

  return decodeURIComponent(imageURL);
};

export const uploadFile = async (file: {
  uri: string;
  name: any;
}): Promise<UploadResponse | null> => {
  const mediaFolder = getMediaFolder();
  const _imageKit = await getImageKit();
  const userState = store.getState().userInfo;

  return new Promise((resolve, reject) => {
    if (Platform.OS !== "web") {
      FileSystem.readAsStringAsync(file.uri, { encoding: "base64" }).then(
        (fileBase64) => {
          _imageKit.upload(
            {
              file: fileBase64,
              fileName: file.name, //you can change this and generate your own name if required
              //@ts-ignore
              tags: ["priv-test", "not-from-web"], //change this or remove it if you want
              isPrivateFile: true,
              folder: mediaFolder + "/" + userState.userInfo.userId,
            },
            function (
              err: Error | null,
              result: IKResponse<UploadResponse> | null,
            ) {
              if (err) {
                console.error(err, result);
                reject(err);
              }
              resolve(result);
            },
          );
        },
      );
    } else {
      _imageKit.upload(
        {
          file: file.uri,
          fileName: file.name, //you can change this and generate your own name if required
          //@ts-ignore
          tags: ["sample-tag-1", "from-web"], //change this or remove it if you want
          isPrivateFile: true,
          folder: mediaFolder + "/" + userState.userInfo.userId,
        },
        function (
          err: Error | null,
          result: IKResponse<UploadResponse> | null,
        ) {
          if (err) {
            console.error(err, result);
            reject(err);
          }
          resolve(result);
        },
      );
    }
  });
};
