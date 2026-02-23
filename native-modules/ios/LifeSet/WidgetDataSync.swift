import Foundation
import React
import WidgetKit

@objc(WidgetDataSync)
class WidgetDataSync: NSObject, RCTBridgeModule {
  
  static func moduleName() -> String! {
    return "WidgetDataSync"
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func syncWidgetData(_ data: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: "group.com.lifesetwellbeing.lifeset") else {
      reject("app_group_error", "Failed to access App Group UserDefaults. Ensure App Groups are configured correctly.", nil)
      return
    }
    
    sharedDefaults.set(data, forKey: "widgetData")
    sharedDefaults.synchronize()
    
    // Notify WidgetKit to reload the timeline for all widgets
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
    
    resolve(true)
  }
}

