import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  settingsSelector,
  updateSettings,
} from "src/redux/domain/features/settings/collection-slice";
import { Settings } from "../../../../types/domain/flat-types";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useCalendars } from "expo-localization";

const TimeZoneProvider = ({ children }: any) => {
  const { userId } = useUserInfo();
  const dispatch = useDispatch();
  const _settings: Settings = useSelector(settingsSelector(userId));
  const calendars = useCalendars();
  const { timeZone } = calendars[0];

  useEffect(() => {
    if (_settings?.Id && _settings.TimeZone !== timeZone) {
      dispatch(updateSettings({ Id: _settings.Id, TimeZone: timeZone! }));
    }
  }, [_settings?.Id, _settings?.TimeZone, dispatch, timeZone]);

  return <>{children}</>;
};

export default TimeZoneProvider;
