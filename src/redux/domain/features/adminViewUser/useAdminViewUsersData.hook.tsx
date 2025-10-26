import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminViewUsers,
  adminViewUsersSelector,
  clearAdminViewUserItems,
  adminViewUsersErrorSelector,
} from "./collection-slice";

const useAdminViewUsersData = () => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(adminViewUsersErrorSelector);
  const data = useSelector(adminViewUsersSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getAdminViewUsers({
        limit: 0,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearAdminViewUserItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useAdminViewUsersData;
