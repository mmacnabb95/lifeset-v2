/* eslint-disable @typescript-eslint/no-unused-vars */
// import { PurchasesPackage, UpgradeInfo, GoogleProductChangeInfo, MakePurchaseResult, CustomerInfo, PurchasesEntitlementInfos } from "react-native-purchases";

import {
  CustomerInfo,
  GoogleProductChangeInfo,
  MakePurchaseResult,
  PurchasesEntitlementInfos,
  PurchasesPackage,
  UpgradeInfo,
} from "./types";

export const LOG_LEVEL = {
  DEBUG: "mock",
};
export const Purchases = {
  setLogLevel: (s: any) => {},
  configure: (a: any) => {
    return Promise.resolve();
  },
  getOfferings: async () => {
    return {
      current: {
        identifier: "some offering identifier",
        availablePackages: [
          {
            product: {
              identifier: "mock product identifier",
              title: "Product title",
              description: "Product description",
              priceString: "£10.00",
            },
          },
        ],
      },
    };
  },
  purchasePackage: async (
    aPackage: PurchasesPackage,
    upgradeInfo?: UpgradeInfo | null,
    googleProductChangeInfo?: GoogleProductChangeInfo | null,
    googleIsPersonalizedPrice?: boolean | null,
  ) => {
    const entitlements: PurchasesEntitlementInfos = {
      all: {},
      active: {},
    };

    const customerInfo: CustomerInfo = {
      entitlements,
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: null,
      firstSeen: "",
      originalAppUserId: "some apple user id",
      requestDate: "",
      allExpirationDates: {},
      allPurchaseDates: {},
      originalApplicationVersion: null,
      originalPurchaseDate: null,
      managementURL: null,
      nonSubscriptionTransactions: [],
    };

    const result: MakePurchaseResult = {
      productIdentifier: "product identifier",
      customerInfo,
    };

    await new Promise((r) => setTimeout(r, 2000));

    return result;
  },
};
