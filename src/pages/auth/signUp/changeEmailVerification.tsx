import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { fetchClient } from "src/utils/legacy-stubs";
import { AppOrWebLoginButtons } from "src/components/common/button/appOrWebLoginButtons";
import { AxiosResponse } from "axios";
import { Header, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

const ChangeEmailVerificationScreen: React.FunctionComponent<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();

  const token = route.params.token;
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [err, setErr] = useState("");

  const verifyEmail = async () => {
    const client = await fetchClient();

    setLoading(true);
    client
      .post("/auth/verify/email-change", { token })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((res: AxiosResponse) => {
        setLoading(false);
        setShowSuccessMessage(true);
      })
      // eslint-disable-next-line no-shadow
      .catch((err: AxiosResponse) => {
        setLoading(false);
        if (err.data?.message || err) {
          setErr(err.data?.message || err);
        }
      });
  };

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <WebFadeIn>
      <View style={[layoutStyles.authPage]} testID="email-verification">
        <View style={[formStyles.form]}>
          <Header
            title={"Reset"}
            preamble={""}
            navigation={navigation}
          />

          {loading && !err && (
            <Typography type={TypographyTypes.Body1} text={"Processing..."} />
          )}
          {showSuccessMessage && (
            <View style={{ alignItems: "center" }}>
              <Typography
                type={TypographyTypes.Body1}
                text={"You have successfully verified your email."}
              />

              <AppOrWebLoginButtons navigation={navigation} />
            </View>
          )}
          {!!err && (
            <View style={{ alignItems: "center" }}>
              <Typography
                type={TypographyTypes.Body1}
                text={"Email verification failed"}
              />
            </View>
          )}
        </View>
      </View>
    </WebFadeIn>
  );
};

export default ChangeEmailVerificationScreen;
