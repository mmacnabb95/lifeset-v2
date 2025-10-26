import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authSelector } from "../auth/slice";
import {
  clearUserInfoItems,
  getUserInfo,
  getUserInfoSelector,
  userInfoLoading,
} from "./slice";
import { useDebouncedCallback } from "use-debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUserInfo = () => {
  const dispatch = useDispatch();

  // const loading = useSelector(userInfoLoading);
  let resAuth = useSelector(authSelector) || undefined;
  let resInfo = useSelector(getUserInfoSelector) || {};
  const loading = useSelector(userInfoLoading);

  const debounced = useDebouncedCallback(() => {
    // console.log("getting info", loading);
    dispatch(getUserInfo());
  }, 1000);

  useEffect(() => {
    if (!resAuth?.userId && !resInfo?.userId && !loading) {
      AsyncStorage.getItem("token").then((token) => {
        if (token) {
          debounced();
        }
      });
    }
  }, [debounced, loading, resAuth, resAuth?.userId, resInfo?.userId]);

  return {
    userId: resAuth.userId || resInfo.userId,
    public_username: resAuth.username || resInfo.public_username,
    roles: resAuth.roles || resInfo.roles,
    language: resAuth.language || resInfo.language,
    name: resAuth?.name || resInfo.name,
    companyId: resAuth?.companyId || resInfo.companyId,
  };
};
