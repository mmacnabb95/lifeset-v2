import React from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { error } from "src/redux/features/auth/slice";
import * as Yup from "yup";
import { useFormik } from "formik";
import { CodeInput } from "./codeInput";
import { fetchClient } from "src/utils/legacy-stubs";
import { updateSettings } from "src/redux/domain/features/settings/collection-slice";
import { pendingNumber } from "src/redux/features/misc/slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useTranslation } from "src/translations/useTranslation";
import {
  Body,
  Header,
  Typography,
  useSnackBar,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import commonConstants from "src/themes/constants";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useStyles = require("./styles/styles").default;

const ConfirmNumber = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const formStyles = useFormStyles();
  const layoutStyles = useLayoutStyles();
  const styles = useStyles();

  const dispatch = useDispatch();
  const err = useSelector(error);
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const { userId } = useUserInfo();
  const pendingPhoneNumber = useSelector(pendingNumber);
  const { t } = useTranslation();
  const { returnpage } = route.params;

  const initialValues = {
    code: "      ",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      code: Yup.string()
        .required("Required")
        .test("is_valid", "Required", (value) => {
          return value!.trim().length === 6;
        }),
    }),
    onSubmit: async (verificationCode) => {
      const client = await fetchClient();
      client
        .put("user/phone-confirmed", {
          code: verificationCode,
        })
        .then(async () => {
          showSnackOk({ message: t("security.codeAccepted") });

          await dispatch(
            updateSettings({ Id: userId, PhoneNumber: pendingPhoneNumber }),
          );
          setTimeout(() => {
            formik.setFieldValue("code", initialValues.code, false);
            if (returnpage) {
              navigation.navigate(returnpage);
            } else {
              navigation.navigate("PersonalDetails");
            }
          }, 2000);
        })
        .catch((resp) => {
          if (resp === "Invalid code") {
            showSnackError({ message: resp });
          } else {
            showSnackError({ message: "An error has occured" });
          }
        });
    },
  });

  return (
    <WebFadeIn>
      <View style={[layoutStyles.page]}>
        <Body style={[styles.changeEmailForm]}>
          <View
            style={[
              // formStyles.form,
              { maxWidth: 400, marginTop: 20, flex: 1 },
            ]}
          >
            <Typography
              type={TypographyTypes.Body1}
              style={[formStyles.form, { marginBottom: 20 }]}
              text={t("security.enterCode")}
            />
            <View style={[formStyles.form, formStyles.confirmCode]}>
              <CodeInput
                formik={formik}
                navigation={navigation}
                error={err}
                inputStyle={{ backgroundColor: "#FFFFFF" }}
              />
            </View>
          </View>
        </Body>
      </View>
      <Snack />
    </WebFadeIn>
  );
};

export default ConfirmNumber;
