/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import CheckoutScreen from "./checkoutScreen";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  getSubscriptionViews,
  subscriptionViewsSelector,
} from "src/redux/domain/features/subscriptionView/collection-slice";
import _ from "lodash";
import { AuthModal } from "src/components/common/authModal/authModal";
import SubscriptionContainer from "./subscriptionContainer";
import { useAdminModeTimer } from "src/features/subscriptions/components/adminModeTimer/useAdminModeTimer";
import { hasPin } from "src/redux/features/auth/slice";
import { ClientEnvironement } from "src/redux/customTypes/types";
import { clientEnvironmentSelector } from "src/redux/domain/features/clientEnvironment/collection-slice";

// https://stripe.com/docs/payments/save-during-payment
// https://docs.expo.dev/guides/linking/

const StripeSubscriptionScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const _subscriptionResults = useSelector(subscriptionViewsSelector(userId));
  const _subscription = _subscriptionResults
    ? _subscriptionResults[0]
    : undefined;
  const [subscription, setSubscription] = useState(_subscription);
  const _hasPin = useSelector(hasPin);
  const { inAdminMode } = useAdminModeTimer();

  const _REACT_APP_STRIPE_PUBLISHABLE_KEY = useSelector(
    clientEnvironmentSelector(
      ClientEnvironement.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    ),
  );
  const REACT_APP_STRIPE_PUBLISHABLE_KEY =
    _REACT_APP_STRIPE_PUBLISHABLE_KEY?.Value || "_";

  useEffect(() => {
    dispatch(getSubscriptionViews({ user: userId }));
  }, [dispatch, userId]);

  //This delay allows for the success snackbar to show in checkoutscreen
  useEffect(() => {
    if (_subscription && !_.isEqual(subscription, _subscription)) {
      setTimeout(() => setSubscription(_subscription), 3000);
    }
  }, [_subscription, subscription]);

  if (Platform.OS === "web") {
    return null;
  }

  //--------------Password protect-------------
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [canProceed, setCanProceed] = useState(!_hasPin || inAdminMode);
  if (canProceed === false) {
    return <AuthModal setCanProceed={setCanProceed} />;
  }
  //-------------------------------------------

  return (
    <StripeProvider
      publishableKey={REACT_APP_STRIPE_PUBLISHABLE_KEY!}
      urlScheme={Linking.createURL("subscription")} // required for 3D Secure and bank redirects
      merchantIdentifier={process.env.REACT_APP_MERCHANT_INDENTIFIER} // required for Apple Pay
    >
      <SubscriptionContainer
        navigation={navigation}
        route={route}
        CheckoutComponent={CheckoutScreen}
      />
    </StripeProvider>
  );
};

export default StripeSubscriptionScreen;
