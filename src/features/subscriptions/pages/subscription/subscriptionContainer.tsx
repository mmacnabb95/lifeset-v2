/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ButtonTypes } from "src/components/common/button";
import { SafeArea } from "src/components/common/safeArea/safeArea";
import * as Linking from "expo-linking";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import moment from "moment";
import commonConstants from "src/themes/constants";
import { fetchClient } from "src/utils/legacy-stubs"; // DEPRECATED: Replace with RevenueCat
import _ from "lodash";
import {
  subscriptionViewsSelector,
  getSubscriptionViews,
  clearSubscriptionViewItems,
} from "../../redux/domain/features/subscriptionView/collection-slice";

const useStyles = require("./styles/styles").default;
const useButtonStyles =
  require("../../../../themes/button/styles/styles").default;

const iOSManageSubsLink = "https://apps.apple.com/account/subscriptions";

// https://stripe.com/docs/payments/save-during-payment
// https://docs.expo.dev/guides/linking/

const Row = ({ field, value }: { field: string; value: string }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <View style={{ width: "30%" }}>
        <Typography
          type={TypographyTypes.Body2}
          text={field}
          style={{ lineHeight: 46 }}
        />
      </View>
      <View style={{ width: "70%" }}>
        <Typography
          type={TypographyTypes.Body2}
          text={value}
          style={{ lineHeight: 46 }}
        />
      </View>
    </View>
  );
};

const SubscriptionContainer = ({
  navigation,
  route,
  CheckoutComponent,
}: {
  navigation: any;
  route: any;
  CheckoutComponent: any;
}) => {
  const styles = useStyles();
  const buttonStyles = useButtonStyles();
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const _subscriptionResults = useSelector(subscriptionViewsSelector(userId));
  const _subscription = _subscriptionResults
    ? _subscriptionResults[0]
    : undefined;
  const [subscription, setSubscription] = useState(_subscription);
  const stripePortalLink =
    Platform.OS === "web"
      ? process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL
      : undefined; //- can't be used for feature unlocking subs - has to be in app purchases

  useEffect(() => {
    if (userId) {
      dispatch(getSubscriptionViews({ user: userId }));
    }
  }, [dispatch, userId]);

  const cancelSubScription = async () => {
    const client = await fetchClient();

    try {
      await client.put("cancel-subscription");
    } catch (err) {
      // showSnackError({ message: t("common.error") });
      console.log(err);
    }

    dispatch(clearSubscriptionViewItems());
    setSubscription(undefined);
    await dispatch(getSubscriptionViews({ user: userId }));
  };

  //This delay allows for the success snackbar to show in checkoutscreen
  useEffect(() => {
    if (_subscription && !_.isEqual(subscription, _subscription)) {
      setTimeout(() => setSubscription(_subscription), 3000);
    }
  }, [_subscription, subscription]);

  return (
    <WebFadeIn background={false}>
      {/* <SafeArea authed={true}> */}
      <View style={styles.container}>
        {/* <View style={styles.titleContainer}>
          <View style={styles.title}>
            {navigation.canGoBack() && (
              <Button
                icon="chevron-left"
                onPress={() => {
                  navigation.goBack();
                }}
                type={ButtonTypes.BackButton}
                testID="go-back"
                style={{ width: 50, marginRight: 16 }}
              />
            )}
            <Typography
              type={TypographyTypes.H2}
              text={"Subscription"}
              style={{ lineHeight: 46 }}
            />
          </View>
        </View> */}
        <View style={{ flex: 1 }}>
          {subscription?.PaymentStatus === "paid" && (
            <View>
              <Row
                field={"Status"}
                value={
                  subscription?.PaymentStatus === "paid" ? "Active" : "Inactive"
                }
              />
              <Row
                field={"Billing cycle"}
                value={subscription?.PaymentStatus === "paid" ? "Monthly" : "-"}
              />
              <Row
                field={"Start date"}
                value={
                  subscription?.PaymentStatus === "paid"
                    ? moment(_subscription?.CreatedDate).format("DD/MM/YYYY")
                    : "-"
                }
              />
            </View>
          )}
          <View style={{ height: 30 }} />
          <View style={{ flexDirection: "row", flexGrow: 1 }}>
            {/* <View style={{ width: "30%" }} /> */}
            <View style={{ width: "100%" }}>
              {subscription?.PaymentStatus !== "paid" ? (
                <>
                  <CheckoutComponent />
                </>
              ) : (
                <>
                  {!!stripePortalLink && (
                    <Button
                      title={"Manage Payment Method"}
                      style={{ marginBottom: 10 }}
                      onPress={async () => {
                        if (Platform.OS === "web") {
                          window.open(stripePortalLink, "_blank");
                          return;
                        }
                        Linking.canOpenURL(stripePortalLink)
                          .then((supported) => {
                            if (supported) {
                              Linking.openURL(stripePortalLink);
                            } else {
                              console.log(
                                "Don't know how to open URI: " +
                                  stripePortalLink,
                              );
                            }
                          })
                          .catch((err: any) => {
                            console.error("Problem loading url", err);
                          });
                      }}
                    />
                  )}
                  {/* on iOS we can't manage the sub these are managed by apple */}
                  {/* <Button
                      title={"Unsubscribe"}
                      titleStyle={{ color: commonConstants.red600 }}
                      onPress={() => setIsCancelModalOpen(true)}
                      style={[
                        buttonStyles[ButtonTypes.Delete],
                        { backgroundColor: "transparent", marginTop: 0 },
                      ]}
                      type={ButtonTypes.Danger}
                      testID="go-back"
                    /> */}
                  {Platform.OS === "ios" && (
                    <Button
                      title={"Manage Subscription"}
                      style={{ marginBottom: 10 }}
                      onPress={() => {
                        Linking.canOpenURL(iOSManageSubsLink)
                          .then((supported) => {
                            if (supported) {
                              Linking.openURL(iOSManageSubsLink);
                            } else {
                              console.log(
                                "Don't know how to open URI: " +
                                  iOSManageSubsLink,
                              );
                            }
                          })
                          .catch((err: any) => {
                            console.error("Problem loading url", err);
                          });
                      }}
                      testID="manage-sub"
                    />
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
      {/* </SafeArea> */}
      <Modal
        visible={isCancelModalOpen}
        title="Unsubscribe"
        text="Are you sure you want to cancel your subscription?"
        acceptButton={
          <Button
            title="Unsubscribe"
            // style={{ opacity: loading ? 0.5 : 1 }}
            loading={loading}
            onPress={async () => {
              setLoading(true);
              await cancelSubScription();
              setLoading(false);
              setIsCancelModalOpen(false);
            }}
          />
        }
        declineButton={
          <Button
            title="Cancel"
            type={ButtonTypes.Secondary}
            onPress={() => {
              setIsCancelModalOpen(false);
            }}
          />
        }
      />
    </WebFadeIn>
  );
};

export default SubscriptionContainer;
