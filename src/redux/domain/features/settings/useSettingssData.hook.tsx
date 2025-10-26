import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSettingss,
  settingssSelector,
  clearSettingsItems,
  settingssErrorSelector,
} from "./collection-slice";

const useSettingssData = (id?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(settingssErrorSelector);
  const data = useSelector(settingssSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getSettingss({
        limit: 0,
        id,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, id]);

  const clearData = useCallback(() => {
    dispatch(clearSettingsItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!id) {
      return;
    }
    refresh();
  }, [refresh, id]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useSettingssData;
