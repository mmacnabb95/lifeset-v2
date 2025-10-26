import { useDispatch, useSelector } from "react-redux";
import { hasPin } from "src/redux/features/auth/slice";
import { adminMode, setAdminMode } from "src/redux/features/misc/slice";

let timer: any;
const timoutSeconds = process.env.REACT_APP_ADMIN_MODE_TIMEOUT_SECONDS || 90;

export const useAdminModeTimer = () => {
  const _hasPin = useSelector(hasPin);
  const _inAdminMode = useSelector(adminMode);
  const dispatch = useDispatch();

  const startAdminModeTimer = (forceOn?: boolean) => {
    if (_hasPin || forceOn) {
      dispatch(setAdminMode(true));
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      dispatch(setAdminMode(false));
      console.log("leaving admin mode");
    }, 1000 * Number(timoutSeconds));
  };

  const stopAdminMode = () => {
    dispatch(setAdminMode(false));
    console.log("leaving admin mode");
  };

  return { startAdminModeTimer, inAdminMode: _inAdminMode, stopAdminMode };
};
