#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataSync, NSObject)

RCT_EXTERN_METHOD(syncWidgetData:(NSString *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

