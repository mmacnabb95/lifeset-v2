import React from 'react';
import { DashboardTile } from '../dashboardTile/dashboardTile';
import CommunityForumScreen from 'src/pages/user/communityForum/communityForum';
import constants from 'src/themes/constants';
import { StyleSheet, View, ViewStyle, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fireMediumHapticFeedback } from 'src/utils/haptics';

const styles = StyleSheet.create({
  tile: {
    padding: 0,
    overflow: 'hidden',
    height: 200,
    backgroundColor: constants.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: constants.grey300,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  } as ViewStyle,
  pressableContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  content: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  }
});

export const CommunityForumTile = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const handlePress = () => {
    fireMediumHapticFeedback();
    navigation.navigate('CommunityForum');
  };

  return (
    <DashboardTile style={styles.tile}>
      <Pressable 
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressableContainer,
          {
            opacity: pressed ? 0.9 : 1,
          }
        ]}
      >
        <CommunityForumScreen
          navigation={navigation}
          route={route}
          summaryOnly
          style={styles.content}
          scrollEnabled={false}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255, 165, 0, 0.08)', 'rgba(255, 165, 0, 0.12)']}
          style={styles.gradientOverlay}
        />
      </Pressable>
    </DashboardTile>
  );
}; 