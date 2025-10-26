import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Subscriptionview } from "../../../../../src/features/subscriptions/types/flat-types";
import {
  subscriptionViewsSelector,
  getSubscriptionViews,
  subscriptionViewsLoading,
} from "../redux/domain/features/subscriptionView/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { isNil } from "lodash";

export const useIsSubscribed = () => {
  const { userId } = useUserInfo();
  const dispatch = useDispatch();
  const _subscriptionResults = useSelector(subscriptionViewsSelector(userId));
  const loading = useSelector(subscriptionViewsLoading);
  const _subscription: Subscriptionview | undefined = _subscriptionResults
    ? _subscriptionResults[0]
    : undefined;

  useEffect(() => {
    const getSubs = async () => {
      await dispatch(getSubscriptionViews({ user: userId }));
    };

    if (userId && isNil(_subscriptionResults?.length) && !loading) {
      // console.log("getting subs");
      getSubs();
    }
  }, [_subscriptionResults, dispatch, loading, userId]);

  if (!_subscriptionResults) {
    return undefined; //we don't know yet
  }

  if (_subscriptionResults && _subscriptionResults.length === 0) {
    return false; //no sub yet
  }

  return _subscription?.PaymentStatus === "paid"; //only when paid do we have a valid sub
};
