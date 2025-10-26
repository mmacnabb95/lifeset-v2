import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import styles from "./styles";
import { logger } from "../../tempLogger";
import { getSubscriptionViews } from "src/redux/domain/features/subscriptionView/collection-slice";
import { useDispatch } from "react-redux";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

// import Purchases from "react-native-purchases";
import { Purchases } from "../../__mocks__/purchases";

const PackageItem = ({
  purchasePackage,
  setIsPurchasing,
}: {
  purchasePackage: any;
  setIsPurchasing: any;
}) => {
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const {
    product: { title, description, priceString },
  } = purchasePackage;

  const pollForConfirmation = async () => {
    //loop for 10s - if we haven't had web hook confirmation by then, then theres a problem
    //this code is essentially polling getSubscriptionViews once per second
    // and give the user the benefit of the doubt for 24hrs - as payment for the first month was succesful

    //If this doesn't complete then the user is left looking at the spinner - ticket created for this scenario
    const array = [];
    let arraySize = 10;
    while (arraySize--) {
      array.push(1);
    }
    for (const inc of array) {
      const result: any = await dispatch(
        getSubscriptionViews({ user: userId }),
      );

      //console.log("result", result.payload);

      if (
        result.payload.length > 0 &&
        result.payload[0].PaymentStatus === "paid"
      ) {
        console.log("subscription confirmed after", inc * 1, "seconds");
        showSnackOk({ message: "Success, your subscription is now active" });
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  };

  const onSelection = async () => {
    setIsPurchasing(true);

    try {
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(purchasePackage);

      logger("customerInfo", customerInfo);
      logger("Purchased product " + productIdentifier);

      await pollForConfirmation();
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert("Error purchasing package", e.message);
        logger("Error purchasing package" + e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Pressable onPress={onSelection} style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.terms}>{description}</Text>
      </View>
      <Text style={styles.title}>{priceString}</Text>
    </Pressable>
  );
};

export default PackageItem;
