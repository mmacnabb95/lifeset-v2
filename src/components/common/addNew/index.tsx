import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon, Modal, Typography } from "src/components/common";
import { NavigationProp, useRoute } from "@react-navigation/native";
import { TypographyTypes } from "../typography";

import constants from "src/themes/addNew/constants";
import _ from "lodash";
import { BulkUploadResult } from "../config/formInjection/bulkUpload";
import { Button, ButtonTypes } from "../button";

const useCommonStyles = require("../../../themes/addNew/styles/styles").default;

type Style = Record<string, string | number>;

interface AddNewProps {
  title?: string;
  destinationScreen: string;
  navigation: NavigationProp<any>;
  params: Record<string, string | number>;
  newEnabled?: boolean;
  style?: Style | Style[];
  bulkUpload?: () => Promise<BulkUploadResult | undefined>;

  handleDrawerOpen?: () => void;
}

export const AddNew = ({
  title,
  destinationScreen,
  navigation,
  params,
  newEnabled = true,
  handleDrawerOpen,
  style,
  bulkUpload,
}: AddNewProps) => {
  const commonStyles = useCommonStyles();
  const route: any = useRoute();
  const allParams = _.merge(route.params, params); //{ params, ...route.params };

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");

  return (
    <>
      <View
        style={[
          commonStyles.addNew,
          !newEnabled ? commonStyles.disabled : {},
          style,
        ]}
      >
        {title && (
          <Typography
            type={TypographyTypes.Body1}
            style={commonStyles.title}
            text={title}
          />
        )}

        <Pressable
          testID="add-new"
          disabled={!newEnabled}
          style={({ pressed }) => [
            {
              backgroundColor:
                pressed && newEnabled
                  ? constants.pressedBackgroundColor
                  : constants.backgroundColor,
            },
            commonStyles.pressable,
            !newEnabled ? commonStyles.disabledPressable : {},
          ]}
          onPress={async () => {
            if (handleDrawerOpen) {
              handleDrawerOpen();
              navigation.setParams(allParams);
              return;
            }

            if (bulkUpload) {
              const result = await bulkUpload();
              if (result.error) {
                setAlertTitle("Error");
                setAlertMessage(result.error);
                setIsAlertOpen(true);
              }
              return;
            }

            if (newEnabled) {
              navigation.navigate("Main", {
                ...{ screen: destinationScreen },
                params: allParams,
              });
            }
          }}
        >
          <Icon iconType="plus" iconSize="24" iconColor={constants.iconColor} />
        </Pressable>
      </View>
      <Modal
        visible={isAlertOpen}
        title={alertTitle}
        text={alertMessage}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Ok"
            onPress={() => {
              setIsAlertOpen(false);
              setTimeout(() => {
                setAlertTitle("");
              }, 1000); //fading modal needs to wait
            }}
          />
        }
      />
    </>
  );
};
