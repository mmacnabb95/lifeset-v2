import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to WidgetDataSync.web.ts
// and on native platforms to the native module.
const WidgetDataSyncModule = NativeModulesProxy.WidgetDataSync ?? {
  syncWidgetData: async (data: string): Promise<boolean> => {
    console.warn('WidgetDataSync native module not available');
    return false;
  },
};

export default WidgetDataSyncModule;
