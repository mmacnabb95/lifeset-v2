import React from "react";
import { View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

const useCommonStyles =
  require("../../../../themes/bottomSheet/styles/styles").default;

interface BottomSheetProps {
  //typescript ref type
  bottomSheetRef: React.MutableRefObject<BottomSheetModal>;
  children: JSX.Element;
  snapPoints?: [string, string];
}

export const BottomSheet = ({
  bottomSheetRef,
  children,
  snapPoints = ["25%", "50%"],
}: BottomSheetProps) => {
  const commonStyles = useCommonStyles();

  return (
    <BottomSheetModalProvider>
      <View style={commonStyles.container}>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
        >
          {children && (
            <View style={commonStyles.contentContainer}>{children}</View>
          )}
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};
