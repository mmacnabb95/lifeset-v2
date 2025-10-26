import React from "react";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";
import { videoPlayerFullScreen } from "../../../../redux/features/misc/slice";

const useCommonStyles =
  require("../../../../themes/body/styles/styles").default;

type Style = Record<string, string | number>;

interface BodyProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  style?: Style | Style[];
  contentStyle?: Style | Style[];
  scrollEnabled?: boolean;
  onScrollCallback?: (evt: any) => void;
  keyboardAwareScrollViewProps?: KeyboardAwareScrollViewProps;
  scrollableRef?: React.LegacyRef<KeyboardAwareScrollView>;
}

export const Body = ({
  style,
  contentStyle,
  children,
  scrollEnabled,
  onScrollCallback,
  keyboardAwareScrollViewProps,
  scrollableRef,
}: BodyProps) => {
  const commonStyles = useCommonStyles();

  const videoFullScreen = useSelector(videoPlayerFullScreen);

  const getScrollEnabled = () => {
    if (videoFullScreen) {
      return false;
    } else if (scrollEnabled !== undefined) {
      return scrollEnabled;
    }
    return true;
  };

  return (
    <KeyboardAwareScrollView
      testID="k-scroll-v"
      scrollEnabled={getScrollEnabled()}
      onScroll={onScrollCallback}
      {...keyboardAwareScrollViewProps}
      style={
        videoFullScreen
          ? commonStyles.fullScreenContainer
          : commonStyles.container
      }
      contentContainerStyle={[
        videoFullScreen
          ? commonStyles.fullScreenBody
          : [commonStyles.body, style, contentStyle],
      ]}
      ref={scrollableRef}
      extraScrollHeight={Platform.OS === "ios" ? -10 : undefined}
      scrollIndicatorInsets={{ top: 1, bottom: 1 }}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </KeyboardAwareScrollView>
  );
};
