import {
  PURCHASES_ERROR_CODE,
  UninitializedPurchasesError,
  UnsupportedPlatformError,
} from "./errors";
import { CustomerInfo, PurchasesEntitlementInfo } from "./customerInfo";
import {
  PRORATION_MODE,
  PACKAGE_TYPE,
  INTRO_ELIGIBILITY_STATUS,
  PurchasesOfferings,
  PurchasesStoreProduct,
  UpgradeInfo,
  PurchasesPromotionalOffer,
  PurchasesPackage,
  IntroEligibility,
  PurchasesStoreProductDiscount,
  SubscriptionOption,
  PRODUCT_CATEGORY,
  GoogleProductChangeInfo,
} from "./offerings";
/**
 * Listener used on updated customer info
 * @callback CustomerInfoUpdateListener
 * @param {Object} customerInfo Object containing info for the customer
 */
export type CustomerInfoUpdateListener = (customerInfo: CustomerInfo) => void;
export type ShouldPurchasePromoProductListener = (
  deferredPurchase: () => Promise<MakePurchaseResult>,
) => void;
export type MakePurchaseResult = {
  productIdentifier: string;
  customerInfo: CustomerInfo;
};
export type LogHandler = (logLevel: LOG_LEVEL, message: string) => void;
/**
 * @deprecated, use PRODUCT_CATEGORY
 */
export declare enum PURCHASE_TYPE {
  /**
   * A type of SKU for in-app products.
   */
  INAPP = "inapp",
  /**
   * A type of SKU for subscriptions.
   */
  SUBS = "subs",
}
/**
 * Enum for billing features.
 * Currently, these are only relevant for Google Play Android users:
 * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
 */
export declare enum BILLING_FEATURE {
  /**
   * Purchase/query for subscriptions.
   */
  SUBSCRIPTIONS = 0,
  /**
   * Subscriptions update/replace.
   */
  SUBSCRIPTIONS_UPDATE = 1,
  /**
   * Purchase/query for in-app items on VR.
   */
  IN_APP_ITEMS_ON_VR = 2,
  /**
   * Purchase/query for subscriptions on VR.
   */
  SUBSCRIPTIONS_ON_VR = 3,
  /**
   * Launch a price change confirmation flow.
   */
  PRICE_CHANGE_CONFIRMATION = 4,
}
export declare enum REFUND_REQUEST_STATUS {
  /**
   * Apple has received the refund request.
   */
  SUCCESS = 0,
  /**
   * User canceled submission of the refund request.
   */
  USER_CANCELLED = 1,
  /**
   * There was an error with the request. See message for more details.
   */
  ERROR = 2,
}
/**
 * Holds the logIn result
 */
