import React from "react";
import { hiddenOptions } from "../utils/hiddenMenuItem";
import { LazyCompanyUserEditScreen } from "src/components/domain/pages/companyUser/companyUser.editLazy";
import { LazyCompanyUserEditListScreen } from "src/components/domain/pages/companyUser/companyUser.editListLazy";
// TODO Phase 2: Company manager dashboard not yet migrated
// import { LazyManagerDashboardScreen } from "../lazy/lazyScreens/manager/dashboard";
import { LazyHabitPackEditScreen } from "src/components/domain/pages/habitPack/habitPack.editLazy";
import { LazyHabitPackEditListScreen } from "src/components/domain/pages/habitPack/habitPack.editListLazy";
import { LazyHabitPackHabitEditScreen } from "src/components/domain/pages/habitPackHabit/habitPackHabit.editLazy";
import { LazyBenefitEditListScreen } from "src/components/domain/pages/benefit/benefit.editListLazy";
import { LazyBenefitEditScreen } from "src/components/domain/pages/benefit/benefit.editLazy";
import { LazyExploreFeaturesPage } from "../lazy/lazyScreens/exploreFeatures";

export const CompanyManagerScreens = ({
  Drawer,
  RootStack,
}: {
  Drawer: any;
  RootStack: any;
}) => {
  return (
    <React.Fragment>
      {/* TODO Phase 2: Company manager dashboard not yet migrated */}
      {/* <Drawer.Screen
        name="CompanyDashboard"
        component={LazyManagerDashboardScreen}
      /> */}
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
    </React.Fragment>
  );
};
