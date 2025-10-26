import {
  View,
  Modal as BaseModal,
  ModalProps as BaseModalProps,
} from "react-native";
import React from "react";

const useCommonStyles =
  require("../../../../themes/modal/styles/styles").default;
import { Typography, TypographyTypes } from "../typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

enum IconTypes {
  Check = "check",
}

type Style = Record<string, string | number>;

interface ModalProps {
  readonly text?: string;
  readonly title?: string;
  readonly icon?: IconTypes;
  readonly acceptButton?: JSX.Element;
  readonly declineButton?: JSX.Element;
  readonly children?: React.ReactNode;
  readonly contentStyle?: Style;
}

export const Modal = ({
  title,
  text,
  acceptButton,
  declineButton,
  children,
  contentStyle,
  ...restProps
}: ModalProps & BaseModalProps) => {
  const commonStyles = useCommonStyles();
  const insets = useSafeAreaInsets();

  return (
    <BaseModal
      animationType={"fade"}
      presentationStyle="overFullScreen"
      transparent={true}
      {...restProps}
      statusBarTranslucent
    >
      <KeyboardAwareScrollView
        contentContainerStyle={[commonStyles.body]}
        bounces={false}
        extraHeight={190}
        scrollsToTop={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 0 }}>
          <View style={[commonStyles.content, contentStyle]}>
            {!!title && (
              <Typography
                style={commonStyles.title}
                text={title}
                type={TypographyTypes.Subtitle1}
              />
            )}

            {!!text && (
              <Typography
                style={commonStyles.text}
                text={text}
                type={TypographyTypes.Body1}
              />
            )}

            {children}

            {!!acceptButton && (
              <View style={commonStyles.modalButton}>{acceptButton}</View>
            )}
            {!!declineButton && (
              <View style={commonStyles.modalButton}>{declineButton}</View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BaseModal>
  );
};
