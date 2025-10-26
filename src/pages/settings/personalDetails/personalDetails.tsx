import React, { Fragment, useEffect, useRef, useState } from "react";
import { Pressable, View, Text, Platform, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SettingsForm from "src/components/domain/settings/settings.form";
import {
  getSettings,
  settingsSelector,
  settingssLoading,
  updateSettings,
} from "src/redux/domain/features/settings/collection-slice";
import { XPDetailsDisplay } from "src/components/XPDetailsDisplay";

import _ from "lodash";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

import { setLanguage } from "src/redux/features/userInfo/slice";
import { useTranslation } from "src/translations/useTranslation";
import {
  Body,
  Button,
  Header,
  Input,
  Modal,
  ProfileImage,
  Toggle,
  useSnackBar,
  WebFadeIn,
} from "../../../components/common";
import { invalidateAuth } from "src/redux/features/auth/slice";
import { ButtonTypes } from "src/components/common/button";
import { Settings } from "../../../../../types/domain/flat-types";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

const PersonalDetailsScreen = ({ navigation }: { navigation: any }) => {
  const styles = useStyles();
  const layoutStyles = useLayoutStyles();
  const inputStyles = useInputStyles();
  const formStyles = useFormStyles();

  const dispatch = useDispatch();
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const { userId, public_username, companyId } = useUserInfo();
  const formRef: any = useRef(null);
  const [usernameValue, setUsernameValue] = useState<string>("");
  const { text, t } = useTranslation();

  const settings: Settings = useSelector(settingsSelector(userId));
  const loading = useSelector(settingssLoading);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [leaderboardParticipation, setLeaderboardParticipation] = useState(
    settings?.StreakLeaderboardParticipation,
  );

  useEffect(() => {
    if (!settings && userId) {
      dispatch(getSettings(userId));
    }
  }, [dispatch, settings, userId]);

  useEffect(() => {
    setLeaderboardParticipation(settings?.StreakLeaderboardParticipation);
  }, [settings?.StreakLeaderboardParticipation]);

  useEffect(() => {
    if (public_username) {
      setUsernameValue(public_username);
    }
  }, [public_username]);

  useEffect(() => {
    if (
      formRef.current &&
      (formRef as any).current.values &&
      !_.isEqual((formRef as any).current.values!, settings)
    ) {
      // this is the only way I've found (DF 7/4/2022) to get the form to reset outside of submit.
      // i.e. phone number is changed outside of the form and then we need to reload the form
      Object.keys(settings).forEach((key) => {
        (formRef as any).current.setFieldValue(key, settings[key], false);
      });
    }
  }, [settings]);

  const clear = () => {
    //clear any language sensative redux collections in here
  };

  const fieldAppendees = [];

  fieldAppendees.push(
    {
      fieldName: "Name",
      el: (
        <Fragment key="username-crud-container">
          <Pressable
            style={{ width: "100%" }}
            onPress={() => navigation.navigate("ChangeUsername")}
            testID="change-username"
          >
            <Input
              multiline={false}
              numberOfLines={1}
              testID="Username"
              placeholder={t("settings.fields.username")}
              onChangeText={setUsernameValue}
              onPressIn={() => navigation.navigate("ChangeUsername")}
              value={usernameValue}
              maxLength={45}
              editable={false}
              label={t("settings.fields.username")}
            />
          </Pressable>
        </Fragment>
      ),
    },
    {
      fieldName: "PhoneNumber",
      el: (
        <View
          key="phone-crud-container"
          style={inputStyles.inputCoverContainer}
        >
          <View>
            <Pressable
              style={inputStyles.inputCover}
              onPress={() => navigation.navigate("PhoneNumber")}
              testID="add-number"
            />
          </View>
        </View>
      ),
    },
    {
      fieldName: "Email",
      el: (
        <View
          key="email-crud-container"
          style={inputStyles.inputCoverContainer}
        >
          <Pressable
            style={inputStyles.inputCover}
            onPress={() => {
              if (!companyId) {
                navigation.navigate("ChangeEmail");
              }
            }}
            testID="change-email"
          />
        </View>
      ),
    },
    {
      fieldName: "Notifications",
      el: (
        <View key="notifications-container">
          {!!companyId && !!formRef.current && (
            <Toggle
              label={"Streak leaderboard participation"}
              testID={"settings-streak-leaderboard-participation"}
              enabled={!!leaderboardParticipation}
              onChange={(value) => {
                formRef.current?.setFieldValue(
                  "StreakLeaderboardParticipation",
                  value,
                  true,
                );
                setLeaderboardParticipation(value);
              }}
            />
          )}
        </View>
      ),
    },
  );

  const onUploaded = async (data: { url: string; meta?: string }) => {
    if (formRef.current?.setFieldValue) {
      formRef.current?.setFieldValue("Url", data.url);
      formRef.current?.setFieldValue("Meta", data.meta);
      formRef.current?.setFieldValue("deleteProfileImage", null);
      setTimeout(() => formRef.current?.handleSubmit(), 0);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDeleted = async (id?: number, meta?: any) => {
    if (formRef.current?.setFieldValue) {
      formRef.current?.setFieldValue("Url", null);
      formRef.current?.setFieldValue("Meta", null);
      formRef.current?.setFieldValue("deleteProfileImage", true);
      setTimeout(() => formRef.current?.handleSubmit(), 0);
    }
  };

  const onUploading = () => {
    setUploadingProfileImage(true);
  };

  const deleteAccount = async () => {
    try {
      const response = await dispatch(
        updateSettings({
          ...settings,
          Deleted: 1,
        }),
      );
      if (response?.meta?.requestStatus === "fulfilled") {
        setIsDeleteModalOpen(false);
        showSnackOk({
          message:
            "Account deleted you will be logout automatically after 2 seconds",
        });
        setTimeout(() => {
          dispatch(invalidateAuth());
        }, 2000);
      }
    } catch (e) {
      showSnackError({ message: "Error deleting account" });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <WebFadeIn background={false}>
        <View
          style={[
            layoutStyles.page,
            layoutStyles.noMobPadding,
            styles.personalDetails,
          ]}
        >
          <Body style={[styles.personalDetailsForm, { paddingBottom: 30 }]}>
            <>
              <View style={styles.profileImage}>
                <ProfileImage
                  key={`profile_${userId}_Hero`}
                  onUploaded={onUploaded}
                  onUploading={onUploading}
                  onDeleted={onDeleted}
                  imageMeta={uploadingProfileImage ? undefined : settings?.Meta}
                  imageUrl={uploadingProfileImage ? undefined : settings?.Url}
                  resourceLoading={loading}
                  viewOnly={false}
                />
              </View>
              
              <View style={styles.xpContainer}>
                <XPDetailsDisplay />
              </View>

              {settings && (
                <SettingsForm
                  ref={formRef}
                  hideDeleteButton
                  fieldAppendees={fieldAppendees}
                  readOnly={["PhoneNumber", "Email"]}
                  formItem={settings}
                  style={styles}
                  updateButtonText={t("settings.updateBtn")}
                  customTextValues={[
                    {
                      propertyName: "Name",
                      label: t("settings.fields.name"),
                      placeholder: t("settings.fields.name"),
                    },
                    {
                      propertyName: "Email",
                      label: t("settings.fields.email"),
                      placeholder: t("settings.fields.email"),
                    },
                    {
                      propertyName: "PhoneNumber",
                      label: t("settings.fields.phoneNumber"),
                      placeholder: t("settings.fields.phoneNumber"),
                    },
                    {
                      propertyName: "Language",
                      label: t("settings.fields.language"),
                      placeholder: t("settings.fields.language"),
                    },
                  ]}
                  afterUpdate={async (response) => {
                    const resp = response as any;
                    if (resp.meta.requestStatus === "fulfilled") {
                      clear();
                      dispatch(setLanguage(resp.payload.Language));
                      setUploadingProfileImage(false);
                      showSnackOk({ message: t("settings.saveSuccess") });
                    } else {
                      showSnackError({ message: t("common.error") });
                    }
                  }}
                />
              )}
              <Button
                onPress={handleDeleteAccount}
                title={t("settings.deleteAccount")}
                type={ButtonTypes.Danger}
                style={styles.deleteButton}
              />
            </>
          </Body>
          <Snack />
        </View>
      </WebFadeIn>
      <Modal
        visible={isDeleteModalOpen}
        title="Delete Account"
        text="Are you sure you want to delete your account?"
        acceptButton={
          <Button
            title="Delete"
            icon="trash"
            type={ButtonTypes.IconButton}
            onPress={deleteAccount}
          />
        }
        declineButton={
          <Button
            title="Cancel"
            type={ButtonTypes.Danger}
            onPress={() => {
              setIsDeleteModalOpen(false);
            }}
          />
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  xpContainer: {
    marginBottom: 16,
    width: '100%',
  },
});

export default PersonalDetailsScreen;
