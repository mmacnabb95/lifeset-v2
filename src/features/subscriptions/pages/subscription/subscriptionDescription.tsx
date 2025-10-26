import React from "react";
import { View, Pressable, Linking } from "react-native";
import { Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import commonConstants from "src/themes/constants";
import { useTranslation } from "src/translations/useTranslation";
import { Package } from "./types/revenuCatTypes";
import { isNil } from "lodash";

export const SubscriptionDescription = ({
  subscriptionPackage,
}: {
  subscriptionPackage: Package;
}) => {
  const { t } = useTranslation();

  const termsLink = t("subscriptionDescription.termsLink");
  const privacyPolicyLink = t("subscriptionDescription.privacyPolicyLink");
  const hasIntroPrice = !isNil(subscriptionPackage.product.introPrice);
  const { periodUnit, periodNumberOfUnits, price, priceString } =
    subscriptionPackage.product.introPrice || {};
  const priceText = price === 0 ? "free trial" : `trial at ${priceString}`;
  const trialText = hasIntroPrice
    ? ` with a ${periodNumberOfUnits} ${periodUnit.toLowerCase()} ${priceText} starting today. You can cancel at any time before the trial ends.`
    : "";

  return (
    <View testID="auto_renew_sub">
      <View>
        {/*
        – Title of publication or service
        – Length of subscription (time period and content or services provided during each subscription period)
        – Price of subscription, and price per unit if appropriate
        – A functional link to the Terms of Use (EULA)
        – A functional link to the privacy policy
        */}
        <Typography
          type={TypographyTypes.H5}
          text={subscriptionPackage.product.title}
          style={{ marginBottom: 10 }}
        />
        <Typography
          type={TypographyTypes.Body2}
          text={subscriptionPackage.product.description}
          style={{ marginBottom: 10 }}
        />
        {subscriptionPackage.packageType === "MONTHLY" && (
          <Typography
            type={TypographyTypes.Body2}
            text={`This is a rolling subscription billed monthly at ${subscriptionPackage.product.priceString} ${trialText}`}
            style={{ marginBottom: 10 }}
          />
        )}
      </View>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}
      >
        <Typography
          type={TypographyTypes.Body2}
          text={"Be sure to review our "}
        />
        <Pressable
          onPress={() => {
            Linking.openURL(termsLink);
          }}
          style={{ flexDirection: "row", justifyContent: "flex-start" }}
        >
          <Typography
            type={TypographyTypes.Link}
            text={"terms of use"}
            style={{
              marginBottom: 0,
              color: commonConstants.primaryColor,
              fontSize: 14,
              lineHeight: 21,
              textDecorationLine: "underline",
            }}
          />
        </Pressable>
        <Typography type={TypographyTypes.Body2} text={" and "} />
        <Pressable
          onPress={() => {
            Linking.openURL(privacyPolicyLink);
          }}
          style={{ flexDirection: "row", justifyContent: "flex-start" }}
        >
          <Typography
            type={TypographyTypes.Link}
            text={"privacy policy"}
            style={{
              marginBottom: 0,
              color: commonConstants.primaryColor,
              fontSize: 14,
              lineHeight: 21,
              textDecorationLine: "underline",
            }}
          />
        </Pressable>
        <Typography type={TypographyTypes.Body2} text={" before signing up."} />
      </View>
    </View>
  );
};
