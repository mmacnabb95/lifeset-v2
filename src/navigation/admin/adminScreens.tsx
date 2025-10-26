import React from "react";
import { AuthScreens } from "../auth/authScreens";
import { hiddenOptions } from "../utils/hiddenMenuItem";
// TODO Phase 2: Admin dashboard not yet migrated
// import { LazyAdminDashboardScreen } from "../lazy/lazyScreens/admin/dashboard";
// TODO Phase 2: Admin user management pages not yet migrated
// import { LazyUsersScreen } from "src/pages/admin/users/users.lazy";
// import { LazyUserViewScreen } from "src/pages/admin/users/userView.lazy";
import { LazyExerciseEditListScreen } from "src/components/domain/pages/exercise/exercise.editListLazy";
import { LazyExerciseEditScreen } from "src/components/domain/pages/exercise/exercise.editLazy";
import { LazyWorkoutEditListScreen } from "src/components/domain/pages/workout/workout.editListLazy";
import { LazyWorkoutEditScreen } from "src/components/domain/pages/workout/workout.editLazy";
import { LazyWorkoutDayEditScreen } from "src/components/domain/pages/workoutDay/workoutDay.editLazy";
import { LazyWorkoutDayExerciseEditScreen } from "src/components/domain/pages/workoutDayExercise/workoutDayExercise.editLazy";
import { LazyWorkoutExerciseSetEditScreen } from "src/components/domain/pages/workoutExerciseSet/workoutExerciseSet.editLazy";
import { LazyCompanyEditListScreen } from "src/components/domain/pages/company/company.editListLazy";
import { LazyCompanyEditScreen } from "src/components/domain/pages/company/company.editLazy";
import { LazyCompanyUserEditScreen } from "src/components/domain/pages/companyUser/companyUser.editLazy";
import { LazyCompanyUserEditListScreen } from "src/components/domain/pages/companyUser/companyUser.editListLazy";
import { LazyHabitPackEditListScreen } from "src/components/domain/pages/habitPack/habitPack.editListLazy";
import { LazyHabitPackEditScreen } from "src/components/domain/pages/habitPack/habitPack.editLazy";
import { LazyHabitPackHabitEditScreen } from "src/components/domain/pages/habitPackHabit/habitPackHabit.editLazy";
import { LazyBenefitEditListScreen } from "src/components/domain/pages/benefit/benefit.editListLazy";
import { LazyBenefitEditScreen } from "src/components/domain/pages/benefit/benefit.editLazy";
import { LazyUserHabitPackEditScreen } from "src/components/domain/pages/userHabitPack/userHabitPack.editLazy";
import { LazyUserHabitPackHabitEditScreen } from "src/components/domain/pages/userHabitPackHabit/userHabitPackHabit.editLazy";
import { LazyAllUserHabitPackViewListScreen } from "src/components/domain/pages/allUserHabitPack/allUserHabitPack.viewListLazy";
import { LazyInspoQuoteEditListScreen } from "src/components/domain/pages/inspoQuote/inspoQuote.editListLazy";
import { LazyInspoQuoteEditScreen } from "src/components/domain/pages/inspoQuote/inspoQuote.editLazy";

export const AdminScreens = ({
  Drawer,
  RootStack,
}: {
  Drawer: any;
  RootStack: any;
}) => {
  return (
    <React.Fragment>
      {/* TODO Phase 2: Admin dashboard not yet migrated */}
      {/* <Drawer.Screen name="Dashboard" component={LazyAdminDashboardScreen} /> */}
      {/* TODO Phase 2: Admin user management pages not yet migrated */}
      {/* <Drawer.Screen name="Users" component={LazyUsersScreen} /> */}
      {/* <RootStack.Screen
        name="UserView"
        component={LazyUserViewScreen}
        options={hiddenOptions}
      /> */}
      <Drawer.Screen name="Exercise" component={LazyExerciseEditListScreen} />
      <RootStack.Screen
        name="ExerciseEdit"
        component={LazyExerciseEditScreen}
        options={hiddenOptions}
      />
      <Drawer.Screen name="Workout" component={LazyWorkoutEditListScreen} />
      <RootStack.Screen
        name="WorkoutEdit"
        component={LazyWorkoutEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="WorkoutDayEdit"
        component={LazyWorkoutDayEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="WorkoutDayExerciseEdit"
        component={LazyWorkoutDayExerciseEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="WorkoutExerciseSetEdit"
        component={LazyWorkoutExerciseSetEditScreen}
        options={hiddenOptions}
      />
      {/* <Drawer.Screen name="UserWorkouts" component={LazyUserWorkoutsScreen} />
      <RootStack.Screen
        name="UserWorkoutEdit"
        component={LazyUserWorkoutEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="UserWorkoutAssignment"
        component={LazyUserWorkoutAssignmentScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="UserWorkoutView"
        component={LazyUserWorkoutScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="UserWorkoutDay"
        component={LazyUserWorkoutDayScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="UserWorkoutDayExercise"
        component={LazyUserWorkoutDayExerciseScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="UserWorkoutExerciseSetEdit"
        component={LazyUserWorkoutExerciseSetEditScreen}
        options={hiddenOptions}
      /> */}
      <Drawer.Screen name="Company" component={LazyCompanyEditListScreen} />
      <RootStack.Screen
        name="CompanyEdit"
        component={LazyCompanyEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="CompanyUser"
        component={LazyCompanyUserEditListScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="CompanyUserEdit"
        component={LazyCompanyUserEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="HabitPack"
        component={LazyHabitPackEditListScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="HabitPackEdit"
        component={LazyHabitPackEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="HabitPackHabitEdit"
        component={LazyHabitPackHabitEditScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="Benefits"
        component={LazyBenefitEditListScreen}
        options={hiddenOptions}
      />
      <RootStack.Screen
        name="BenefitEdit"
        component={LazyBenefitEditScreen}
        options={hiddenOptions}
      />
      <Drawer.Screen name="AllUserHabitPacks">
        {(props: any) => (
          <LazyAllUserHabitPackViewListScreen {...props} showTitle={false} />
        )}
      </Drawer.Screen>
      <RootStack.Screen
        name="AllUserHabitPackView"
        component={LazyUserHabitPackEditScreen}
      />
      <RootStack.Screen
        name="UserHabitPackHabitEdit"
        component={LazyUserHabitPackHabitEditScreen}
      />
      <Drawer.Screen 
        name="InspoQuoteEditListScreen"
        component={LazyInspoQuoteEditListScreen}
      />
      <Drawer.Screen 
        name="InspoQuoteEdit"
        component={LazyInspoQuoteEditScreen}
      />

      {AuthScreens({ Navigator: RootStack })}
    </React.Fragment>
  );
};
