/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import CheckoutScreen from "./checkoutScreen";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import _ from "lodash";
import { AuthModal } from "../../components/authModal/authModal";
import SubscriptionContainer from "./subscriptionContainer";
import { hasPin } from "src/redux/features/auth/slice";
import { useAdminModeTimer } from "src/features/subscriptions/components/adminModeTimer/useAdminModeTimer";
import {
  getSubscriptionViews,
  subscriptionViewsSelector,
} from "../../redux/domain/features/subscriptionView/collection-slice";

const SubscriptionScreen = ({
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

  useEffect(() => {
    if (userId) {
      dispatch(getSubscriptionViews({ user: userId }));
    }
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
    <SubscriptionContainer
      navigation={navigation}
      route={route}
      CheckoutComponent={CheckoutScreen}
    />
  );
};

export default SubscriptionScreen;
