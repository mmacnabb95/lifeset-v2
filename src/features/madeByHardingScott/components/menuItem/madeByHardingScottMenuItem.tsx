import React, { useState } from "react";
import { View, Pressable, Image, Linking } from "react-native";
import { Typography } from "src/components/common";
import { Button, ButtonTypes } from "src/components/common/button";
import { Modal } from "src/components/common/modal";
import { TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/constants";
import { config } from "../../config";
import Constants from "expo-constants";

const useCommonStyles =
  require("../../../../themes/navbar/styles/styles").default;

export const MadeByHardingScottMenuItem = () => {
  const commonStyles = useCommonStyles();
  const [showInfoModal, setShowInfoModal] = useState(false);
  return (
    <>
      <View
        style={{
          width: "100%",
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          style={{
            marginBottom: 20,
            height: 35,
            width: 35,
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.3,
          }}
          testID="ha-info"
          onPress={() => {
            setShowInfoModal(true);
          }}
        >
          <Image
            source={require("../../assets/info.png")}
            style={{ height: 22, width: 22 }}
          />
        </Pressable>
      </View>
      <Modal
        visible={showInfoModal}
        title="LifeSet"
        declineButton={
          <Button
            title="Close"
            type={ButtonTypes.Secondary}
            onPress={() => {
              setShowInfoModal(false);
            }}
          />
        }
      >
        <View style={{ alignItems: "center" }}>
          <Typography
            style={[
              commonStyles.text,
              {
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 20,
                marginTop: 15,
                lineHeight: 25,
              },
            ]}
            text={`v${Constants.expoConfig?.version}`}
            type={TypographyTypes.Body1}
          />
          <Typography
            style={[commonStyles.text, { marginBottom: 5 }]}
            text={"Designed and maintained by"}
            type={TypographyTypes.Body1}
          />

          <Pressable
            onPress={() => {
              Linking.openURL(
                `https://vitalsteertechnologies.com//?ref=${config.hsref}`,
              );
            }}
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Typography
              type={TypographyTypes.Link}
              text={"Vital Steer Technologies LLC"}
              style={{
                marginBottom: 20,
                color: constants.primaryColor,
                lineHeight: 23,
              }}
            />
            <Image
              source={require("../../assets/external-link.png")}
              style={{ height: 20, width: 20, marginLeft: 10 }}
            />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};
