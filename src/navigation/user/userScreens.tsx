import React from "react";
import { LazyHabitEditScreen } from "src/components/domain/pages/habit/habit.editLazy";
// import { LazyHabitEditListScreen } from "src/components/domain/pages/habit/habit.editListLazy";
import { LazyDailyHabitsScreen } from "src/pages/user/dailyHabits/dailyHabits.lazy";
import { LazyHabitTrackingScreen } from "src/pages/user/habitTracking/habitTracking.lazy";
import { LazyPredefinedHabitsScreen } from "src/pages/user/predefinedHabits/predefinedHabits.lazy";

import { hiddenOptions } from "../utils/hiddenMenuItem";
import { LazyMyMindsetJournalScreen } from "../../pages/user/journal/lazy/index.lazy";
import { LazyMyMindsetJournalListScreen } from "../../pages/user/journal/lazy/list.lazy";
import { LazyJournalEditScreen } from "../../pages/user/journal/lazy/edit.lazy";
import { LazyJournalViewScreen } from "../../pages/user/journal/lazy/view.lazy";
import { LazyUserDashboardScreen } from "../lazy/lazyScreens/user/dashboard";
import { LazyBenefitViewListScreen } from "src/components/domain/pages/benefit/benefit.viewListLazy";
import { LazyUserWorkoutExerciseSetEditScreen } from "src/components/domain/pages/userWorkoutExerciseSet/userWorkoutExerciseSet.editLazy";
// TODO Phase 2: Admin workout management pages not yet migrated
// import { LazyUserWorkoutScreen } from "../lazy/lazyScreens/admin/userWorkout";
// import { LazyUserWorkoutAssignmentScreen } from "../lazy/lazyScreens/admin/userWorkoutAssignment";
// import { LazyUserWorkoutDayScreen } from "../lazy/lazyScreens/admin/userWorkoutDay";
// import { LazyUserWorkoutDayExerciseScreen } from "../lazy/lazyScreens/admin/userWorkoutDayExercise";
// import { LazyUserWorkoutEditScreen } from "../lazy/lazyScreens/admin/userWorkoutEdit";
import { LazyStreakLeaderboardScreen } from "../lazy/lazyScreens/user/streakLeaderboard";
import { LazyUserHabitPackEditScreen } from "src/components/domain/pages/userHabitPack/userHabitPack.editLazy";
import { LazyUserHabitPackEditListScreen } from "src/components/domain/pages/userHabitPack/userHabitPack.editListLazy";
import { LazyUserHabitPackHabitEditScreen } from "src/components/domain/pages/userHabitPackHabit/userHabitPackHabit.editLazy";
import { LazyHabitPackLeaderboardPage } from "../lazy/lazyScreens/userHabitPackLeaderboard";
import SubscriptionScreen from "src/features/subscriptions/pages/subscription/subscription";
import { LazyExploreFeaturesPage } from "../lazy/lazyScreens/exploreFeatures";
import { LazyBenefitViewListScreenOverride } from "src/components/domain/pages/benefit/benefit.viewListLazyOverride";
import { LazyMeditationScreen } from "../lazy/lazyScreens/user/meditation";
import { LazyMeditationSessionScreen } from "../lazy/lazyScreens/user/meditationSession";
import { LazyCommunityForumScreen } from "../lazy/lazyScreens/user/communityForum";
import { LazyForumPostScreen } from "../lazy/lazyScreens/user/forumPost";
import { LazyCreateForumPostScreen } from "../lazy/lazyScreens/user/createForumPost";
import { NutritionScreen } from '../../pages/user/nutrition/nutritionScreen';
import { LazyNutritionScreen } from "../lazy/lazyScreens/user/nutrition";
import { LazyRecipeScreen } from "../lazy/lazyScreens/user/recipe";
import { LazyWorkoutDashboardScreen } from "../lazy/lazyScreens/user/workoutDashboard";

