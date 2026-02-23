// Native module bridge for WidgetDataSync
// This bridges React Native to the native iOS module that writes to App Groups UserDefaults

import { NativeModules, Platform } from 'react-native';

const { WidgetDataSync } = NativeModules;

export interface WidgetDataSyncModule {
  syncWidgetData: (jsonData: string) => Promise<boolean>;
}

// Type-safe wrapper for the native module
export const syncWidgetDataToAppGroups = async (jsonData: string): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false; // Widgets only work on iOS
  }

  if (!WidgetDataSync) {
    console.error('⚠️ WidgetDataSync native module not available. Make sure the native module is properly linked.');
    throw new Error('WidgetDataSync native module not available. Make sure the native module is properly linked.');
  }

  try {
    return await WidgetDataSync.syncWidgetData(jsonData);
  } catch (error) {
    console.error('❌ Error syncing widget data to App Groups:', error);
    throw error;
  }
};

export default WidgetDataSync as WidgetDataSyncModule | undefined;

