/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { Pressable, Image, View } from "react-native";

export const UploadButton = ({
  openFileSelector,
  style,
}: {
  openFileSelector: () => void;
  style?: any;
}) => {
  return (
    <View
      style={[
        {
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-end",
        },
        style,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
            backgroundColor: pressed ? "lightblue" : "white", //rgba(255, 255,255, 0.5)",
            height: 40,
            width: 40,
            right: 8,
            top: 8,
            //   borderRadius: 20,
            borderWidth: 1,
            borderColor: "lightgrey",
          },
        ]}
        onPress={() => {
          openFileSelector();
        }}
      >
        <Image
          style={{ height: 20, width: 20, marginBottom: 3, marginLeft: 3 }}
          source={require("../../../../assets/editing.png")}
        />
      </Pressable>
    </View>
  );
};