export const UserScreens = ({
  Drawer,
  RootStack,
}: {
  Drawer: any;
  RootStack: any;
}) => {
  return (
    <React.Fragment>
      {/* <Drawer.Screen name="Habits" component={LazyHabitEditListScreen} /> */}
      <Drawer.Screen
        name="ExploreFeatures"
        component={LazyExploreFeaturesPage}
      />

      <Drawer.Screen name="Welcome" component={LazyUserDashboardScreen} />

      <Drawer.Screen name="Habits" component={LazyDailyHabitsScreen} />

      <Drawer.Screen name="Meditation" component={LazyMeditationScreen} />
      <RootStack.Screen
        name="MeditationSession"
        component={LazyMeditationSessionScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <Drawer.Screen name="CommunityForum" component={LazyCommunityForumScreen} />
      <RootStack.Screen
        name="ForumPost"
        component={LazyForumPostScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <RootStack.Screen
        name="CreateForumPost"
        component={LazyCreateForumPostScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <RootStack.Screen name="Subscription" component={SubscriptionScreen} />

      <RootStack.Screen
        name="HabitEdit"
        component={LazyHabitEditScreen}
        options={hiddenOptions}
      />

      <Drawer.Screen name="UserHabitPackEditList">
        {(props: any) => (
          <LazyUserHabitPackEditListScreen {...props} scrollEnabled={true} />
        )}
      </Drawer.Screen>
      <RootStack.Screen
        name="UserHabitPackEdit"
        component={LazyUserHabitPackEditScreen}
      />
      <RootStack.Screen
        name="UserHabitPackHabitEdit"
        component={LazyUserHabitPackHabitEditScreen}
      />
      <RootStack.Screen name="Tracking" component={LazyHabitTrackingScreen} />

      <Drawer.Screen
        name="PredefinedHabits"
        component={LazyPredefinedHabitsScreen}
      />

      {/* My Mindset Journal */}
      <Drawer.Screen name="Journal" component={LazyMyMindsetJournalScreen} />
      <RootStack.Screen
        name={"JournalList"}
        component={LazyMyMindsetJournalListScreen}
      />
      <RootStack.Screen
        name={"JournalEdit"}
        component={LazyJournalEditScreen}
      />
      <RootStack.Screen
        name={"JournalView"}
        component={LazyJournalViewScreen}
      />
      <RootStack.Screen
        name={"BenefitsView"}
        component={LazyBenefitViewListScreenOverride}
        options={{
          headerShown: true,
          headerTitle: "Toom",
        }}
      />

      {/* TODO Phase 2: Admin workout management pages not yet migrated */}
      {/* <Drawer.Screen name="UserWorkouts" component={LazyUserWorkoutsScreen} /> */}
      {/* <Drawer.Screen
        name="UserWorkoutEdit"
        component={LazyUserWorkoutEditScreen}
      /> */}
      {/* <RootStack.Screen
        name="UserWorkoutAssignment"
        component={LazyUserWorkoutAssignmentScreen}
        options={hiddenOptions}
      /> */}
      {/* <RootStack.Screen
        name="UserWorkoutView"
        component={LazyUserWorkoutScreen}
        options={hiddenOptions}
      /> */}
      {/* <RootStack.Screen
        name="UserWorkoutDay"
        component={LazyUserWorkoutDayScreen}
        options={hiddenOptions}
      /> */}
      {/* <RootStack.Screen
        name="UserWorkoutDayExercise"
        component={LazyUserWorkoutDayExerciseScreen}
        options={hiddenOptions}
      /> */}
      <RootStack.Screen
        name="UserWorkoutExerciseSetEdit"
        component={LazyUserWorkoutExerciseSetEditScreen}
        options={hiddenOptions}
      />

      <Drawer.Screen
        name="StreakLeaderboard"
        component={LazyStreakLeaderboardScreen}
      />

      <Drawer.Screen
        name="UserHabitPackLeaderBoard"
        component={LazyHabitPackLeaderboardPage}
      />

      <Drawer.Screen
        name="Nutrition"
        component={LazyNutritionScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <RootStack.Screen
        name="Recipe"
        component={LazyRecipeScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
        }}
      />

      <RootStack.Screen
        name="WorkoutDashboard"
        component={LazyWorkoutDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: "Workouts",
        }}
      />

    </React.Fragment>
  );
};
