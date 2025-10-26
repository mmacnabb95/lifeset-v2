/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  Platform,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import {
  AVPlaybackStatus,
  ResizeMode,
  VideoReadyForDisplayEvent,
} from "expo-av";
import VideoPlayer from "./expo-video-player";
// import { urlEndpoint } from "src/imagekit/config/imagekit";
import { fetchClient } from "src/utils/legacy-stubs";
import { setStatusBarHidden } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { useDispatch, useSelector } from "react-redux";
import {
  setVideoPlayerFullScreen,
  videoPlayerFullScreen,
} from "src/redux/features/misc/slice";
import useStyles from "./video.styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { usePlayerDimensions } from "./usePlayerDimensions";
import { UploadButton } from "../button/uploadButton";
import { EditDeleteButtons } from "src/lib/imagekit/screens/Upload/editDeleteButtons";
import constants from "src/themes/constants";
import { ClientEnvironement } from "src/redux/customTypes/types";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";

const PlayPause = ({
  playing,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refVideo2,
}: {
  playing: boolean;
  refVideo2: any;
  containerViewRef?: any;
}) => {
  // console.log(refVideo2.current);

  return (
    <View>
      {playing ? (
        <Image
          style={{ height: 48, width: 48 }}
          source={require("../../../../assets/pause.png")}
        />
      ) : (
        <Image
          style={{ height: 48, width: 48 }}
          source={require("../../../../assets/play.png")}
        />
      )}
    </View>
  );
};

