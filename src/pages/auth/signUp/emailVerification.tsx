import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { fetchClient } from "src/utils/legacy-stubs";
import url from "url";

import { AppOrWebLoginButtons } from "src/components/common/button/appOrWebLoginButtons";
import { Header, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;

export default function EmailVerificationScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const layoutStyles = useLayoutStyles();
  const formStyles = useFormStyles();

  const token = route.params.token;
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [err, setErr] = useState("");

  const verifyEmail = async () => {
    const tokenValues = url.parse("?" + token, true).query;

    setLoading(true);

    const client = await fetchClient();

    client
      .post(`auth/verify/data`, {
        email: tokenValues.u,
        token: token,
      })
      .then(({ data }) => {
        console.log("data", data);
        setLoading(false);
        setShowSuccessMessage(true);
      })
      .catch((e) => {
        console.log(e);
        setErr(e.toString());
      });
  };

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <>
              <Typography
                type={TypographyTypes.Body1}
                text={" You have successfully verified your email."}
              />

              <AppOrWebLoginButtons navigation={navigation} />
            </>
          )}
          {!!err && (
            <View>
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
}
