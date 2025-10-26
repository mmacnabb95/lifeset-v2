import React, { useState } from "react";
import { View } from "react-native";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, Modal, useSnackBar } from "src/components/common";
import { ButtonTypes } from "src/components/common/button";
import { money } from "src/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WebCheckoutForm = ({
  price,
  clientSecret,
  reset,
}: {
  price: number;
  clientSecret: string;
  reset: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(true); //todo: rename as canSubscribe
  const [submittingToStripe, setSubmittingToStripe] = useState(false);
  const { showSnackOk, showSnackError, Snack } = useSnackBar();

  const handleSubmit = async (event: any): Promise<void> => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setSubmittingToStripe(true);
    await AsyncStorage.setItem("payment_intent_client_secret", clientSecret);

    let url = "";
    if (process.env.REACT_APP_LOCAL) {
      url = `${process.env.REACT_APP_LOCAL}/subscription`;
    } else {
      url = `${process.env.REACT_APP_API_DOMAIN}/subscription`;
    }

    const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: url,
      },
    });

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      // console.log(result.error.message);
      // setError(result.error.message);
      showSnackError({ message: result.error.message! });
      setSubmittingToStripe(false);
      return;
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }

    setSubscriptionModalOpen(false);
  };

  return (
    <>
      <Modal
        visible={subscriptionModalOpen}
        contentStyle={{ width: "100%", margin: 0 }}
        declineButton={
          <Button
            title="Cancel"
            type={ButtonTypes.Secondary}
            onPress={() => {
              reset();
              setSubscriptionModalOpen(false);
            }}
            // style={{ alignSelf: "center" }}
          />
        }
      >
        <View>
          <View style={{ minHeight: 100 }}>
            <PaymentElement />
            {/* need the price - same as native here */}
            {!!price && (
              <Button
                type={ButtonTypes.Primary}
                loading={submittingToStripe}
                disabled={!stripe}
                onPress={handleSubmit}
                style={{ marginTop: 20, maxWidth: 292 }}
                title={`Pay ${money(price / 100)}`}
              />
            )}
          </View>
        </View>
        <Snack />
      </Modal>
    </>
  );
};

export default WebCheckoutForm;