export const VideoPlay = ({
  path,
  openFileSelector,
  deleteResource,
}: // setModalVisible,
{
  path: string;
  openFileSelector?: ((key: string) => Promise<void>) | undefined;
  deleteResource?: (id?: number, meta?: any) => void;
  // setModalVisible?: (vis: boolean) => void;
}) => {
  const styles = useStyles();
  const { playerHeight, playerWidth } = usePlayerDimensions();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // const video = React.useRef<any>(null);
  const [signedImageUrl, setSignedImageUrl] = useState<string>();
  const [signedThumbnailUrl, setSignedThumbnailUrl] = useState<string>();
  // const [inFullsreen2, setInFullsreen2] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [orientation, setOrientation] = useState();
  const refVideo2 = useRef<any>(null);
  const containerViewRef = useRef<any>(null);
  const dispatch = useDispatch();
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  const navigation = useNavigation();
  const isLargeScreen = screenWidth >= constants.avgDeviceSize;

  const urlEndpoint = useSelector(
    clientEnvironmentSelector(ClientEnvironement.REACT_APP_IMAGEKIT_ENDPOINT),
  );

  var imagePath = path;
  var imageSrc = (urlEndpoint?.Value || "_") + imagePath;

  const getSignedUrl = useCallback(async (_imageSrc: string) => {
    const client = await fetchClient();

    console.log("getting signed url", _imageSrc);
    client
      .post(`media/sign`, {
        url: _imageSrc,
      })
      .then(({ data }) => {
        // console.log("setting signed url", data.signedUrl);
        setSignedImageUrl(data.signedUrl);
      })
      .catch((e) => {
        console.log(e);
      });

    //get the signed thumbnail (first frame of video whilst it loads)
    client
      .post(`media/sign`, {
        url: _imageSrc + "/ik-video.mp4/ik-thumbnail.jpg",
      })
      .then(({ data }) => {
        // console.log("setting signed url", data.signedUrl);
        setSignedThumbnailUrl(data.signedUrl);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  //stop video on nav
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (refVideo2.current) {
          refVideo2.current.setStatusAsync({
            shouldPlay: false,
          });
        }
      };
    }, []),
  );

  useEffect(() => {
    if (!signedImageUrl) {
      getSignedUrl(imageSrc);
    }
  }, [getSignedUrl, imageSrc, signedImageUrl]);

  const getOrientation = async () => {
    let _orientation = await ScreenOrientation.getOrientationAsync();
    setOrientation(_orientation);
  };

  useEffect(() => {
    getOrientation();
  }, []);

  const isPortraight = () => {
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    );
  };

  const getWidth = () => {
    if (Platform.OS === "web" && videoFullScreen) {
      return window.innerWidth;
    } else if (Platform.OS !== "web" && videoFullScreen) {
      // console.log("width", Dimensions.get("window").width);
      return Dimensions.get("window").width; //i.e. height becomes width in landscape
    } else {
      return playerWidth;
    }
  };

  const getHeight = () => {
    if (Platform.OS === "web" && videoFullScreen) {
      return window.innerHeight;
    } else if (Platform.OS !== "web" && videoFullScreen) {
      if (Platform.OS === "ios" && isPortraight()) {
        return Dimensions.get("window").height - 60;
      }
      return Dimensions.get("window").height; //i.e. width becomes height in landscape
    } else {
      return playerHeight;
    }
  };

  //web back button
  useEffect(() => {
    const webBackHandler = () => {
      dispatch(setVideoPlayerFullScreen(false));
    };

    if (Platform.OS === "web") {
      window.addEventListener("popstate", webBackHandler, false);
    }

    return () => {
      if (Platform.OS === "web") {
        window.removeEventListener("popstate", webBackHandler, false);
      }
    };
  }, [dispatch]);

  //Android back button
  useEffect(() => {
    const backAction = () => {
      dispatch(setVideoPlayerFullScreen(false));
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [dispatch]);

  useEffect(() => {
    if (videoFullScreen) {
      navigation.setOptions({ gestureEnabled: false });
    } else {
      navigation.setOptions({ gestureEnabled: true });
    }
  }, [navigation, videoFullScreen]);

  return (
    <View
      testID="vidPlayer"
      style={[videoFullScreen ? styles.containerFullScreen : styles.container]}
    >
      <View
        style={[
          //pending orientation fix
          // videoFullScreen &&
          // orientation === ScreenOrientation.Orientation.PORTRAIT_UP
          //   ? [
          //       styles.portraitView,
          //       Platform.OS !== "web" ? { width: getHeight() } : {},
          //     ]
          //   : { width: "100%" },
          { width: "100%" },
          videoFullScreen
            ? {
                transform: Platform.OS === "web" ? [] : [{ rotate: "90deg" }],
                width: Platform.OS === "web" ? "100%" : screenHeight, // orientation is stillportrati
                paddingLeft: Platform.OS === "web" ? 0 : 30, // use safe area inset instead
                // height: screenHeight,
              }
            : {},
        ]}
        ref={containerViewRef}
      >
        {signedImageUrl && (
          <VideoPlayer
            defaultControlsVisible={true}
            autoHidePlayer={true}
            playbackCallback={(status: AVPlaybackStatus | any) => {
              if (status.isPlaying && !playing) {
                setPlaying(true);
              }
              if (!status.isPlaying && playing) {
                setPlaying(false);
              }
            }}
            videoProps={{
              shouldPlay: false,
              resizeMode: ResizeMode.CONTAIN,
              onReadyForDisplay: (event: VideoReadyForDisplayEvent) => {
                // fixes non 'contained' player: https://stackoverflow.com/a/74660089
                if (Platform.OS === "web") {
                  (event as any).srcElement.style.position = "initial";
                }
              },
              useNativeControls: false,
              usePoster: true,
              posterSource: {
                uri: signedThumbnailUrl, // signedImageUrl.replace("?", "/ik-thumbnail.jpg?"),
              },
              source: {
                uri: signedImageUrl, //"https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
              },
              ref: refVideo2,
            }}
            fullscreen={{
              inFullscreen: videoFullScreen,
              enterFullscreen: async () => {
                dispatch(setVideoPlayerFullScreen(true));
                setStatusBarHidden(true, "fade");
                // setInFullsreen2(!videoFullScreen);
                // if (Platform.OS !== "web") {
                //   await ScreenOrientation.lockAsync(
                //     ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
                //   );
                // }
                // refVideo2.current.setStatusAsync({
                //   shouldPlay: true,
                // });
              },
              exitFullscreen: async () => {
                setStatusBarHidden(false, "fade");
                dispatch(setVideoPlayerFullScreen(false));
                // setInFullsreen2(!videoFullScreen);
                // if (Platform.OS !== "web") {
                //   await ScreenOrientation.lockAsync(
                //     ScreenOrientation.OrientationLock.DEFAULT,
                //   );
                // }
              },
            }}
            style={{
              videoBackgroundColor: "black",
              // width: getWidth(),
              // height: getHeight(),
              // for rotating orientation on mobile to full screen
              width:
                Platform.OS !== "web" && videoFullScreen
                  ? getHeight()
                  : getWidth(),
              height:
                Platform.OS !== "web" && videoFullScreen
                  ? getWidth()
                  : getHeight(),
            }}
            header={
              !videoFullScreen && openFileSelector ? (
                // <UploadButton openFileSelector={openFileSelector} />
                <EditDeleteButtons
                  openFileSelector={openFileSelector}
                  deleteResource={deleteResource}
                />
              ) : undefined
            }
            icon={{
              play: <PlayPause playing={playing} refVideo2={refVideo2} />,
              pause: <PlayPause playing={playing} refVideo2={refVideo2} />,
            }}
            // fullscreen={{
            //   style: { marginRight: 30 },
            // }}
          />
        )}
      </View>
    </View>
  );
};
