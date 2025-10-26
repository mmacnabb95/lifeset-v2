import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  getSubscriptionViews,
  subscriptionViewsLoading,
  subscriptionViewsSelector,
} from "src/redux/domain/features/subscriptionView/collection-slice";

export interface Subscription {
  status: "Active" | "Inactive";
}

export const useSubscriptions = (): Subscription => {
  const { userId } = useUserInfo();
  const dispatch = useDispatch();
  const loading = useSelector(subscriptionViewsLoading);

  const subscriptionResults = useSelector(subscriptionViewsSelector(userId));
  const subscription = subscriptionResults ? subscriptionResults[0] : undefined;

  useEffect(() => {
    if (loading) {
      return;
    }
    if (userId && !subscriptionResults) {
      console.info("Getting subscription");
      dispatch(getSubscriptionViews({ user: userId }));
    }
  }, [dispatch, userId, loading, subscriptionResults]);

  return {
    status: subscription?.PaymentStatus === "paid" ? "Active" : "Inactive",
  };
};
