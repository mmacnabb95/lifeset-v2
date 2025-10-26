import store from "src/redux/stores/store";
import { setPackages } from "./redux/slice";
import { getOfferings } from "./checkoutScreen";

export const loadSubscriptionPackages = async (userId: number) => {
  const _currentOfferings = await getOfferings(userId);

  if (
    !_currentOfferings?.availablePackages ||
    _currentOfferings.availablePackages.length === 0 ||
    _currentOfferings.availablePackages.length > 1
  ) {
    return false;
  }

  store.dispatch(setPackages(_currentOfferings.availablePackages));

  return true;

  // console.log(
  //   "availablePackages",
  //   JSON.stringify(_currentOfferings.availablePackages, null, 2),
  // );
};
