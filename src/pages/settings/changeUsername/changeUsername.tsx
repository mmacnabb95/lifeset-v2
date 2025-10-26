import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { View } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchClient } from "src/utils/legacy-stubs";
import { AxiosResponse } from "axios";
import { checkUsername } from "src/redux/features/signUp/slice";
import { getUserInfo } from "src/redux/features/userInfo/slice";
import { useTranslation } from "src/translations/useTranslation";
import {
  Body,
  Button,
  Header,
  Input,
  Typography,
  useSnackBar,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

const ChangeEmailScreen: React.FunctionComponent<{ navigation: any }> = ({
  navigation,
}) => {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const [usernameAvailable, setUsernameAvailable] = useState<
    boolean | undefined
  >(undefined);

  const { t } = useTranslation();

  const initialValues = {
    username: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      username: Yup.string()
        .max(50, "Must be 50 characters or less")
        .min(5, "Must be 5 characters or more")
        .required(t("fields.required"))
        .matches(
          /^[a-zA-Z0-9_]*$/,
          "Username can only contain letters, numbers and underscores",
        ),
    }),
    onSubmit: async () => {
      if (usernameAvailable === true) {
        const client = await fetchClient();
        client
          .post("user/change-username", {
            username: formik.values.username,
          })
          .then((res: AxiosResponse) => {
            if (res.data?.success) {
              showSnackOk({ message: t("changeUsername.saveSuccess") });
              dispatch(getUserInfo());
              setTimeout(() => {
                formik.resetForm();
                navigation.navigate("PersonalDetails");
              }, 1000);
            }
          })
          .catch((err: AxiosResponse) => {
            if (err.data?.message) {
              showSnackError({ message: err.data.message });
            }
          });
      }
    },
  });

  const checkUserNameAvailability = async (txt: string) => {
    if (txt?.length < 5) {
      setUsernameAvailable(undefined);
      return;
    }
    const result = await dispatch(checkUsername(txt));
    if ((result as any).payload === true) {
      setUsernameAvailable(true);
    } else {
      setUsernameAvailable(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  return (
    <WebFadeIn>
      <View style={[layoutStyles.page]}>
        <Body style={[styles.changeEmailForm]}>
          <>
            <View style={{ flex: 1 }}>
              <Header
                title={t("changeUsername.title")}
                titleStyle={{
                  marginTop: 20,
                }}
                navigation={navigation}
              />
              <Input
                style={{ marginTop: 20 }}
                testID="username-field"
                placeholder={t("changeUsername.fields.username")}
                onChangeText={(e) => {
                  formik.handleChange("username")(e);
                  checkUserNameAvailability(e);
                }}
                onBlur={formik.handleBlur("username")}
                value={formik.values.username}
                onKeyPress={handleKeyDown}
                autoComplete={"off"}
                errorMessage={
                  formik.touched.username && formik.errors.username
                    ? formik.errors.username
                    : undefined
                }
              />
              {usernameAvailable === true && formik.isValid && (
                <Typography
                  style={formStyles.underFieldMessage}
                  type={TypographyTypes.InputSuccessText}
                  testID={"Available"}
                  text={t("fields.available")}
                />
              )}
              {usernameAvailable === false && formik.isValid && (
                <Typography
                  style={formStyles.underFieldMessage}
                  type={TypographyTypes.InputErrorText}
                  text={t("fields.unavailable")}
                  testID={"Unavailable"}
                />
              )}
            </View>
            <Button
              disabled={!formik.isValid}
              style={{ opacity: formik.isValid ? 1 : 0.4, marginTop: 40 }}
              onPress={() => {
                setLoading(true);
                formik.handleSubmit();
                setTimeout(() => setLoading(false), 5000);
              }}
              loading={loading}
              testID={"ChangeUsernameButton"}
              title={t("changeUsername.saveBtn")}
            />
          </>
        </Body>
      </View>
      <Snack />
    </WebFadeIn>
  );
};

export default ChangeEmailScreen;
