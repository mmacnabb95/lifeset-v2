const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Expo config plugin to add WidgetDataSync native module to Xcode project
 * This plugin copies the native module files and adds them to the Xcode project
 * iOS only - widgets are not supported on Android
 */
const withWidgetDataSync = (config) => {
  // Only run on iOS
  if (!config.ios) {
    return config;
  }

  // Step 1: Copy files from source to iOS project directory
  config = withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const iosPath = modConfig.modRequest.platformProjectRoot;
      const projectRoot = modConfig.modRequest.projectRoot;
      const sourcePath = path.join(projectRoot, 'native-modules', 'ios', 'LifeSet');
      const targetPath = path.join(iosPath, 'LifeSet');
      
      console.log('📦 Copying WidgetDataSync files...');
      console.log('   Source:', sourcePath);
      console.log('   Target:', targetPath);
      
      // Ensure target directory exists
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log('   Created target directory');
      }
      
      // Copy Swift file
      const swiftSource = path.join(sourcePath, 'WidgetDataSync.swift');
      const swiftTarget = path.join(targetPath, 'WidgetDataSync.swift');
      if (fs.existsSync(swiftSource)) {
        fs.copyFileSync(swiftSource, swiftTarget);
        console.log('✅ Copied WidgetDataSync.swift');
      } else {
        console.error('❌ WidgetDataSync.swift not found at:', swiftSource);
        throw new Error(`WidgetDataSync.swift not found at ${swiftSource}`);
      }
      
      // Copy bridge file
      const bridgeSource = path.join(sourcePath, 'WidgetDataSyncBridge.m');
      const bridgeTarget = path.join(targetPath, 'WidgetDataSyncBridge.m');
      if (fs.existsSync(bridgeSource)) {
        fs.copyFileSync(bridgeSource, bridgeTarget);
        console.log('✅ Copied WidgetDataSyncBridge.m');
      } else {
        console.error('❌ WidgetDataSyncBridge.m not found at:', bridgeSource);
        throw new Error(`WidgetDataSyncBridge.m not found at ${bridgeSource}`);
      }
      
      // Verify files were copied
      if (!fs.existsSync(swiftTarget) || !fs.existsSync(bridgeTarget)) {
        throw new Error('Failed to copy WidgetDataSync files');
      }
      
      console.log('✅ All WidgetDataSync files copied successfully');
      return modConfig;
    },
  ]);
  
  // Step 2: Add files to Xcode project (runs after Xcode project is generated)
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const iosPath = config.modRequest.platformProjectRoot;
    
    console.log('🔧 Adding WidgetDataSync files to Xcode project...');
    
    // Find the main target
    const targets = xcodeProject.pbxNativeTargetSection();
    let mainTargetUuid = null;
    for (const targetUuid in targets) {
      const target = targets[targetUuid];
      if (target.name && target.name === 'LifeSet') {
        mainTargetUuid = targetUuid;
        break;
      }
    }
    
    if (!mainTargetUuid) {
      console.warn('⚠️ Could not find LifeSet target in Xcode project');
      return config;
    }

    // Verify files exist before adding to project
    const swiftFile = path.join(iosPath, 'LifeSet', 'WidgetDataSync.swift');
    const objcFile = path.join(iosPath, 'LifeSet', 'WidgetDataSyncBridge.m');
    
    if (!fs.existsSync(swiftFile)) {
      console.error('❌ WidgetDataSync.swift not found at:', swiftFile);
      return config;
    }
    
    if (!fs.existsSync(objcFile)) {
      console.error('❌ WidgetDataSyncBridge.m not found at:', objcFile);
      return config;
    }

    // Add Swift file to Xcode project
    // Use a simpler approach: find the main group and add files there
    try {
      const swiftPath = 'LifeSet/WidgetDataSync.swift';
      
      // Check if file is already in project
      const fileRefs = xcodeProject.pbxFileReferenceSection();
      let alreadyAdded = false;
      for (const fileRefUuid in fileRefs) {
        const fileRef = fileRefs[fileRefUuid];
        if (fileRef.path && (fileRef.path === swiftPath || fileRef.path.includes('WidgetDataSync.swift'))) {
          alreadyAdded = true;
          break;
        }
      }
      
      if (!alreadyAdded) {
        // Find the main group (LifeSet group)
        const groups = xcodeProject.pbxGroupSection();
        let mainGroupUuid = null;
        for (const groupUuid in groups) {
          const group = groups[groupUuid];
          if (group.name === 'LifeSet' || (group.children && group.children.some((child) => child.comment === 'LifeSet'))) {
            mainGroupUuid = groupUuid;
            break;
          }
        }
        
        // Try to add file - use null for group to let Xcode auto-detect
        let swiftFileRef = null;
        try {
          swiftFileRef = xcodeProject.addFile(swiftPath, null, {
            lastKnownFileType: 'sourcecode.swift',
          });
        } catch (e) {
          // If that fails, try with the group
          try {
            swiftFileRef = xcodeProject.addFile(swiftPath, mainGroupUuid, {
              lastKnownFileType: 'sourcecode.swift',
            });
          } catch (e2) {
            console.warn('⚠️ Could not add file using addFile, files are copied but may need manual addition to Xcode project');
          }
        }
        
        if (swiftFileRef) {
          // Add to sources build phase
          try {
            xcodeProject.addToPbxSourcesBuildPhase(swiftFileRef);
          } catch (e) {
            // If that fails, try to find the sources phase manually
            console.log('⚠️ Could not add to sources phase automatically, file reference created');
          }
          console.log('✅ Added WidgetDataSync.swift to Xcode project');
        } else {
          console.warn('⚠️ Could not create file reference for WidgetDataSync.swift');
        }
      } else {
        console.log('ℹ️ WidgetDataSync.swift already in Xcode project');
      }
    } catch (error) {
      console.error('❌ Error adding WidgetDataSync.swift:', error.message);
      console.error('   Stack:', error.stack);
    }

    // Add Objective-C bridge to Xcode project
    try {
      const objcPath = 'LifeSet/WidgetDataSyncBridge.m';
      
      // Check if file is already in project
      const fileRefs = xcodeProject.pbxFileReferenceSection();
      let alreadyAdded = false;
      for (const fileRefUuid in fileRefs) {
        const fileRef = fileRefs[fileRefUuid];
        if (fileRef.path && (fileRef.path === objcPath || fileRef.path.includes('WidgetDataSyncBridge.m'))) {
          alreadyAdded = true;
          break;
        }
      }
      
      if (!alreadyAdded) {
        // Find the main group (LifeSet group)
        const groups = xcodeProject.pbxGroupSection();
        let mainGroupUuid = null;
        for (const groupUuid in groups) {
          const group = groups[groupUuid];
          if (group.name === 'LifeSet' || (group.children && group.children.some((child) => child.comment === 'LifeSet'))) {
            mainGroupUuid = groupUuid;
            break;
          }
        }
        
        // Try to add file - use null for group to let Xcode auto-detect
        let objcFileRef = null;
        try {
          objcFileRef = xcodeProject.addFile(objcPath, null, {
            lastKnownFileType: 'sourcecode.c.objc',
          });
        } catch (e) {
          // If that fails, try with the group
          try {
            objcFileRef = xcodeProject.addFile(objcPath, mainGroupUuid, {
              lastKnownFileType: 'sourcecode.c.objc',
            });
          } catch (e2) {
            console.warn('⚠️ Could not add file using addFile, files are copied but may need manual addition to Xcode project');
          }
        }
        
        if (objcFileRef) {
          // Add to sources build phase
          try {
            xcodeProject.addToPbxSourcesBuildPhase(objcFileRef);
          } catch (e) {
            console.log('⚠️ Could not add to sources phase automatically, file reference created');
          }
          console.log('✅ Added WidgetDataSyncBridge.m to Xcode project');
        } else {
          console.warn('⚠️ Could not create file reference for WidgetDataSyncBridge.m');
        }
      } else {
        console.log('ℹ️ WidgetDataSyncBridge.m already in Xcode project');
      }
    } catch (error) {
      console.error('❌ Error adding WidgetDataSyncBridge.m:', error.message);
      console.error('   Stack:', error.stack);
    }

    console.log('✅ WidgetDataSync Xcode project setup complete');
    return config;
  });
  
  return config;
};

module.exports = withWidgetDataSync;
