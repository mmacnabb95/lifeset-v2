/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { getImagekitUrlFromSrc } from "../../lib/imagekit";
import { fetchClient } from "src/utils/legacy-stubs";
import styles from "./ikImageViewer.styles";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";

import { toString } from "lodash";
import {
  Button,
  ButtonProps,
  ButtonTypes,
} from "../../../../components/common/button";
import { Icon } from "src/components/common";
import { EditDeleteButtons } from "../Upload/editDeleteButtons";
import { useSelector } from "react-redux";
import { ClientEnvironement } from "src/redux/customTypes/types";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";

export const IkImageViewer = ({
  imagePath,
  height,
  width,
  transform = false,
  style,
  uploadButtonStyle,
  openFileSelector,
  imageStyles,
  uploadButtonProps,
  deleteResource,
  editButtonsStyle,
  resizeMode = "cover",
}: {
  imagePath: string;
  height?: number;
  width?: number;
  transform?: boolean;
  style?: any;
  uploadButtonStyle?: any;
  openFileSelector?: ((key: string) => Promise<void>) | undefined;
  imageStyles?: any;
  uploadButtonProps?: Omit<ButtonProps, "onPress">;
  deleteResource?: (id?: number, meta?: any) => void;
  editButtonsStyle?: any;
  resizeMode?: "contain" | "cover";
}) => {
  const urlEndpoint = useSelector(
    clientEnvironmentSelector(ClientEnvironement.REACT_APP_IMAGEKIT_ENDPOINT),
  );
  const imageSrc = (urlEndpoint?.Value || "_") + imagePath;

  const [signedImageUrl, setSignedImageUrl] = useState<string>();
  const [transformedImageUrl, setTransformedImageUrl] = useState<string>();

  const getSize = useCallback(() => {
    if (width && height) {
      return { width, height };
    } else if (!width && height) {
      return { height };
    } else if (width && !height) {
      return { width };
    }
  }, [height, width]);

  const cleanCacheKey = (key: string) => {
    const ckey = key
      .replace(/\./g, "")
      .replace(/\//g, "")
      .replace(/:/g, "")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/"/g, "")
      .replace(/,/g, "");

    // console.log("cache key", ckey);
    return ckey;
  };

  const cachKey: string = cleanCacheKey(
    `__${imagePath}${JSON.stringify(getSize())}`,
  );

  const getSignedUrl = useCallback(
    async (_imageSrc: string) => {
      if (!imagePath) {
        return;
      }

      const client = await fetchClient();

      //don't try and get a signed url if we already have the cached image
      const uri =
        Platform.OS !== "web"
          ? await Image.getCachePathAsync(cachKey)
          : undefined;
      const metadata =
        Platform.OS !== "web" && uri
          ? await FileSystem.getInfoAsync(uri)
          : null;

      if (!metadata?.exists || metadata?.size === 0) {
        // console.log("getting new image");
        client
          .post(`media/sign`, {
            url: _imageSrc,
          })
          .then(({ data }) => {
            setSignedImageUrl(data.signedUrl);
          })
          .catch((e) => {
            console.log(e);
            // setErr(e.toString());
          });
      } else {
        setSignedImageUrl("cached");
      }
    },
    [cachKey],
  );

  useEffect(() => {
    const buildTransformedUrl = async () => {
      const transformationArr = transform
        ? [
            {
              height: toString(getSize()?.height),
              width: toString(getSize()?.width),
            },
          ]
        : [];

      const _transformedImageUrl = await getImagekitUrlFromSrc(
        imageSrc,
        transformationArr,
      );

      setTransformedImageUrl(_transformedImageUrl);
    };
    buildTransformedUrl();
  }, [getSize, height, imageSrc, transform, transformedImageUrl, width]);

  useEffect(() => {
    if (transformedImageUrl) {
      getSignedUrl(transformedImageUrl);
    }
  }, [getSignedUrl, transformedImageUrl]);

  // console.log("signedImageUrl", signedImageUrl);

  return (
    <View
      style={[
        styles.imgContainer,
        getSize(),
        style,
        styles.widthConstraint,
        imageStyles,
      ]}
      testID="image-container"
    >
      <EditDeleteButtons
        openFileSelector={openFileSelector}
        deleteResource={deleteResource}
        style={editButtonsStyle}
      />
      <Image
        style={[{ height: "100%" }, getSize(), imageStyles]}
        source={{ uri: signedImageUrl, cacheKey: cachKey }}
        contentFit={resizeMode}
        transition={200}
        cachePolicy={"memory-disk"}
      />
    </View>
  );
};

export default IkImageViewer;
