import React, { useEffect, useState } from "react";
// TODO: Stripe integration removed - will use RevenueCat in Phase 5
// import WebCheckoutScreen from "./webCheckoutScreen";
import SubscriptionContainer from "./subscriptionContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Loading } from "src/components/common/loading/loading";
import { useAdminModeTimer } from "src/features/subscriptions/components/adminModeTimer/useAdminModeTimer";
import { useSelector } from "react-redux";
import { hasPin } from "src/redux/features/auth/slice";
import { AuthModal } from "../../components/authModal/authModal";

const SubscriptionScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const _hasPin = useSelector(hasPin);
  const { inAdminMode } = useAdminModeTimer();
  const [returningFromPayment, setReturningFromPayment] = useState<
    boolean | undefined
  >(false);

  const [canProceed, setCanProceed] = useState(!_hasPin || inAdminMode);

  useEffect(() => {
    AsyncStorage.getItem("payment_intent_client_secret").then(
      (clientSecret) => {
        if (!route?.params?.payment_intent_client_secret) {
          setReturningFromPayment(false);
          // setCanProceed(false);
        }
        if (clientSecret === route?.params?.payment_intent_client_secret) {
          setReturningFromPayment(true);
          setCanProceed(true);
          AsyncStorage.removeItem("payment_intent_client_secret");

          let url = "";
          if (process.env.REACT_APP_LOCAL) {
            url = `${process.env.REACT_APP_LOCAL}/subscription`;
          } else {
            url = `${process.env.REACT_APP_API_DOMAIN}/subscription`;
          }

          //clears all params without reloading
          window.history.pushState({}, null, url);
        }
      },
    );
  }, [navigation, route?.params?.payment_intent_client_secret]);

  if (returningFromPayment === undefined) {
    return <Loading />;
  }

  //--------------Password protect-------------
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (returningFromPayment === false && canProceed === false) {
    return <AuthModal setCanProceed={setCanProceed} />;
  }
  //-------------------------------------------

  return (
    <>
      <SubscriptionContainer
        navigation={navigation}
        route={route}
        CheckoutComponent={undefined} // Stripe removed - will use RevenueCat
      />
    </>
  );
};

export default SubscriptionScreen;
