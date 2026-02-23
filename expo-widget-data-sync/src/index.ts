import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to WidgetDataSync.web.ts
// and on native platforms to the native module.
import WidgetDataSyncModule from './WidgetDataSyncModule';

export async function syncWidgetData(jsonData: string): Promise<boolean> {
  return await WidgetDataSyncModule.syncWidgetData(jsonData);
}

export default {
  syncWidgetData,
};
