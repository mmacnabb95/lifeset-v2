import React, { useEffect, useState } from "react";
import { Platform, View, Text, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Modal, useSnackBar } from "src/components/common";
import { ButtonTypes, Button } from "src/components/common/button";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { log, logger } from "./tempLogger";

let Purchases: any;
let LOG_LEVEL: any;
type PurchasesOffering = any;

import { SubscriptionDescription } from "./subscriptionDescription";
import { getSubscriptionViews } from "../../redux/domain/features/subscriptionView/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import { Loading } from "src/components/common/loading/loading";
import { Package } from "./types/revenuCatTypes";
import { subscriptionPackages } from "./redux/slice";
import { loadSubscriptionPackages } from "./utils";

const APIKeys = {
  apple: process.env.REACT_APP_REVENUE_CAT_APPLE_API_KEY,
  google: process.env.REACT_APP_REVENUE_CAT_GOOGLE_API_KEY,
};

const loadPurchasingAsync = async () => {
  if (process.env.USE_NATIVE_SUBSCRIPTIONS === "true") {
    try {
      const nativePurchases = await import("react-native-purchases");
      Purchases = nativePurchases.default;
      LOG_LEVEL = nativePurchases.LOG_LEVEL;
    } catch (err: any) {
      console.log(
        "Trying to use native Purchases in Expo GO? - it won't work - set USE_NATIVE_SUBSCRIPTIONS false for expo\r\n",
        err.message,
      );
    }
  } else {
    console.log("loading mock purchases");
    const mockPurchases = await import("./__mocks__/purchases");
    Purchases = mockPurchases.Purchases;
    LOG_LEVEL = mockPurchases.LOG_LEVEL;
  }
};

loadPurchasingAsync();

export const getOfferings = async (userId: number) => {
  try {
    console.log("getting offerings");
    logger("getting offerings");
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    // from the docs: Since subscriber attributes are writable using a public key they should not be used for managing secure or sensitive information such as subscription status, coins, etc.
    // https://www.revenuecat.com/docs/subscriber-attributes#setting-attributes

    if (Platform.OS === "android") {
      await Purchases.configure({
        apiKey: APIKeys.google!,
        appUserID: `${userId}`,
      });
    } else {
      await Purchases.configure({
        apiKey: APIKeys.apple!,
        appUserID: `${userId}`,
      });
    }

    console.log("Purchases configured");

    const offerings = await Purchases.getOfferings();

    // throw new Error("test")

    console.log("offerings", JSON.stringify(offerings, null, 2));
    logger("offerings", offerings);

    return offerings.current;
  } catch (err: any) {
    console.log("error getting offerings", err);
    logger("error getting offerings", err);
  }
};

export default function CheckoutScreen() {
  const { userId } = useUserInfo();
  const dispatch = useDispatch();
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const [loading, setLoading] = useState(false);
  const [viewLogs, setViewLogs] = useState(false);
  // const [packages, setPackages] = useState<Package[] | undefined>();
  const packages = useSelector(subscriptionPackages);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const { t } = useTranslation();

  const pollForConfirmation = async () => {
    // loop for 40s - if we haven't had web hook confirmation by then, then theres a problem
    // this code is essentially polling getSubscriptionViews once per second
    
    const array = [];
    let arraySize = 40;
    let success = false;
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
        success = true;
        console.log("subscription confirmed after", inc * 1, "seconds");
        showSnackOk({ message: "Success, your subscription is now active" });
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (success === false) {
      showSnackError({ message: "Subscription error" });
    }
  };

  const onSelection = async (purchasePackage: any) => {
    setIsPurchasing(true);

    try {
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(purchasePackage);

      logger("customerInfo", customerInfo);
      logger("Purchased product " + productIdentifier);

      await pollForConfirmation();
    } catch (e) {
      if (!e.userCancelled) {
        // Alert.alert("Error purchasing package", e.message);
        logger("Error purchasing package" + e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const onSubscribe = async (_package: Package) => {
    setLoading(true);

    await onSelection(_package);

    setLoading(false);
  };

  useEffect(() => {
    if (!packages || packages.length === 0) {
      loadSubscriptionPackages(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!Purchases) {
    return null;
  }

  // if (!packages || packages.length === 0) {
  //   return <Loading />;
  // }

  return (
    <>
      {packages?.map((_package: Package) => {
        return (
          <View
            key={`package_${_package.identifier}`}
            style={{
              flexGrow: 0,
              flexShrink: 1,
              flexBasis: "auto",
              marginBottom: 50,
            }}
          >
            <SubscriptionDescription subscriptionPackage={_package} />
            <Button
              type={ButtonTypes.Primary}
              disabled={loading}
              loading={loading}
              title={t("subscriptionDescription.subscribeButtonText") || "Subscribe"}
              onPress={() => onSubscribe(_package)}
              // style={{ width: 260 }}
            />
          </View>
        );
      })}
      {(userId === 2 || userId === 4 || userId === 3) && (
        <View style={{ width: "100%" }}>
          <Button
            type={ButtonTypes.Primary}
            style={{ opacity: 0.5 }}
            title="view logs"
            onPress={() => setViewLogs(true)}
          />
        </View>
      )}

      <Modal
        visible={viewLogs}
        contentStyle={{ width: "90%" }}
        declineButton={
          <Button
            title="Cancel"
            type={ButtonTypes.Secondary}
            onPress={() => {
              setViewLogs(false);
            }}
            style={{ maxWidth: 292, alignSelf: "center" }}
          />
        }
      >
        <View>
          <View style={{ minWidth: "90%", maxHeight: "90%" }}>
            <ScrollView
              style={{ height: 500, borderWidth: 1 }}
              contentContainerStyle={{
                justifyContent: "space-between",
                // flex: 1,
              }}
            >
              <Text style={{ color: "black" }}>logs</Text>
              <Text style={{ color: "black", flex: 1 }}>{log}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Snack forcePosition />
    </>
  );
}
