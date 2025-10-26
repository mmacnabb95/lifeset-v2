import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import { useDispatch } from "react-redux";
import { Body, WebFadeIn } from "src/components/common";
import { Benefits } from "src/components/common/benefits/benefits";
import { HabitTrackerOverview } from "src/components/common/habitTrackerOverview/habitTrackerOverview";
import { Loading } from "src/components/common/loading/loading";
import { MindsetJournalOverview } from "src/components/common/mindsetJournalOverview/mindsetJournalOverview";
import { StreakLeaderBoard } from "src/components/common/streakLeaderboard/streakLeaderboard";
import { TodaysWorkout } from "src/components/common/todaysWorkout/todaysWorkout";
import { setHeaderTitle } from "src/redux/features/misc/slice";
import { HabitPackLeaderBoards } from "../habitPackLeaderboards/habitPackLeaderboards";
import { RandomInspoQuote } from "src/components/common/randomInspoQuote/randomInspoQuote";
import { usePreLoad } from "../preLoad/usePreLoad";
import { MeditationDashboardTile } from "src/components/common/meditationDashboardTile/meditationDashboardTile";
import { CommunityForumTile } from "src/components/common/communityForumTile/communityForumTile";
import { NutritionWidget } from "src/components/common/nutritionWidget/nutritionWidget";
import { DashboardTile } from "src/components/common/dashboardTile/dashboardTile";
import { PngIcon } from "src/components/common/pngIcon/pngIcon";
import { XPDisplay } from "src/components/XPDisplay";
import { Typography } from "src/components/common/typography";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { loadXPState, restoreXP, initializeXP } from "src/redux/domain/features/xp/collection-slice";

const usePageStyles = require("../../../themes/layout/styles/styles").default;

const UserDashboardScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const pageStyles = usePageStyles();
  const dispatch = useDispatch();
  const userInfo = useUserInfo();
  usePreLoad();

  const [firstRender, setFirstRender] = useState(true);
  const [xpInitialized, setXpInitialized] = useState(false);

  // Load saved XP state when dashboard mounts or when userId becomes available
  useEffect(() => {
    const loadSavedXP = async () => {
      const userId = userInfo?.userId;
      console.log('[XP] Dashboard - User info check:', { userId, xpInitialized, firstRender });
      
      if (userId && !xpInitialized) {
        try {
          console.log('[XP] Dashboard - First time loading XP for user:', userId);
          
          // Initialize first to ensure we have the user ID
          dispatch(initializeXP(userId));
          
          // Then load saved state
          const savedXPState = await loadXPState(userId);
          console.log('[XP] Dashboard - Loaded state:', savedXPState);
          
          if (savedXPState) {
            console.log('[XP] Dashboard - Restoring XP state with total:', savedXPState.totalXP);
            dispatch(restoreXP(savedXPState));
          }
          
          setXpInitialized(true);
        } catch (error) {
          console.error('[XP] Dashboard - Error in initial XP load:', error);
        }
      }
    };
    
    loadSavedXP();
  }, [dispatch, userInfo?.userId, xpInitialized]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      const userId = userInfo?.userId;
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        userId
      ) {
        console.log('[XP] Dashboard - App became active, checking XP state');
        try {
          const savedXPState = await loadXPState(userId);
          if (savedXPState) {
            console.log('[XP] Dashboard - Restoring XP state after activation:', savedXPState.totalXP);
            dispatch(restoreXP(savedXPState));
          }
        } catch (error) {
          console.error('[XP] Dashboard - Error reloading XP state:', error);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, userInfo?.userId]);

  useEffect(() => {
    setTimeout(() => {
      setFirstRender(false);
    }, 1000);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setHeaderTitle(""));
    }, [dispatch]),
  );

  const appState = useRef(AppState.currentState);

  return (
    <WebFadeIn>
      {firstRender && <Loading />}
      {!firstRender && (
        <View
          testID="user-dashboard"
          style={[
            pageStyles.page, 
            pageStyles.noMobPadding,
            { paddingTop: 113 }  // Increased to give more scroll header space
          ]}
        >
          <Body contentStyle={{ paddingBottom: 10 }}>
            <>
              <View style={[pageStyles.pageItems, pageStyles.paddingMob20]}>
                <View style={{ marginBottom: 16 }}>
                  <Typography 
                    text={userInfo?.name || ''}
                    style={{ fontSize: 20, fontWeight: '600' }}
                  />
                </View>

                <View style={[pageStyles.tileContainer]}>
                  <RandomInspoQuote />

                  <HabitTrackerOverview route={route} navigation={navigation} />

                  <View style={{ width: '100%', gap: 2 }}>
                    <View style={[pageStyles.row, { width: '100%', gap: 4 }]}>
                      <View style={{ flex: 1 }}>
                        <MindsetJournalOverview route={route} navigation={navigation} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <MeditationDashboardTile route={route} navigation={navigation} />
                      </View>
                    </View>

                    <View style={[pageStyles.row, { width: '100%', gap: 4 }]}>
                      <View style={{ flex: 1 }}>
                        <TodaysWorkout route={route} navigation={navigation} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <NutritionWidget route={route} navigation={navigation} />
                      </View>
                    </View>
                  </View>

                  <CommunityForumTile route={route} navigation={navigation} />
                  <Benefits route={route} navigation={navigation} />
                  <StreakLeaderBoard route={route} navigation={navigation} />
                  <HabitPackLeaderBoards
                    route={route}
                    navigation={navigation}
                  />
                </View>
              </View>
            </>
          </Body>
        </View>
      )}
    </WebFadeIn>
  );
};

const styles = {
  userInfoContainer: {
    marginBottom: 8,
    position: 'relative',
    left: 0,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
};

export default UserDashboardScreen;
