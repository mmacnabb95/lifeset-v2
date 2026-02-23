const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Expo config plugin for expo-widget-data-sync
 * This plugin copies the Swift module file to the iOS project and adds it to the Xcode project
 */
const withWidgetDataSync = (config) => {
  // First, copy the Swift file to the iOS project
  config = withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const iosPath = modConfig.modRequest.platformProjectRoot;
      const modulePath = path.join(modConfig.modRequest.projectRoot, 'expo-widget-data-sync');
      const swiftSource = path.join(modulePath, 'ios', 'expowidgetdatasync', 'WidgetDataSync.swift');
      const swiftTarget = path.join(iosPath, 'LifeSet', 'WidgetDataSync.swift');
      
      // Ensure target directory exists
      const targetDir = path.dirname(swiftTarget);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy Swift file
      if (fs.existsSync(swiftSource)) {
        fs.copyFileSync(swiftSource, swiftTarget);
        console.log('✅ Copied WidgetDataSync.swift to ios/LifeSet/');
      } else {
        console.warn('⚠️ WidgetDataSync.swift not found at:', swiftSource);
      }
      
      return modConfig;
    },
  ]);
  
  // Then, add the file to Xcode project
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const iosPath = config.modRequest.platformProjectRoot;
    
    // Find the main target
    const targets = xcodeProject.pbxNativeTargetSection();
    let mainTargetUuid = null;
    for (const targetUuid in targets) {
      const target = targets[targetUuid];
      if (target.name && (target.name === 'LifeSet' || target.name.includes('LifeSet'))) {
        mainTargetUuid = targetUuid;
        break;
      }
    }
    
    if (!mainTargetUuid) {
      console.warn('⚠️ Could not find main target');
      return config;
    }

    // Check if file exists
    const swiftFile = path.join(iosPath, 'LifeSet', 'WidgetDataSync.swift');
    if (!fs.existsSync(swiftFile)) {
      console.warn('⚠️ WidgetDataSync.swift not found, skipping Xcode project addition');
      return config;
    }

    // Add file to Xcode project
    const swiftPath = 'LifeSet/WidgetDataSync.swift';
    
    try {
      // Check if file is already in project
      const fileRefs = xcodeProject.pbxFileReferenceSection();
      let alreadyAdded = false;
      for (const fileRefUuid in fileRefs) {
        const fileRef = fileRefs[fileRefUuid];
        if (fileRef.path && fileRef.path.includes('WidgetDataSync.swift')) {
          alreadyAdded = true;
          break;
        }
      }
      
      if (!alreadyAdded) {
        const swiftFileRef = xcodeProject.addFile(swiftPath, mainTargetUuid, {
          lastKnownFileType: 'sourcecode.swift',
        });
        if (swiftFileRef) {
          xcodeProject.addToPbxSourcesBuildPhase(swiftFileRef);
          console.log('✅ Added WidgetDataSync.swift to Xcode project');
        }
      } else {
        console.log('ℹ️ WidgetDataSync.swift already in Xcode project');
      }
    } catch (error) {
      console.log('ℹ️ Error adding WidgetDataSync.swift to Xcode project:', error.message);
    }

    return config;
  });
};

module.exports = withWidgetDataSync;
