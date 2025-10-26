import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { intialiseImageKit } from "src/lib/imagekit/lib/imagekit";
import {
  invalidateAuth,
  isFulfilled,
  isRejected,
  isTwoFactorAuthEnabled,
} from "src/redux/features/auth/slice";

export const useAuthed = ({
  inactiveMillisecondsLogout,
}: { inactiveMillisecondsLogout?: number } = {}) => {
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const fulfilled = useSelector(isFulfilled);
  const rejected = useSelector(isRejected);
  const dispatch = useDispatch();
  const lastActivity = useRef<any>(new Date());
  const timer = useRef<any>(null);
  const twoFactorEnabled = useSelector(isTwoFactorAuthEnabled);
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  const logoutAfterInactivityPeriod = useCallback(
    (inactiveMilliseconds: number): any => {
      return setTimeout(() => {
        const now = new Date() as any;
        // console.log("time since last activity", now - lastActivity.current);
        if (
          now - lastActivity.current > inactiveMilliseconds &&
          !twoFactorEnabled
        ) {
          dispatch({ type: "RESET_APP" });
          dispatch(invalidateAuth());
        } else if (
          now - lastActivity.current > thirtyDays &&
          twoFactorEnabled
        ) {
          // can stay inactive for how ever long token is configured to last (for now)
          //..if the app isn't used for this period jwt will fail on the server
          timer.current = logoutAfterInactivityPeriod(inactiveMilliseconds);
        } else {
          timer.current = logoutAfterInactivityPeriod(inactiveMilliseconds);
        }
      }, 10000);
    },
    [dispatch, thirtyDays, twoFactorEnabled],
  );

  const noteActivity = () => {
    // console.log("activity noted");
    lastActivity.current = new Date();
  };

  useEffect(() => {
    if (!authed || rejected) {
      AsyncStorage.getItem("token").then((token) => {
        if (token) {
          noteActivity();
          setAuthed(true);
          console.info("initialising imageKit");
          intialiseImageKit();
          // console.log("clearing timeout on auth true");
          clearTimeout(timer.current);
          timer.current = logoutAfterInactivityPeriod(
            inactiveMillisecondsLogout || 1000 * 60 * 5,
          );
        } else {
          setAuthed(false);
          console.log("clearing timeout on auth false");
          clearTimeout(timer.current);
        }
      });
    }
  }, [
    authed,
    fulfilled,
    inactiveMillisecondsLogout,
    logoutAfterInactivityPeriod,
    rejected,
  ]);

  return {
    authed,
    noteActivity,
  };
};
