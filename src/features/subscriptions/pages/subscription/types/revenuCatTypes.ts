export interface Package {
  packageType: string | "MONTHLY";
  product: {
    title: string;
    identifier: string;
    discounts: [];
    productType: "NON_CONSUMABLE" | "CONSUMABLE";
    description: string;
    currencyCode: string;
    price: number;
    productCategory: string | "SUBSCRIPTION";
    subscriptionPeriod: string | "P1M";
    priceString: string;
    introPrice: {
      periodUnit: "WEEK" | "MONTH";
      price: 0;
      period: string | "P1W";
      periodNumberOfUnits: number;
      priceString: string;
      cycles: number;
    };
  };
  offeringIdentifier: string;
  identifier: string;
}

export const example: Package = {
  identifier: "$rc_monthly",
  packageType: "MONTHLY",
  offeringIdentifier: "LifeSet Subscription",
  product: {
    priceString: "£5.99",
    description: "Unlimited use of the LifeSet App & More",
    productType: "NON_CONSUMABLE",
    discounts: [],
    title: "LifeSet Premium (Example)",
    currencyCode: "GBP",
    introPrice: {
      periodUnit: "WEEK",
      price: 0,
      period: "P1W",
      periodNumberOfUnits: 1,
      priceString: "£0.00",
      cycles: 1,
    },
    subscriptionPeriod: "P1M",
    productCategory: "SUBSCRIPTION",
    price: 5.99,
    identifier: "01",
  },
};