export interface LogInResult {
  /**
   * The Customer Info for the user.
   */
  readonly customerInfo: CustomerInfo;
  /**
   * True if the call resulted in a new user getting created in the RevenueCat backend.
   */
  readonly created: boolean;
}
export declare enum LOG_LEVEL {
  VERBOSE = "VERBOSE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}
/**
 * Holds parameters to initialize the SDK.
 */
export interface PurchasesConfiguration {
  /**
   * RevenueCat API Key. Needs to be a string
   */
  apiKey: string;
  /**
   * A unique id for identifying the user
   */
  appUserID?: string | null;
  /**
   * An optional boolean. Set this to TRUE if you have your own IAP implementation and
   * want to use only RevenueCat's backend. Default is FALSE. If you are on Android and setting this to ON, you will have
   * to acknowledge the purchases yourself.
   */
  observerMode?: boolean;
  /**
   * An optional string. iOS-only, will be ignored for Android.
   * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults
   * suite, otherwise it will use standardUserDefaults. Default is null, which will make the SDK use standardUserDefaults.
   */
  userDefaultsSuiteName?: string;
  /**
   * iOS-only, will be ignored for Android.
   * Set this to TRUE to enable StoreKit2.
   * Default is FALSE.
   *
   * @deprecated RevenueCat currently uses StoreKit 1 for purchases, as its stability in production scenarios has
   * proven to be more performant than StoreKit 2.
   * We're collecting more data on the best approach, but StoreKit 1 vs StoreKit 2 is an implementation detail
   * that you shouldn't need to care about.
   * We recommend not using this parameter, letting RevenueCat decide for you which StoreKit implementation to use.
   */
  usesStoreKit2IfAvailable?: boolean;
  /**
   * An optional boolean. Android only. Required to configure the plugin to be used in the Amazon Appstore.
   */
  useAmazon?: boolean;
}
export default class Purchases {
  /**
   * Supported SKU types.
   * @readonly
   * @enum {string}
   * @deprecated, use PRODUCT_CATEGORY
   */
  static PURCHASE_TYPE: typeof PURCHASE_TYPE;
  /**
   * Supported product categories.
   * @readonly
   * @enum {string}
   */
  static PRODUCT_CATEGORY: typeof PRODUCT_CATEGORY;
  /**
   * Enum for billing features.
   * Currently, these are only relevant for Google Play Android users:
   * https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
   * @readonly
   * @enum {string}
   */
  static BILLING_FEATURE: typeof BILLING_FEATURE;
  /**
   * Enum with possible return states for beginning refund request.
   * @readonly
   * @enum {string}
   */
  static REFUND_REQUEST_STATUS: typeof REFUND_REQUEST_STATUS;
  /**
   * Replace SKU's ProrationMode.
   * @readonly
   * @enum {number}
   */
  static PRORATION_MODE: typeof PRORATION_MODE;
  /**
   * Enumeration of all possible Package types.
   * @readonly
   * @enum {string}
   */
  static PACKAGE_TYPE: typeof PACKAGE_TYPE;
  /**
   * Enum of different possible states for intro price eligibility status.
   * @readonly
   * @enum {number}
   */
  static INTRO_ELIGIBILITY_STATUS: typeof INTRO_ELIGIBILITY_STATUS;
  /**
   * Enum of all error codes the SDK produces.
   * @readonly
   * @enum {string}
   */
  static PURCHASES_ERROR_CODE: typeof PURCHASES_ERROR_CODE;
  /**
   * List of valid log levels.
   * @readonly
   * @enum {string}
   */
  static LOG_LEVEL: typeof LOG_LEVEL;
  /**
   * @internal
   */
  static UninitializedPurchasesError: typeof UninitializedPurchasesError;
  /**
   * @internal
   */
  static UnsupportedPlatformError: typeof UnsupportedPlatformError;
  /**
   * Sets up Purchases with your API key and an app user id.
   * @param {String} apiKey RevenueCat API Key. Needs to be a String
   * @param {String?} appUserID An optional unique id for identifying the user. Needs to be a string.
   * @param {boolean} [observerMode=false] An optional boolean. Set this to TRUE if you have your own IAP implementation and want to use only RevenueCat's backend. Default is FALSE.
   * @param {boolean} [usesStoreKit2IfAvailable=false] DEPRECATED. An optional boolean. iOS-only. Defaults to FALSE. Setting this to TRUE will enable StoreKit2 on compatible devices.
   * We recommend not using this parameter, letting RevenueCat decide for you which StoreKit implementation to use.
   * @param {boolean} [useAmazon=false] An optional boolean. Android-only. Set this to TRUE to enable Amazon on compatible devices.
   * @param {String?} userDefaultsSuiteName An optional string. iOS-only, will be ignored for Android.
   * Set this if you would like the RevenueCat SDK to store its preferences in a different NSUserDefaults suite, otherwise it will use standardUserDefaults.
   * Default is null, which will make the SDK use standardUserDefaults.
   */
  static configure({
    apiKey,
    appUserID,
    observerMode,
    userDefaultsSuiteName,
    usesStoreKit2IfAvailable,
    useAmazon,
  }: PurchasesConfiguration): void;
  /**
   * @deprecated, configure behavior through the RevenueCat dashboard instead.
   * If an user tries to purchase a product that is active on the current app store account,
   * we will treat it as a restore and alias the new ID with the previous id.
   * @param {boolean} allowSharing Set this to true if you are passing in an appUserID but it is anonymous,
   * this is true by default if you didn't pass an appUserID
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static setAllowSharingStoreAccount(allowSharing: boolean): Promise<void>;
  /**
   * @param {boolean} finishTransactions Set finishTransactions to false if you aren't using Purchases SDK to
   * make the purchase
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static setFinishTransactions(finishTransactions: boolean): Promise<void>;
  /**
   * iOS only.
   * @param {boolean} simulatesAskToBuyInSandbox Set this property to true *only* when testing the ask-to-buy / SCA
   * purchases flow. More information: http://errors.rev.cat/ask-to-buy
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static setSimulatesAskToBuyInSandbox(
    simulatesAskToBuyInSandbox: boolean,
  ): Promise<void>;
  /**
   * Sets a function to be called on updated customer info
   * @param {CustomerInfoUpdateListener} customerInfoUpdateListener CustomerInfo update listener
   */
  static addCustomerInfoUpdateListener(
    customerInfoUpdateListener: CustomerInfoUpdateListener,
  ): void;
  /**
   * Removes a given CustomerInfoUpdateListener
   * @param {CustomerInfoUpdateListener} listenerToRemove CustomerInfoUpdateListener reference of the listener to remove
   * @returns {boolean} True if listener was removed, false otherwise
   */
  static removeCustomerInfoUpdateListener(
    listenerToRemove: CustomerInfoUpdateListener,
  ): boolean;
  /**
   * Sets a function to be called on purchases initiated on the Apple App Store. This is only used in iOS.
   * @param {ShouldPurchasePromoProductListener} shouldPurchasePromoProductListener Called when a user initiates a
   * promotional in-app purchase from the App Store. If your app is able to handle a purchase at the current time, run
   * the deferredPurchase function. If the app is not in a state to make a purchase: cache the deferredPurchase, then
   * call the deferredPurchase when the app is ready to make the promotional purchase.
   * If the purchase should never be made, you don't need to ever call the deferredPurchase and the app will not
   * proceed with promotional purchases.
   */
  static addShouldPurchasePromoProductListener(
    shouldPurchasePromoProductListener: ShouldPurchasePromoProductListener,
  ): void;
  /**
   * Removes a given ShouldPurchasePromoProductListener
   * @param {ShouldPurchasePromoProductListener} listenerToRemove ShouldPurchasePromoProductListener reference of
   * the listener to remove
   * @returns {boolean} True if listener was removed, false otherwise
   */
  static removeShouldPurchasePromoProductListener(
    listenerToRemove: ShouldPurchasePromoProductListener,
  ): boolean;
  /**
   * Gets the map of entitlements -> offerings -> products
   * @returns {Promise<PurchasesOfferings>} Promise of entitlements structure. The promise will be rejected if configure
   * has not been called yet.
   */
  static getOfferings(): Promise<PurchasesOfferings>;
  /**
   * Fetch the product info
   * @param {String[]} productIdentifiers Array of product identifiers
   * @param {String} type Optional type of products to fetch, can be SUBSCRIPTION or NON_SUBSCRIPTION. SUBSCRIPTION by default
   * @returns {Promise<PurchasesStoreProduct[]>} A promise containing an array of products. The promise will be rejected
   * if the products are not properly configured in RevenueCat or if there is another error retrieving them.
   * Rejections return an error code, and a userInfo object with more information. The promise will also be rejected
   * if configure has not been called yet.
   */
  static getProducts(
    productIdentifiers: string[],
    type?: PURCHASE_TYPE | PRODUCT_CATEGORY,
  ): Promise<PurchasesStoreProduct[]>;
  /**
   * Make a purchase
   *
   * @param {String} productIdentifier The product identifier of the product you want to purchase
   * @param {UpgradeInfo} upgradeInfo Android only. Optional UpgradeInfo you wish to upgrade from containing the oldSKU
   * and the optional prorationMode.
   * @param {String} type Optional type of product, can be inapp or subs. Subs by default
   * @deprecated, use purchaseStoreProduct instead
   */
  static purchaseProduct(
    productIdentifier: string,
    upgradeInfo?: UpgradeInfo | null,
    type?: PURCHASE_TYPE,
  ): Promise<MakePurchaseResult>;
  /**
   * Make a purchase
   *
   * @param {PurchasesStoreProduct} product The product you want to purchase
   * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
   * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
   * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
   * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
   * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
   * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
   * a customer info object and a product identifier. Rejections return an error code,
   * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will
   * also be rejected if configure has not been called yet.
   */
  static purchaseStoreProduct(
    product: PurchasesStoreProduct,
    googleProductChangeInfo?: GoogleProductChangeInfo | null,
    googleIsPersonalizedPrice?: boolean | null,
  ): Promise<MakePurchaseResult>;
  /**
   * iOS only. Purchase a product applying a given discount.
   *
   * @param {PurchasesStoreProduct} product The product you want to purchase
   * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
   * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
   * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
   * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
   * @returns {Promise<{ productIdentifier: string, customerInfo:CustomerInfo }>} A promise of an object containing
   * a customer info object and a product identifier. Rejections return an error code,
   * a boolean indicating if the user cancelled the purchase, and an object with more information. The promise will be
   * rejected if configure has not been called yet.
   */
  static purchaseDiscountedProduct(
    product: PurchasesStoreProduct,
    discount: PurchasesPromotionalOffer,
  ): Promise<MakePurchaseResult>;
  /**
   * Make a purchase
   *
   * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
   * @param {UpgradeInfo} upgradeInfo DEPRECATED. Use googleProductChangeInfo.
   * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
   * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
   * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
   * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
   * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
   * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
   * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
   * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
   * has not been called yet.
   */
  static purchasePackage(
    aPackage: PurchasesPackage,
    upgradeInfo?: UpgradeInfo | null,
    googleProductChangeInfo?: GoogleProductChangeInfo | null,
    googleIsPersonalizedPrice?: boolean | null,
  ): Promise<MakePurchaseResult>;
  /**
   * Google only. Make a purchase of a subscriptionOption
   *
   * @param {SubscriptionOption} subscriptionOption The SubscriptionOption you wish to purchase. You can get the SubscriptionOption from StoreProducts by calling getOfferings
   * @param {GoogleProductChangeInfo} googleProductChangeInfo Android only. Optional GoogleProductChangeInfo you
   * wish to upgrade from containing the oldProductIdentifier and the optional prorationMode.
   * @param {boolean} googleIsPersonalizedPrice Android and Google only. Optional boolean indicates personalized pricing on products available for purchase in the EU.
   * For compliance with EU regulations. User will see "This price has been customize for you" in the purchase dialog when true.
   * See https://developer.android.com/google/play/billing/integrate#personalized-price for more info.
   * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
   * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
   * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
   * has not been called yet.
   */
  static purchaseSubscriptionOption(
    subscriptionOption: SubscriptionOption,
    googleProductChangeInfo?: GoogleProductChangeInfo,
    googleIsPersonalizedPrice?: boolean,
  ): Promise<MakePurchaseResult>;
  /**
   * iOS only. Purchase a package applying a given discount.
   *
   * @param {PurchasesPackage} aPackage The Package you wish to purchase. You can get the Packages by calling getOfferings
   * @param {PurchasesPromotionalOffer} discount Discount to apply to this package. Retrieve this discount using getPromotionalOffer.
   * @returns {Promise<{ productIdentifier: string, customerInfo: CustomerInfo }>} A promise of an object containing
   * a customer info object and a product identifier. Rejections return an error code, a boolean indicating if the
   * user cancelled the purchase, and an object with more information. The promise will be also be rejected if configure
   * has not been called yet.
   */
  static purchaseDiscountedPackage(
    aPackage: PurchasesPackage,
    discount: PurchasesPromotionalOffer,
  ): Promise<MakePurchaseResult>;
  /**
   * Restores a user's previous purchases and links their appUserIDs to any user's also using those purchases.
   * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
   * userInfo object with more information. The promise will be also be rejected if configure has not been called yet.
   */
  static restorePurchases(): Promise<CustomerInfo>;
  /**
   * Get the appUserID
   * @returns {Promise<string>} The app user id in a promise
   */
  static getAppUserID(): Promise<string>;
  /**
   * This function will logIn the current user with an appUserID. Typically this would be used after a log in
   * to identify a user without calling configure.
   * @param {String} appUserID The appUserID that should be linked to the currently user
   * @returns {Promise<LogInResult>} A promise of an object that contains the customerInfo after logging in, as well
   * as a boolean indicating whether the user has just been created for the first time in the RevenueCat backend. The
   * promise will be rejected if configure has not been called yet or if there's an issue logging in.
   */
  static logIn(appUserID: string): Promise<LogInResult>;
  /**
   * Logs out the Purchases client clearing the saved appUserID. This will generate a random user id and save it in the cache.
   * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code,
   * and a userInfo object with more information. The promise will be rejected if configure has not been called yet or if
   * there's an issue logging out.
   */
  static logOut(): Promise<CustomerInfo>;
  /**
   * Enables/Disables debugs logs
   * @param {boolean} enabled Enable or not debug logs
   * @deprecated, use setLogLevel instead
   */
  static setDebugLogsEnabled(enabled: boolean): Promise<void>;
  /**
   * Used to set the log level. Useful for debugging issues with the lovely team @RevenueCat.
   * The default is {LOG_LEVEL.INFO} in release builds and {LOG_LEVEL.DEBUG} in debug builds.
   * @param {LOG_LEVEL} level
   */
  static setLogLevel(level: LOG_LEVEL): Promise<void>;
  /**
   * Set a custom log handler for redirecting logs to your own logging system.
   * By default, this sends info, warning, and error messages.
   * If you wish to receive Debug level messages, see [setLogLevel].
   * @param {LogHandler} logHandler It will get called for each log event.
   * Use this function to redirect the log to your own logging system
   */
  static setLogHandler(logHandler: LogHandler): void;
  /**
   * Gets current customer info
   * @returns {Promise<CustomerInfo>} A promise of a customer info object. Rejections return an error code, and an
   * userInfo object with more information. The promise will be rejected if configure has not been called yet or if
   * there's an issue getting the customer information.
   */
  static getCustomerInfo(): Promise<CustomerInfo>;
  /**
   * This method will send all the purchases to the RevenueCat backend. Call this when using your own implementation
   * for subscriptions anytime a sync is needed, like after a successful purchase.
   *
   * @warning This function should only be called if you're not calling purchaseProduct/purchaseStoreProduct/purchasePackage/purchaseSubscriptionOption.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * syncing purchases.
   */
  static syncPurchases(): Promise<void>;
  /**
   * This method will send a purchase to the RevenueCat backend. This function should only be called if you are
   * in Amazon observer mode or performing a client side migration of your current users to RevenueCat.
   *
   * The receipt IDs are cached if successfully posted so they are not posted more than once.
   *
   * @param {string} productID Product ID associated to the purchase.
   * @param {string} receiptID ReceiptId that represents the Amazon purchase.
   * @param {string} amazonUserID Amazon's userID. This parameter will be ignored when syncing a Google purchase.
   * @param {(string|null|undefined)} isoCurrencyCode Product's currency code in ISO 4217 format.
   * @param {(number|null|undefined)} price Product's price.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * syncing purchases.
   */
  static syncObserverModeAmazonPurchase(
    productID: string,
    receiptID: string,
    amazonUserID: string,
    isoCurrencyCode?: string | null,
    price?: number | null,
  ): Promise<void>;
  /**
   * @deprecated, use enableAdServicesAttributionTokenCollection instead.
   * Enable automatic collection of Apple Search Ad attribution. Disabled by default
   * @param {boolean} enabled Enable or not automatic apple search ads attribution collection
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static setAutomaticAppleSearchAdsAttributionCollection(
    enabled: boolean,
  ): Promise<void>;
  /**
   * Enable automatic collection of Apple Search Ad attribution on iOS. Disabled by default
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static enableAdServicesAttributionTokenCollection(): Promise<void>;
  /**
   * @returns { Promise<boolean> } If the `appUserID` has been generated by RevenueCat or not.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet.
   */
  static isAnonymous(): Promise<boolean>;
  /**
   * iOS only. Computes whether or not a user is eligible for the introductory pricing period of a given product.
   * You should use this method to determine whether or not you show the user the normal product price or the
   * introductory price. This also applies to trials (trials are considered a type of introductory pricing).
   *
   * @note Subscription groups are automatically collected for determining eligibility. If RevenueCat can't
   * definitively compute the eligibility, most likely because of missing group information, it will return
   * `INTRO_ELIGIBILITY_STATUS_UNKNOWN`. The best course of action on unknown status is to display the non-intro
   * pricing, to not create a misleading situation. To avoid this, make sure you are testing with the latest version of
   * iOS so that the subscription group can be collected by the SDK. Android always returns INTRO_ELIGIBILITY_STATUS_UNKNOWN.
   *
   * @param productIdentifiers Array of product identifiers for which you want to compute eligibility
   * @returns { Promise<[productId: string]: IntroEligibility> } A map of IntroEligility per productId. The promise
   * will be rejected if configure has not been called yet or if there's in an error checking eligibility.
   */
  static checkTrialOrIntroductoryPriceEligibility(
    productIdentifiers: string[],
  ): Promise<{
    [productId: string]: IntroEligibility;
  }>;
  /**
   * iOS only. Use this function to retrieve the `PurchasesPromotionalOffer` for a given `PurchasesPackage`.
   *
   * @param product The `PurchasesStoreProduct` the user intends to purchase.
   * @param discount The `PurchasesStoreProductDiscount` to apply to the product.
   * @returns { Promise<PurchasesPromotionalOffer> } Returns when the `PurchasesPaymentDiscount` is returned.
   * Null is returned for Android and incompatible iOS versions. The promise will be rejected if configure has not been
   * called yet or if there's an error getting the payment discount.
   */
  static getPromotionalOffer(
    product: PurchasesStoreProduct,
    discount: PurchasesStoreProductDiscount,
  ): Promise<PurchasesPromotionalOffer | undefined>;
  /**
   * Invalidates the cache for customer information.
   *
   * Most apps will not need to use this method; invalidating the cache can leave your app in an invalid state.
   * Refer to https://docs.revenuecat.com/docs/customer-info#section-get-user-information for more information on
   * using the cache properly.
   *
   * This is useful for cases where customer information might have been updated outside of the app, like if a
   * promotional subscription is granted through the RevenueCat dashboard.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
   * invalidating the customer info cache.
   */
  static invalidateCustomerInfoCache(): Promise<void>;
  /** iOS only. Presents a code redemption sheet, useful for redeeming offer codes
   * Refer to https://docs.revenuecat.com/docs/ios-subscription-offers#offer-codes for more information on how
   * to configure and use offer codes
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
   * presenting the code redemption sheet.
   */
  static presentCodeRedemptionSheet(): Promise<void>;
  /**
   * Subscriber attributes are useful for storing additional, structured information on a user.
   * Since attributes are writable using a public key they should not be used for
   * managing secure or sensitive information such as subscription status, coins, etc.
   *
   * Key names starting with "$" are reserved names used by RevenueCat. For a full list of key
   * restrictions refer to our guide: https://docs.revenuecat.com/docs/subscriber-attributes
   *
   * @param attributes Map of attributes by key. Set the value as an empty string to delete an attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or there's an error
   * setting the subscriber attributes.
   */
  static setAttributes(attributes: {
    [key: string]: string | null;
  }): Promise<void>;
  /**
   * Subscriber attribute associated with the email address for the user
   *
   * @param email Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the email.
   */
  static setEmail(email: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the phone number for the user
   *
   * @param phoneNumber Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the phone number.
   */
  static setPhoneNumber(phoneNumber: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the display name for the user
   *
   * @param displayName Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the display name.
   */
  static setDisplayName(displayName: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the push token for the user
   *
   * @param pushToken null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the push token.
   */
  static setPushToken(pushToken: string | null): Promise<void>;
  /**
   * Set this property to your proxy URL before configuring Purchases *only* if you've received a proxy key value
   * from your RevenueCat contact.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the proxy url.
   */
  static setProxyURL(url: string): Promise<void>;
  /**
   * Automatically collect subscriber attributes associated with the device identifiers.
   * $idfa, $idfv, $ip on iOS
   * $gpsAdId, $androidId, $ip on Android
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting collecting the device identifiers.
   */
  static collectDeviceIdentifiers(): Promise<void>;
  /**
   * Subscriber attribute associated with the Adjust Id for the user
   * Required for the RevenueCat Adjust integration
   *
   * @param adjustID Adjust ID to use in Adjust integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting Adjust ID.
   */
  static setAdjustID(adjustID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the AppsFlyer Id for the user
   * Required for the RevenueCat AppsFlyer integration
   * @param appsflyerID Appsflyer ID to use in Appsflyer integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Appsflyer ID.
   */
  static setAppsflyerID(appsflyerID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the Facebook SDK Anonymous Id for the user
   * Recommended for the RevenueCat Facebook integration
   *
   * @param fbAnonymousID Facebook Anonymous ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Facebook Anonymous ID.
   */
  static setFBAnonymousID(fbAnonymousID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the mParticle Id for the user
   * Recommended for the RevenueCat mParticle integration
   *
   * @param mparticleID Mparticle ID to use in Mparticle integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Mparticle ID.
   */
  static setMparticleID(mparticleID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the CleverTap Id for the user
   * Required for the RevenueCat CleverTap integration
   *
   * @param cleverTapID CleverTap user ID to use in CleverTap integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the CleverTap ID.
   */
  static setCleverTapID(cleverTapID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the Mixpanel Distinct Id for the user
   * Required for the RevenueCat Mixpanel integration
   *
   * @param mixpanelDistinctID Mixpanel Distinct ID to use in Mixpanel integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Mixpanel Distinct ID.
   */
  static setMixpanelDistinctID(
    mixpanelDistinctID: string | null,
  ): Promise<void>;
  /**
   * Subscriber attribute associated with the Firebase App Instance ID for the user
   * Required for the RevenueCat Firebase integration
   *
   * @param firebaseAppInstanceID Firebase App Instance ID to use in Firebase integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Firebase App Instance ID.
   */
  static setFirebaseAppInstanceID(
    firebaseAppInstanceID: string | null,
  ): Promise<void>;
  /**
   * Subscriber attribute associated with the OneSignal Player Id for the user
   * Required for the RevenueCat OneSignal integration
   *
   * @param onesignalID OneSignal Player ID to use in OneSignal integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the OneSignal ID.
   */
  static setOnesignalID(onesignalID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the Airship Channel Id for the user
   * Required for the RevenueCat Airship integration
   *
   * @param airshipChannelID Airship Channel ID to use in Airship integration. Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the Airship Channel ID.
   */
  static setAirshipChannelID(airshipChannelID: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install media source for the user
   *
   * @param mediaSource Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the media source.
   */
  static setMediaSource(mediaSource: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install campaign for the user
   *
   * @param campaign Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the campaign.
   */
  static setCampaign(campaign: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install ad group for the user
   *
   * @param adGroup Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting ad group.
   */
  static setAdGroup(adGroup: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install ad for the user
   *
   * @param ad Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the ad subscriber attribute.
   */
  static setAd(ad: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install keyword for the user
   *
   * @param keyword Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the keyword.
   */
  static setKeyword(keyword: string | null): Promise<void>;
  /**
   * Subscriber attribute associated with the install ad creative for the user
   *
   * @param creative Empty String or null will delete the subscriber attribute.
   * @returns {Promise<void>} The promise will be rejected if configure has not been called yet or if there's an error
   * setting the creative subscriber attribute.
   */
  static setCreative(creative: string | null): Promise<void>;
  /**
   * Check if billing is supported for the current user (meaning IN-APP purchases are supported)
   * and optionally, whether a list of specified feature types are supported.
   *
   * Note: Billing features are only relevant to Google Play Android users.
   * For other stores and platforms, billing features won't be checked.
   *
   * @param features An array of feature types to check for support. Feature types must be one of
   *       [BILLING_FEATURE]. By default, is an empty list and no specific feature support will be checked.
   * @returns {Promise<boolean>} promise with boolean response. True if billing is supported, false otherwise.
   */
  static canMakePayments(features?: BILLING_FEATURE[]): Promise<boolean>;
  /**
   * iOS 15+ only. Presents a refund request sheet in the current window scene for
   * the latest transaction associated with the active entitlement.
   *
   * If the request was unsuccessful, no active entitlements could be found for
   * the user, or multiple active entitlements were found for the user,
   * the promise will return an error.
   * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
   *
   * Important: This method should only be used if your user can only have a single active entitlement at a given time.
   * If a user could have more than one entitlement at a time, use `beginRefundRequestForEntitlement` instead.
   *
   * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
   *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
   */
  static beginRefundRequestForActiveEntitlement(): Promise<REFUND_REQUEST_STATUS>;
  /**
   * iOS 15+ only. Presents a refund request sheet in the current window scene for
   * the latest transaction associated with the `entitlement`.
   *
   * If the request was unsuccessful, the promise will return an error.
   * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
   *
   * @param entitlementInfo The entitlement to begin a refund request for.
   * @returns {Promise<REFUND_REQUEST_STATUS>} Returns REFUND_REQUEST_STATUS: The status of the
   *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
   */
  static beginRefundRequestForEntitlement(
    entitlementInfo: PurchasesEntitlementInfo,
  ): Promise<REFUND_REQUEST_STATUS>;
  /**
   * iOS 15+ only. Presents a refund request sheet in the current window scene for
   * the latest transaction associated with the `product`.
   *
   * If the request was unsuccessful, the promise will return an error.
   * If called in an unsupported platform (Android or iOS < 15), an `UnsupportedPlatformException` will be thrown.
   *
   * @param storeProduct The StoreProduct to begin a refund request for.
   * @returns {Promise<REFUND_REQUEST_STATUS>} Returns a REFUND_REQUEST_STATUS: The status of the
   *  refund request. Keep in mind the status could be REFUND_REQUEST_STATUS.USER_CANCELLED
   */
  static beginRefundRequestForProduct(
    storeProduct: PurchasesStoreProduct,
  ): Promise<REFUND_REQUEST_STATUS>;
  /**
   * Check if configure has finished and Purchases has been configured.
   *
   * @returns {Promise<Boolean>} promise with boolean response
   */
  static isConfigured(): Promise<boolean>;
  private static throwIfNotConfigured;
  private static throwIfAndroidPlatform;
  private static throwIfIOSPlatform;
  private static convertIntToRefundRequestStatus;
}

export declare enum PACKAGE_TYPE {
  /**
   * A package that was defined with a custom identifier.
   */
  UNKNOWN = "UNKNOWN",
  /**
   * A package that was defined with a custom identifier.
   */
  CUSTOM = "CUSTOM",
  /**
   * A package configured with the predefined lifetime identifier.
   */
  LIFETIME = "LIFETIME",
  /**
   * A package configured with the predefined annual identifier.
   */
  ANNUAL = "ANNUAL",
  /**
   * A package configured with the predefined six month identifier.
   */
  SIX_MONTH = "SIX_MONTH",
  /**
   * A package configured with the predefined three month identifier.
   */
  THREE_MONTH = "THREE_MONTH",
  /**
   * A package configured with the predefined two month identifier.
   */
  TWO_MONTH = "TWO_MONTH",
  /**
   * A package configured with the predefined monthly identifier.
   */
  MONTHLY = "MONTHLY",
  /**
   * A package configured with the predefined weekly identifier.
   */
  WEEKLY = "WEEKLY",
}
export declare enum INTRO_ELIGIBILITY_STATUS {
  /**
   * RevenueCat doesn't have enough information to determine eligibility.
   */
  INTRO_ELIGIBILITY_STATUS_UNKNOWN = 0,
  /**
   * The user is not eligible for a free trial or intro pricing for this product.
   */
  INTRO_ELIGIBILITY_STATUS_INELIGIBLE = 1,
  /**
   * The user is eligible for a free trial or intro pricing for this product.
   */
  INTRO_ELIGIBILITY_STATUS_ELIGIBLE = 2,
  /**
   * There is no free trial or intro pricing for this product.
   */
  INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS = 3,
}
export interface PurchasesStoreProduct {
  /**
   * Product Id.
   */
  readonly identifier: string;
  /**
   * Description of the product.
   */
  readonly description: string;
  /**
   * Title of the product.
   */
  readonly title: string;
  /**
   * Price of the product in the local currency.
   * Contains the price value of defaultOption for Google Play.
   */
  readonly price: number;
  /**
   * Formatted price of the item, including its currency sign.
   * Contains the formatted price value of defaultOption for Google Play.
   */
  readonly priceString: string;
  /**
   * Currency code for price and original price.
   * Contains the currency code value of defaultOption for Google Play.
   */
  readonly currencyCode: string;
  /**
   * Introductory price.
   */
  readonly introPrice: PurchasesIntroPrice | null;
  /**
   * Collection of discount offers for a product. Null for Android.
   */
  readonly discounts: PurchasesStoreProductDiscount[] | null;
  /**
   * Product category.
   */
  readonly productCategory: PRODUCT_CATEGORY | null;
  /**
   * Subscription period, specified in ISO 8601 format. For example,
   * P1W equates to one week, P1M equates to one month,
   * P3M equates to three months, P6M equates to six months,
   * and P1Y equates to one year.
   * Note: Not available for Amazon.
   */
  readonly subscriptionPeriod: string | null;
  /**
   * Default subscription option for a product. Google Play only.
   */
  readonly defaultOption: SubscriptionOption | null;
  /**
   * Collection of subscription options for a product. Google Play only.
   */
  readonly subscriptionOptions: SubscriptionOption[] | null;
  /**
   * Offering identifier the store product was presented from.
   * Null if not using offerings or if fetched directly from store via getProducts.
   */
  readonly presentedOfferingIdentifier: string | null;
}
export declare enum PRODUCT_CATEGORY {
  /**
   * A type of product for non-subscription.
   */
  NON_SUBSCRIPTION = "NON_SUBSCRIPTION",
  /**
   * A type of product for subscriptions.
   */
  SUBSCRIPTION = "SUBSCRIPTION",
  /**
   * A type of product for unknowns.
   */
  UNKNOWN = "UNKNOWN",
}
export interface PurchasesStoreProductDiscount {
  /**
   * Identifier of the discount.
   */
  readonly identifier: string;
  /**
   * Price in the local currency.
   */
  readonly price: number;
  /**
   * Formatted price, including its currency sign, such as €3.99.
   */
  readonly priceString: string;
  /**
   * Number of subscription billing periods for which the user will be given the discount, such as 3.
   */
  readonly cycles: number;
  /**
   * Billing period of the discount, specified in ISO 8601 format.
   */
  readonly period: string;
  /**
   * Unit for the billing period of the discount, can be DAY, WEEK, MONTH or YEAR.
   */
  readonly periodUnit: string;
  /**
   * Number of units for the billing period of the discount.
   */
  readonly periodNumberOfUnits: number;
}
export interface PurchasesIntroPrice {
  /**
   * Price in the local currency.
   */
  readonly price: number;
  /**
   * Formatted price, including its currency sign, such as €3.99.
   */
  readonly priceString: string;
  /**
   * Number of subscription billing periods for which the user will be given the discount, such as 3.
   */
  readonly cycles: number;
  /**
   * Billing period of the discount, specified in ISO 8601 format.
   */
  readonly period: string;
  /**
   * Unit for the billing period of the discount, can be DAY, WEEK, MONTH or YEAR.
   */
  readonly periodUnit: string;
  /**
   * Number of units for the billing period of the discount.
   */
  readonly periodNumberOfUnits: number;
}
/**
 * Contains information about the product available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesPackage {
  /**
   * Unique identifier for this package. Can be one a predefined package type or a custom one.
   */
  readonly identifier: string;
  /**
   * Package type for the product. Will be one of [PACKAGE_TYPE].
   */
  readonly packageType: PACKAGE_TYPE;
  /**
   * Product assigned to this package.
   */
  readonly product: PurchasesStoreProduct;
  /**
   * Offering this package belongs to.
   */
  readonly offeringIdentifier: string;
}
/**
 * An offering is a collection of Packages (`PurchasesPackage`) available for the user to purchase.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOffering {
  /**
   * Unique identifier defined in RevenueCat dashboard.
   */
  readonly identifier: string;
  /**
   * Offering description defined in RevenueCat dashboard.
   */
  readonly serverDescription: string;
  /**
   * Offering metadata defined in RevenueCat dashboard.
   */
  readonly metadata: Map<string, any>;
  /**
   * Array of `Package` objects available for purchase.
   */
  readonly availablePackages: PurchasesPackage[];
  /**
   * Lifetime package type configured in the RevenueCat dashboard, if available.
   */
  readonly lifetime: PurchasesPackage | null;
  /**
   * Annual package type configured in the RevenueCat dashboard, if available.
   */
  readonly annual: PurchasesPackage | null;
  /**
   * Six month package type configured in the RevenueCat dashboard, if available.
   */
  readonly sixMonth: PurchasesPackage | null;
  /**
   * Three month package type configured in the RevenueCat dashboard, if available.
   */
  readonly threeMonth: PurchasesPackage | null;
  /**
   * Two month package type configured in the RevenueCat dashboard, if available.
   */
  readonly twoMonth: PurchasesPackage | null;
  /**
   * Monthly package type configured in the RevenueCat dashboard, if available.
   */
  readonly monthly: PurchasesPackage | null;
  /**
   * Weekly package type configured in the RevenueCat dashboard, if available.
   */
  readonly weekly: PurchasesPackage | null;
}
/**
 * Contains all the offerings configured in RevenueCat dashboard.
 * For more info see https://docs.revenuecat.com/docs/entitlements
 */
export interface PurchasesOfferings {
  /**
   * Map of all Offerings [PurchasesOffering] objects keyed by their identifier.
   */
  readonly all: {
    [key: string]: PurchasesOffering;
  };
  /**
   * Current offering configured in the RevenueCat dashboard.
   */
  readonly current: PurchasesOffering | null;
}
/**
 * Holds the information used when upgrading from another sku. For Android use only.
 * @deprecated, use GoogleProductChangeInfo
 */
export interface UpgradeInfo {
  /**
   * The oldSKU to upgrade from.
   */
  readonly oldSKU: string;
  /**
   * The [PRORATION_MODE] to use when upgrading the given oldSKU.
   */
  readonly prorationMode?: PRORATION_MODE;
}
/**
 * Holds the information used when upgrading from another sku. For Android use only.
 */
export interface GoogleProductChangeInfo {
  /**
   * The old product identifier to upgrade from.
   */
  readonly oldProductIdentifier: string;
  /**
   * The [PRORATION_MODE] to use when upgrading the given oldSKU.
   */
  readonly prorationMode?: PRORATION_MODE;
}
/**
 * Holds the introductory price status
 */
export interface IntroEligibility {
  /**
   * The introductory price eligibility status
   */
  readonly status: INTRO_ELIGIBILITY_STATUS;
  /**
   * Description of the status
   */
  readonly description: string;
}
export interface PurchasesPromotionalOffer {
  readonly identifier: string;
  readonly keyIdentifier: string;
  readonly nonce: string;
  readonly signature: string;
  readonly timestamp: number;
}
export declare enum PRORATION_MODE {
  UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY = 0,
  /**
   * Replacement takes effect immediately, and the remaining time will be
   * prorated and credited to the user. This is the current default behavior.
   */
  IMMEDIATE_WITH_TIME_PRORATION = 1,
  /**
   * Replacement takes effect immediately, and the billing cycle remains the
   * same. The price for the remaining period will be charged. This option is
   * only available for subscription upgrade.
   */
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE = 2,
  /**
   * Replacement takes effect immediately, and the new price will be charged on
   * next recurrence time. The billing cycle stays the same.
   */
  IMMEDIATE_WITHOUT_PRORATION = 3,
  /**
   * Replacement takes effect when the old plan expires, and the new price will
   * be charged at the same time.
   */
  DEFERRED = 4,
  /**
   * Replacement takes effect immediately, and the user is charged full price
   * of new plan and is given a full billing cycle of subscription,
   * plus remaining prorated time from the old plan.
   */
  IMMEDIATE_AND_CHARGE_FULL_PRICE = 5,
}
/**
 * Contains all details associated with a SubscriptionOption
 * Used only for Google
 */
export interface SubscriptionOption {
  /**
   * Identifier of the subscription option
   * If this SubscriptionOption represents a base plan, this will be the basePlanId.
   * If it represents an offer, it will be {basePlanId}:{offerId}
   */
  readonly id: string;
  /**
   * Identifier of the StoreProduct associated with this SubscriptionOption
   * This will be {subId}:{basePlanId}
   */
  readonly storeProductId: string;
  /**
   * Identifer of the subscription associated with this SubscriptionOption
   * This will be {subId}
   */
  readonly productId: string;
  /**
   * Pricing phases defining a user's payment plan for the product over time.
   */
  readonly pricingPhases: PricingPhase[];
  /**
   * Tags defined on the base plan or offer. Empty for Amazon.
   */
  readonly tags: string[];
  /**
   * True if this SubscriptionOption represents a subscription base plan (rather than an offer).
   */
  readonly isBasePlan: boolean;
  /**
   * The subscription period of fullPricePhase (after free and intro trials).
   */
  readonly billingPeriod: Period | null;
  /**
   * True if the subscription is pre-paid.
   */
  readonly isPrepaid: boolean;
  /**
   * The full price PricingPhase of the subscription.
   * Looks for the last price phase of the SubscriptionOption.
   */
  readonly fullPricePhase: PricingPhase | null;
  /**
   * The free trial PricingPhase of the subscription.
   * Looks for the first pricing phase of the SubscriptionOption where amountMicros is 0.
   * There can be a freeTrialPhase and an introductoryPhase in the same SubscriptionOption.
   */
  readonly freePhase: PricingPhase | null;
  /**
   * The intro trial PricingPhase of the subscription.
   * Looks for the first pricing phase of the SubscriptionOption where amountMicros is greater than 0.
   * There can be a freeTrialPhase and an introductoryPhase in the same SubscriptionOption.
   */
  readonly introPhase: PricingPhase | null;
  /**
   * Offering identifier the subscription option was presented from
   */
  readonly presentedOfferingIdentifier: string | null;
}
/**
 * Contains all the details associated with a PricingPhase
 */
export interface PricingPhase {
  /**
   * Billing period for which the PricingPhase applies
   */
  readonly billingPeriod: Period;
  /**
   * Recurrence mode of the PricingPhase
   */
  readonly recurrenceMode: RECURRENCE_MODE | null;
  /**
   * Number of cycles for which the pricing phase applies.
   * Null for infiniteRecurring or finiteRecurring recurrence modes.
   */
  readonly billingCycleCount: number | null;
  /**
   * Price of the PricingPhase
   */
  readonly price: Price;
  /**
   * Indicates how the pricing phase is charged for finiteRecurring pricing phases
   */
  readonly offerPaymentMode: OFFER_PAYMENT_MODE | null;
}
/**
 * Recurrence mode for a pricing phase
 */
export declare enum RECURRENCE_MODE {
  /**
   * Pricing phase repeats infinitely until cancellation
   */
  INFINITE_RECURRING = 1,
  /**
   * Pricing phase repeats for a fixed number of billing periods
   */
  FINITE_RECURRING = 2,
  /**
   * Pricing phase does not repeat
   */
  NON_RECURRING = 3,
}
/**
 * Payment mode for offer pricing phases. Google Play only.
 */
export declare enum OFFER_PAYMENT_MODE {
  /**
   * Subscribers don't pay until the specified period ends
   */
  FREE_TRIAL = "FREE_TRIAL",
  /**
   * Subscribers pay up front for a specified period
   */
  SINGLE_PAYMENT = "SINGLE_PAYMENT",
  /**
   * Subscribers pay a discounted amount for a specified number of periods
   */
  DISCOUNTED_RECURRING_PAYMENT = "DISCOUNTED_RECURRING_PAYMENT",
}
/**
 * Contains all the details associated with a Price
 */
export interface Price {
  /**
   * Formatted price of the item, including its currency sign. For example $3.00
   */
  readonly formatted: string;
  /**
   * Price in micro-units, where 1,000,000 micro-units equal one unit of the currency.
   *
   * For example, if price is "€7.99", price_amount_micros is 7,990,000. This value represents
   * the localized, rounded price for a particular currency.
   */
  readonly amountMicros: number;
  /**
   * Returns ISO 4217 currency code for price and original price.
   *
   * For example, if price is specified in British pounds sterling, price_currency_code is "GBP".
   * If currency code cannot be determined, currency symbol is returned.
   */
  readonly currencyCode: string;
}
/**
 * Contains all the details associated with a Period
 */
export interface Period {
  /**
   * The number of period units: day, week, month, year, unknown
   */
  readonly unit: PERIOD_UNIT;
  /**
   * The increment of time that a subscription period is specified in
   */
  readonly value: number;
  /**
   * Specified in ISO 8601 format. For example, P1W equates to one week,
   * P1M equates to one month, P3M equates to three months, P6M equates to six months,
   * and P1Y equates to one year
   */
  readonly iso8601: string;
}
/**
 * Time duration unit for Period.
 */
export declare enum PERIOD_UNIT {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  YEAR = "YEAR",
  UNKNOWN = "UNKNOWN",
}

/**
 * The EntitlementInfo object gives you access to all of the information about the status of a user entitlement.
 */
export interface PurchasesEntitlementInfo {
  /**
   * The entitlement identifier configured in the RevenueCat dashboard
   */
  readonly identifier: string;
  /**
   * True if the user has access to this entitlement
   */
  readonly isActive: boolean;
  /**
   * True if the underlying subscription is set to renew at the end of the billing period (expirationDate).
   */
  readonly willRenew: boolean;
  /**
   * The last period type this entitlement was in. Either: NORMAL, INTRO, TRIAL.
   */
  readonly periodType: string;
  /**
   * The latest purchase or renewal date for the entitlement.
   */
  readonly latestPurchaseDate: string;
  /**
   * The first date this entitlement was purchased.
   */
  readonly originalPurchaseDate: string;
  /**
   * The expiration date for the entitlement, can be `null` for lifetime access. If the `periodType` is `trial`,
   * this is the trial expiration date.
   */
  readonly expirationDate: string | null;
  /**
   * The store where this entitlement was unlocked from.
   */
  readonly store:
    | "PLAY_STORE"
    | "APP_STORE"
    | "STRIPE"
    | "MAC_APP_STORE"
    | "PROMOTIONAL"
    | "AMAZON"
    | "UNKNOWN_STORE";
  /**
   * The product identifier that unlocked this entitlement
   */
  readonly productIdentifier: string;
  /**
   * False if this entitlement is unlocked via a production purchase
   */
  readonly isSandbox: boolean;
  /**
   * The date an unsubscribe was detected. Can be `null`.
   *
   * @note: Entitlement may still be active even if user has unsubscribed. Check the `isActive` property.
   */
  readonly unsubscribeDetectedAt: string | null;
  /**
   * The date a billing issue was detected. Can be `null` if there is no billing issue or an issue has been resolved
   *
   * @note: Entitlement may still be active even if there is a billing issue. Check the `isActive` property.
   */
  readonly billingIssueDetectedAt: string | null;
}
/**
 * Contains all the entitlements associated to the user.
 */
export interface PurchasesEntitlementInfos {
  /**
   * Map of all EntitlementInfo (`PurchasesEntitlementInfo`) objects (active and inactive) keyed by entitlement identifier.
   */
  readonly all: {
    [key: string]: PurchasesEntitlementInfo;
  };
  /**
   * Map of active EntitlementInfo (`PurchasesEntitlementInfo`) objects keyed by entitlement identifier.
   */
  readonly active: {
    [key: string]: PurchasesEntitlementInfo;
  };
}
export interface CustomerInfo {
  /**
   * Entitlements attached to this customer info
   */
  readonly entitlements: PurchasesEntitlementInfos;
  /**
   * Set of active subscription skus
   */
  readonly activeSubscriptions: string[];
  /**
   * Set of purchased skus, active and inactive
   */
  readonly allPurchasedProductIdentifiers: string[];
  /**
   * The latest expiration date of all purchased skus
   */
  readonly latestExpirationDate: string | null;
  /**
   * The date this user was first seen in RevenueCat.
   */
  readonly firstSeen: string;
  /**
   * The original App User Id recorded for this user.
   */
  readonly originalAppUserId: string;
  /**
   * Date when this info was requested
   */
  readonly requestDate: string;
  /**
   * Map of skus to expiration dates
   */
  readonly allExpirationDates: {
    [key: string]: string | null;
  };
  /**
   * Map of skus to purchase dates
   */
  readonly allPurchaseDates: {
    [key: string]: string | null;
  };
  /**
   * Returns the version number for the version of the application when the
   * user bought the app. Use this for grandfathering users when migrating
   * to subscriptions.
   *
   * This corresponds to the value of CFBundleVersion (in iOS) in the
   * Info.plist file when the purchase was originally made. This is always null
   * in Android
   */
  readonly originalApplicationVersion: string | null;
  /**
   * Returns the purchase date for the version of the application when the user bought the app.
   * Use this for grandfathering users when migrating to subscriptions.
   */
  readonly originalPurchaseDate: string | null;
  /**
   * URL to manage the active subscription of the user. If this user has an active iOS
   * subscription, this will point to the App Store, if the user has an active Play Store subscription
   * it will point there. If there are no active subscriptions it will be null.
   * If there are multiple for different platforms, it will point to the device store.
   */
  readonly managementURL: string | null;
  readonly nonSubscriptionTransactions: PurchasesStoreTransaction[];
}
/**
 * List of all non subscription transactions. Use this to fetch the history of
 * non-subscription purchases
 */
export interface PurchasesStoreTransaction {
  /**
   * Id of the transaction.
   */
  transactionIdentifier: string;
  /**
   * Product Id associated with the transaction.
   */
  productIdentifier: string;
  /**
   * Purchase date of the transaction in ISO 8601 format.
   */
  purchaseDate: string;
}
