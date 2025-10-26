import { useNavigation } from "@react-navigation/native";
import React, { ReactElement } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { NavigationProp } from "@react-navigation/core/src/types";
import { Typography, TypographyTypes } from "../typography";
import { Button, ButtonTypes } from "../button";
import { AddNew } from "../addNew";
import commonConstants from "src/themes/constants";
import { BulkUploadResult } from "../config/formInjection/bulkUpload";

const useCommonStyles =
  require("../../../../themes/header/styles/styles").default;

type Style = Record<string, string | number>;

interface HeaderProps {
  title?: string;
  preamble?: string;
  style?: Style | Style[];
  navigation: NavigationProp<any>;
  addNewDestination?: string;
  addNewParams?: Record<string, string | number>;
  bulkUpload?: () => Promise<BulkUploadResult | undefined>;
  onGoBack?: () => void;
  hideGoBack?: boolean;
  newEnabled?: boolean;
  headerComponents?: ReactElement;
  underHeaderComponents?: ReactElement;
  backButtonStyle?: Style | Style[];
  titleStyle?: Style | Style[];
  preambleStyle?: Style | Style[];

  handleDrawerOpen?: () => void;
}

export const Header = ({
  title,
  preamble,
  style,
  navigation,
  addNewDestination,
  onGoBack,
  addNewParams,
  bulkUpload,
  hideGoBack,
  newEnabled = true,
  headerComponents,
  underHeaderComponents,
  backButtonStyle,
  titleStyle,
  preambleStyle,
  handleDrawerOpen,
}: HeaderProps) => {
  const commonStyles = useCommonStyles();
  const { width: windowWidth } = useWindowDimensions();
  const localNavigation = useNavigation();

  return (
    <View style={[commonStyles.header, style]}>
      <View testID="header-top-bar" style={commonStyles.headerTopBar}>
        {localNavigation.canGoBack() &&
          hideGoBack !== true &&
          windowWidth > commonConstants.avgDeviceSize && (
            <Button
              title="Back"
              icon="chevron-left"
              onPress={() => {
                if (onGoBack) {
                  onGoBack();
                }
                navigation.goBack();
              }}
              type={ButtonTypes.BackButton}
              style={backButtonStyle}
              testID="go-back"
            />
          )}
        {headerComponents}
      </View>
      {underHeaderComponents}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          // marginBottom: 10,
        }}
      >
        <View>
          {!!title && title !== " " && (
            <Typography
              type={TypographyTypes.H1}
              style={[commonStyles.title, titleStyle]}
              text={title}
            />
          )}
          {!!preamble && (
            <View style={commonStyles.preambleContainer}>
              <Typography
                type={TypographyTypes.Link}
                style={[commonStyles.preamble, preambleStyle]}
                text={preamble}
              />
            </View>
          )}
        </View>
        {Platform.OS === "web" && bulkUpload && (
          <AddNew
            destinationScreen={addNewDestination}
            params={addNewParams as any}
            navigation={navigation as any}
            title={`Bulk upload`}
            newEnabled={newEnabled}
            bulkUpload={bulkUpload}
            handleDrawerOpen={handleDrawerOpen}
            style={{ marginRight: 20 }}
          />
        )}

        {addNewDestination && (
          <AddNew
            destinationScreen={addNewDestination}
            params={addNewParams as any}
            navigation={navigation as any}
            title={`New`}
            newEnabled={newEnabled}
            handleDrawerOpen={handleDrawerOpen}
          />
        )}
      </View>
    </View>
  );
};
