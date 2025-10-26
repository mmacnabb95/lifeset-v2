import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Button, ButtonTypes } from "../button";
import { TypographyTypes } from "../typography";
import { Modal } from "../modal";
import { useDispatch } from "react-redux";
import {
  clearCompanyUserItems,
  getCompanyUsers,
  updateCompanyUser,
} from "src/redux/domain/features/companyUser/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { isCompanyManager } from "src/navigation/utils/roleCheck";
import { Companyuser } from "../../../../../types/domain/flat-types";
import constants from "src/themes/constants";
import { Input } from "../input";
import * as Yup from "yup";
import { useFormik } from "formik";

const useCommonTypographyStyles =
  require("../../../themes/typography/styles/styles").default;

export const CompanyUserOffboard = ({
  source,
}: {
  source: Companyuser & { user: { Id: number } };
}) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { roles, userId } = useUserInfo();
  const dispatch = useDispatch();
  const commonTypographyStyles = useCommonTypographyStyles();

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isOffboardEmailDialogOpen, setIsOffboardEmailDialogOpen] =
    useState<boolean>(false);
  const [offboarding, setOffboarding] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const [alertTitle, setAlertTitle] = useState<string>("");
  const { companyUserId } = route.params as any;
  const [loading, setLoading] = useState(false);
  const isDisabled =
    !companyUserId ||
    companyUserId === "new" ||
    (isCompanyManager(roles) && source?.user?.Id === userId);

  const [personalEmailAddress, setPersonalEmailAddress] = useState("");

  const formik = useFormik<Partial<Companyuser>>({
    initialValues: { Email: "" },
    validationSchema: Yup.object({
      Email: Yup.string().email().required("Required"),
    }),
    onSubmit: async (companyUser) => {
      setOffboarding(true);
      setIsOffboardEmailDialogOpen(false);
      setLoading(false);
      const updateRes: any = await dispatch(
        updateCompanyUser({
          ...source,
          Email: formik.values.Email?.toString(),
          offboarding: true,
        }),
      );
      if (updateRes?.meta?.requestStatus === "fulfilled") {
        setTimeout(() => {
          setPersonalEmailAddress("");
          setIsAlertOpen(true);
        }, 1000); //fading modal needs to wait
        return;
      }
      setOffboarding(false);
      setErrorModalOpen(true);
    },
  });

  return (
    <>
      <Button
        onPress={async () => {
          setLoading(true);
          setIsOffboardEmailDialogOpen(true);
        }}
        loading={loading}
        testID={"offboard-user"}
        title={"Offboard"}
        titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
        type={ButtonTypes.Danger}
        style={[
          {
            marginBottom: -7,
            zIndex: 10,
            marginTop: 20,
            opacity: isDisabled ? 0.5 : 1,
            backgroundColor: constants.appBackground,
          },
        ]}
        disabled={isDisabled}
      />
      <Modal
        visible={isAlertOpen}
        title={"User successfully offboarded"}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Ok"
            onPress={async () => {
              setIsAlertOpen(false);
              setOffboarding(false);
              dispatch(clearCompanyUserItems());
              dispatch(
                getCompanyUsers({
                  company: source.Company,
                  offset: 0,
                  limit: 20,
                }),
              );
              navigation.goBack();
            }}
          />
        }
      />
      <Modal
        visible={isOffboardEmailDialogOpen}
        title={"Offboarding user"}
        text="Enter the user's personal email address"
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Offboard"
            loading={offboarding}
            onPress={() => {
              formik.handleSubmit();
            }}
          />
        }
        declineButton={
          <Button
            title="Cancel"
            type={ButtonTypes.Secondary}
            onPress={() => {
              setLoading(false);
              setIsOffboardEmailDialogOpen(false);
              setPersonalEmailAddress("");
              formik.resetForm();
            }}
          />
        }
      >
        <Input
          value={formik.values.Email?.toString() || ""}
          onChange={(e: any) =>
            formik.setFieldValue("Email", e.target.value, true)
          }
          style={{ minHeight: 40 }}
          inputStyle={{ borderWidth: 1, borderColor: constants.grey100 }}
          fieldContainerStyle={{
            minHeight: 40,
            marginTop: -10,
            height: 50,
            marginBottom: 35,
          }}
          errorMessage={
            formik.touched.Email && formik.errors.Email
              ? formik.errors.Email
              : ""
          }
          errorPlace={"bottomRight"}
        />
      </Modal>
      <Modal
        visible={errorModalOpen}
        title={"Error"}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Ok"
            onPress={async () => {
              setErrorModalOpen(false);
            }}
          />
        }
      />
    </>
  );
};
