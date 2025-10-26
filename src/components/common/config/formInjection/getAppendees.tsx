/* eslint-disable @typescript-eslint/no-shadow */
import React from "react";
import { ReactNode } from "react";
import { View } from "react-native";
import { Divider } from "../../schedule/divider";
import { Schedule } from "../../schedule/schedule";
import constants from "src/themes/constants";
import store from "../../../../../src/redux/stores/store";
import {
  createHabitCompletedRecord,
  deleteHabitCompletedRecord,
} from "src/redux/domain/features/habitCompletedRecord/collection-slice";
import {
  Habitcompletedrecord,
  Workout,
  Workoutday,
  Workoutdayexercise,
} from "../../../../../../types/domain/flat-types";
import { thunks } from "src/redux/domain/features/habit/collection-slice";
import { JournalEditTop } from "../../../../pages/user/journal/components/journalEditTop";
import * as Yup from "yup";
import { CompanyUserNavOption } from "../../companyUserNavOption/companyUserNavOption";
import { CompanyUserSendAccessLink } from "../../companyUserSendAccessLink/companyUserSendAccessLink";
import { isCompanyManager } from "src/navigation/utils/roleCheck";
import { CompanyUserOffboard } from "../../companyUserOffboard/companyUserOffboard";
import { Button, ButtonTypes } from "../../button";
import { bulkUploadCompanyUsers } from "./bulkUpload";
import moment from "moment";
import { HabitPackNavOption } from "../../habitPackNavOption/habitPackNavOption";
import { BenefitsNavOption } from "../../benefitsNavOption/benefitsNavOption";
import { SummaryHeader } from "src/pages/admin/userWorkouts/summaryHeader";
import { getAllTimeStreaks } from "src/redux/domain/features/allTimeStreak/collection-slice";
import { PublishUserHabitPack } from "../../publishUserHabitPack/publishUserHabitPack";
import { Typography, TypographyTypes } from "../../typography";
import { UserHabitPackStatus } from "src/redux/customTypes/types";
import { RejectUserHabitPack } from "../../rejectUserHabitPack/rejectUserHabitPack";
import { HabitPackNotice } from "../../habitPackNotice/habitPackNotice";
import { clearUserHabitPackUseItems } from "src/redux/domain/features/userHabitPackUse/collection-slice";
import { ButtonLaunchedModal } from "../../buttonLaunchedModal/buttonLaunchedModal";
import {
  getWorkouts,
  updateWorkout,
} from "src/redux/domain/features/workout/collection-slice";
import { fetchClient } from "src/utils/legacy-stubs";
import { initialLoadSize } from "src/utils";
import { clearMyGratitudeJournalItems } from "src/redux/domain/features/myGratitudeJournal/collection-slice";
import { clearCheckInJournalItems } from "src/redux/domain/features/checkInJournal/collection-slice";
import { clearTodoListJournalItems } from "src/redux/domain/features/todoListJournal/collection-slice";
import { clearRelaxListJournalItems } from "src/redux/domain/features/relaxListJournal/collection-slice";
import { clearMyEntriesJournalItems } from "src/redux/domain/features/myEntriesJournal/collection-slice";
import { clearGoalsJournalItems } from "src/redux/domain/features/goalsJournal/collection-slice";
import { useXPRewards } from '../../../../useXPRewards';
import { addXP } from 'src/redux/domain/features/xp/collection-slice';
import { habitsSelector } from 'src/redux/domain/features/habit/collection-slice';

interface FieldAppendees {
  el: ReactNode;
  fieldName: string;
}

export const getAppendees = (
  sourceName: string,
  fieldAppendees: FieldAppendees[],
  source: any,
  formRef: any,
  navigation: any,
  route: any,
) => {
  if (sourceName === "Journal") {
    fieldAppendees.push({
      fieldName: "FormTop",
      el: <JournalEditTop formRef={formRef} />,
    });
    if (route?.params?.category === "MyGratitude") {
      fieldAppendees.push({
        fieldName: "FormTop",
        el: <Typography text="What are you grateful for?" />,
      });
    }
    if (route?.params?.category === "CheckIn") {
      fieldAppendees.push({
        fieldName: "FormTop",
        el: <Typography text="List your wins no matter how big or small" />,
      });
    }

    if (route?.params?.category === "RelaxList") {
      // const randomIntFromInterval = (min = 1, max = 10) => {
      //   return Math.floor(Math.random() * (max - min + 1) + min)
      // }
      // const possibleQuestions = [
      //   "How are you feeling about life right now?",
      //   "What is not serving you in your life right now?",
      //   "What is making you happy in your life right now?",
      //   "How can you solve the main problems in your life in a logical way?",
      //   "What progress have you made with your goals?",
      //   "What could you improve in order to achieve your goal?"
      // ];
      // const randomNumber = randomIntFromInterval(1,6) - 1;
      // const question = possibleQuestions[randomNumber];
      // // formRef.values.Title = question;
      // fieldAppendees.push({
      //   fieldName: "FormTop",
      //   el: <Typography text={question} />,
      // });
    }
  }

  if (sourceName === "Habit" || sourceName === "UserHabitPackHabit") {
    fieldAppendees.push({
      fieldName: "FormTop",
      el: (
        <View
          key={"habit_layout_1"}
          style={{
            height: 20,
            width: "100%",
            backgroundColor: constants.appBackground,
            marginBottom: -15,
          }}
        >
          <View
            style={{
              backgroundColor: constants.white,
              borderTopLeftRadius: constants.radius,
              borderTopRightRadius: constants.radius,
              height: 20,
              width: "100%",
            }}
          />
        </View>
      ),
    });
    fieldAppendees.push({
      fieldName: "Title",
      el: (
        <View
          key={"habit_layout_2"}
          style={{
            width: "100%",
            paddingLeft: 20,
          }}
        >
          <Divider style={{ marginTop: 0, marginBottom: 0 }} />
        </View>
      ),
    });
    fieldAppendees.push({
      fieldName: "Description",
      el: (
        <View
          key={"habit_layout_3"}
          style={{
            width: "100%",
            paddingLeft: 20,
          }}
        >
          <Divider style={{ marginTop: 0, marginBottom: 0 }} />
        </View>
      ),
    });
    fieldAppendees.push({
      fieldName: "Category",
      el: (
        <View
          key={"habit_layout_4"}
          style={{
            height: 48,
            width: "100%",
            backgroundColor: constants.appBackground,
            marginTop: -20,
          }}
        >
          <View
            style={{
              backgroundColor: constants.white,
              borderBottomLeftRadius: constants.radius,
              borderBottomRightRadius: constants.radius,
              height: 20,
              width: "100%",
              marginBottom: 8,
            }}
          />
          <View
            style={{
              backgroundColor: constants.white,
              borderTopLeftRadius: constants.radius,
              borderTopRightRadius: constants.radius,
              height: 20,
              width: "100%",
              marginBottom: 8,
            }}
          />
        </View>
      ),
    });
    fieldAppendees.push({
      fieldName: "Category",
      el: (
        <Schedule
          key="schedule"
          formRef={formRef}
          habit={source}
          includeNotifcations={sourceName === "Habit"}
        />
      ),
    });
  }
  if (sourceName === "Company") {
    fieldAppendees.push({
      fieldName: "Name",
      el: <CompanyUserNavOption key={"cu_nav"} />,
    });
    fieldAppendees.push({
      fieldName: "Name",
      el: <HabitPackNavOption key={"hp_nav"} />,
    });
    fieldAppendees.push({
      fieldName: "Name",
      el: <BenefitsNavOption key={"bn_nav"} />,
    });
  }
  if (sourceName === "CompanyUser") {
    const userState = store.getState().userInfo;
    const isManager =
      isCompanyManager(userState.userInfo.roles) &&
      userState.userInfo.userId === source?.user?.Id;

    fieldAppendees.push({
      fieldName: "Manager",
      el: (
        <Button
          onPress={() => formRef.current.handleSubmit()}
          testID={"submit-CompanyUser-form"}
          title={source?.Id ? "Update" : "Save"}
          titleStyle={{ color: constants.white }}
          type={ButtonTypes.Primary}
          style={{ marginTop: 20, opacity: isManager ? 0.5 : 1 }}
          disabled={isManager}
        />
      ),
    });

    fieldAppendees.push({
      fieldName: "Manager",
      el: <CompanyUserSendAccessLink key={"cu_lnk"} source={source} />,
    });
    fieldAppendees.push({
      fieldName: "Manager",
      el: <CompanyUserOffboard key={"cu_off_brd_lnk"} source={source} />,
    });
  }
  if (sourceName === "UserWorkoutExerciseSet") {
    fieldAppendees.push({
      fieldName: "FormTop",
      el: <SummaryHeader />,
    });
  }
  if (sourceName === "UserHabitPack") {
    fieldAppendees.push({
      fieldName: "FormTop",
      el: (
        <View style={{ width: "100%" }}>
          <Typography
            type={TypographyTypes.H4}
            text={source?.StatusName}
            style={{ opacity: 0.4, width: "100%", textAlign: "center" }}
          />
        </View>
      ),
    });
    fieldAppendees.push({
      fieldName: "FormBottom",
      el: <PublishUserHabitPack userHabitPack={source} />,
    });
    fieldAppendees.push({
      fieldName: "FormBottom",
      el: <RejectUserHabitPack userHabitPack={source} />,
    });
  }
  if (sourceName === "Habit") {
    fieldAppendees.push({
      fieldName: "FormBottom",
      el: <HabitPackNotice key="habit-pack-notice" habit={source} />,
    });
  }
};

const scheduleYupSchema = {
  Schedule: Yup.object({
    Repetition: Yup.string().required(),
    DaySelection: Yup.array().when("Repetition", {
      is: "weekly",
      then: Yup.array()
        .required()
        .test("valid", "Day selecton required", (val) => {
          if (val && !val.find((v) => v)) {
            return false;
          }
          return true;
        }),
    }),
    DaysOfTheMonth: Yup.array().when("Repetition", {
      is: "monthly",
      then: Yup.array()
        .required()
        .test("valid", "Day of the month selecton required", (val) => {
          if (val && !val.filter((v) => v !== 0).find((v) => v)) {
            return false;
          }
          return true;
        }),
    }),
  }),
};

//todo: this should be a hook! ..and use memo - this is getting redefined on every render
export const getConfig = (
  sourceName: string,
  source: any,
  formRef: any,
  navigation: any,
  route: any,
  state?: any
) => {
  if (sourceName === "Habit") {
    const today = moment().format("YYYY-MM-DD");
    const userId = state?.userInfo?.userInfo?.userId;

    if (!userId) {
      return;
    }

    let habit = source || {
      User: userId,
      FromTemplate: false,
    };
    if (route?.params?.predefined === "true" && !source) {
      habit.FromTemplate = true;
    }

    return {
      textValues: {
        selectText: "Select Category...",
      },
      onAlertClosed: (navigation: any) => {
        navigation.navigate("Habits");
      },
      onUpdated: () => {
        store.dispatch(
          thunks!.getHabitsByDate({
            user: source.User,
            date: today,
            offset: 0,
            limit: 10000,
          }),
        );
        store.dispatch(getAllTimeStreaks({ user: habit.User }));
      },
      onCreated: (navigation, habit: any) => {
        store.dispatch(
          thunks!.getHabitsByDate({
            user: habit.User,
            date: today,
            offset: 0,
            limit: 10000,
          }),
        );
        store.dispatch(getAllTimeStreaks({ user: habit.User }));
      },
      onDeleted: (navigation: any) => {
        store.dispatch(clearUserHabitPackUseItems());
        store.dispatch(getAllTimeStreaks({ user: habit.User }));
      },
      injectedValidationSchema: scheduleYupSchema,
      style: {
        inputStyle: {
          paddingLeft: 20,
        },
        select: {
          paddingLeft: 10,
        },
      },
      readOnly: source?.UserHabitPack
        ? ["Category", "Title", "Description"]
        : route?.params?.predefined === "true" || source?.FromTemplate
        ? ["Category"]
        : [],
      formItem: habit,
    };
  }

  if (sourceName === "Journal") {
    const category = route?.params?.category;
    let readOnly: any = [];
    let defaultText;
    let fieldConfig;

    if (category === "RelaxList") {
      const randomIntFromInterval = (min = 1, max = 10) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
      };
      const possibleQuestions = [
        "How are you feeling about life right now?",
        "What is not serving you in your life right now?",
        "What is making you happy in your life right now?",
        "How can you solve the main problems in your life in a logical way?",
        "What progress have you made with your goals?",
        "What could you improve in order to achieve your goal?",
        "What would you do if money was no object?",
        "Are your habits in line with where you want to be?",
        "How can you have more fun in your everyday life?",
        "What are you avoiding and why?",
        "How can you live more in the moment?",
        "What's something that made you smile today?",
        "How could you build the best version of you?",
        "Design your realistic dream life in 1 year from now.",
        "If you had one day to live, how would you live it?",
        "What makes you happy?",
        "What is good advice to live by?",
        "What advice or reminders would you give to your future self?",
        "How are you?",
        "What could excite you this year?",
        "What goal would greatly improve your life?",
        "Who has influenced you the most and why?",
        "Write three good things about yourself.",
        "What's an area of my life that feels unbalanced?",
        "What habit would I like to break?",
        "How do I feel about my current life path?",
        "What is you main stressor right now?",
        "Who do you admire and why?",
        "Are you seeking approval from someone? What would their approval change?",
        "What are you looking forward to?",
        "What don't you regret?",
        "Based on your daily routine, where do you see yourself in 5 years?",
        "How do you want to feel at the end of today? What do you need to do now, so you can feel this way?",
        "What made me feel good this week?",
        "What can I improve on for tomorrow?",
        "What is the most important things in your life?",
        "What is the one thing you need to focus on to move forward and live your best life?",
        "Are your habits aligned to what you want to achieve?",
        "Describe the best version of you. How can you be more like that person today?",
        "Imagine, your life is a blank slate. What would you do? Can you take 1 or 2 things from that vision and do it now?",
        "What have you learned from the most influential person in your life?",
        "What is something you can do today to make it more fun?",
        "What is one thing in your life that you feel lucky to have?",
        "What makes you happy?",
        "Describe your dream life. How can you move closer to that within 6 months?",
        "What are some areas of your life where you tend to have a fixed mindset?",
        "What are some goals that you've been afraid to pursue due to fear of failure or rejection?",
        "What are some of your limiting beliefs and self-talk that may be holding you back?",
        "They say problems are opportunities. What does this mean to you?",
        "What is the 'Why' behind your goals?",
        "What are your core personal values?",
        "What is something you've always wanted to try but haven't yet?",
        "What emotion are you feeling now? Why?",
        "What makes you glad to be alive today?",
        "What are your fears and limiting beliefs?",
        "What impact do you hope to have today on your world?",
      ];

      const possibleLength = possibleQuestions.length;
      const randomNumber = randomIntFromInterval(1, possibleLength) - 1;
      const question = possibleQuestions[randomNumber];
      defaultText = question;
      readOnly = ["Title"];
      fieldConfig = {
        Title: {
          multiline: true,
          numberOfLines: 2,
        },
      };
    }

    const userState = store.getState().userInfo;
    const userId = userState.userInfo.userId;
    return {
      onAlertClosed: () => {
        navigation.navigate("JournalList", { category });
      },
      onDeleted: () => {
        const clearItems = {
          MyGratitude: clearMyGratitudeJournalItems,
          MyGoals: clearGoalsJournalItems,
          TodoList: clearTodoListJournalItems,
          RelaxList: clearRelaxListJournalItems,
          CheckIn: clearCheckInJournalItems,
          MyEntries: clearMyEntriesJournalItems,
        };

        const cat: string = route?.params?.category;
        store.dispatch(clearItems[cat]());
      },
      default: { Title: defaultText, User: userId },
      readOnly: readOnly,
      style: {
        form: {
          flex: 1,
          height: "100%",
        },
      },
      fieldConfig,
    };
  }

  if (sourceName === "ResourceCheckboxNav") {
    const today = moment().format("YYYY-MM-DD");
    return {
      onChecked: async (params: any) => {
        const res: any = await store.dispatch(
          createHabitCompletedRecord({
            Habit: source.Id,
            HabitCompletedDate: new Date(),
          }),
        );
        if (res.meta.requestStatus !== "fulfilled") {
          return false;
        }

        // Get habits and check completion
        await store.dispatch(
          thunks!.getHabitsByDate({
            user: source.User,
            date: today,
            offset: 0,
            limit: 10000,
          }),
        );

        await store.dispatch(getAllTimeStreaks({ user: source.User }));
        return true;
      },
      onUnchecked: async (params: any) => {
        const todaysCompletion = source?.CompletionOverMonth.find(
          (c: { habitCompleteRecord?: Habitcompletedrecord }) => {
            if (c.habitCompleteRecord) {
              return (
                new Date(c.habitCompleteRecord.HabitCompletedDate).getDate() ===
                new Date().getDate()
              );
            }
            return false;
          },
        );
        if (todaysCompletion?.habitCompleteRecord?.Id) {
          const res: any = await store.dispatch(
            deleteHabitCompletedRecord(todaysCompletion.habitCompleteRecord.Id),
          );
          if (res.meta.requestStatus !== "fulfilled") {
            return false;
          }
          await store.dispatch(
            thunks!.getHabitsByDate({
              user: source.User,
              date: today,
              offset: 0,
              limit: 10000,
            }),
          );
          await store.dispatch(getAllTimeStreaks({ user: source.User }));
        }
        return true;
      },
    };
  }

  if (sourceName === "Exercise") {
    return {
      style: {
        multilineStyle: {
          height: 300,
        },
      },
    };
  }

  if (sourceName === "CompanyUser") {
    const userState = store.getState().userInfo;
    const isManager =
      isCompanyManager(userState.userInfo.roles) &&
      userState.userInfo.userId === source?.user?.Id;
    const readOnlyFields = isManager ? ["Email", "Manager"] : [];

    return {
      updateButtonText: "Update",
      deleteButtonText: "Remove user from company",
      readOnly: readOnlyFields,
      hideButtons: true, //isManager,
    };
  }

  if (sourceName === "Company") {
    return {
      updateButtonText: "Update",
      saveButtonText: "Create company",
    };
  }
  if (sourceName === "HabitPack" || sourceName === "HabitPackHabit") {
    return {
      updateButtonText: "Update",
      saveButtonText: "Save",
      deleteButtonText: "Delete",
    };
  }
  if (sourceName === "UserWorkoutExerciseSet") {
    return {
      updateButtonText: "Update",
      hideDeleteButton: true,
    };
  }
  if (sourceName === "UserHabitPack") {
    return {
      updateButtonText: "Update",
      saveButtonText: "Save",
      deleteButtonText: "Delete",
      hideButtons:
        source && source?.UserHabitPackStatus !== UserHabitPackStatus.Draft,
    };
  }
  if (sourceName === "UserHabitPackHabit") {
    return {
      injectedValidationSchema: scheduleYupSchema,
      updateButtonText: "Update",
      saveButtonText: "Save",
      deleteButtonText: "Delete",
      // hideButtons: source?.UserHabitPackStatus !== UserHabitPackStatus.Draft,
      style: {
        select: {
          paddingLeft: 6,
          paddingRight: 16,
        },
      },
    };
  }

  if (sourceName === "Workout") {
    return {
      hideButtons: source?.Published === true,
      viewOnly: source?.Published === true,
    };
  }
  if (sourceName === "WorkoutDay") {
    const workout = store
      .getState()
      .workouts.items?.find((w: Workout) => w.Id === source?.Workout);
    return {
      viewOnly: workout?.Published === true,
      hideButtons: workout?.Published === true,
    };
  }
  if (sourceName === "WorkoutDayExercise") {
    const workoutDay = state?.workoutDays?.items?.find(
      (w: Workoutday) => w.Id === source?.WorkoutDay,
    );

    const workout = state?.workouts?.items?.find(
      (w: Workout) => w.Id === workoutDay?.Workout,
    );

    return {
      viewOnly: workout?.Published === true,
      hideButtons: workout?.Published === true,
    };
  }
  if (sourceName === "WorkoutExerciseSet") {
    // console.log("WorkoutExerciseSet", JSON.stringify(source, null, 2));

    const workoutDayExercise = store
      .getState()
      .workoutDayExercises.items?.find(
        (w: Workoutdayexercise) => w.Id === source?.WorkoutDayExercise,
      );

    const workoutDay = store
      .getState()
      .workoutDays.items?.find(
        (w: Workoutday) => w.Id === workoutDayExercise?.WorkoutDay,
      );

    const workout = store
      .getState()
      .workouts.items?.find((w: Workout) => w.Id === workoutDay?.Workout);

    return {
      viewOnly: workout?.Published === true,
      hideButtons: workout?.Published === true,
    };
  }
};

export const useEditListConfig = (sourceName: string, route: any) => {
  if (sourceName === "CompanyUser") {
    return {
      bulkUpload: () => bulkUploadCompanyUsers({ route }),
    };
  }
};
export const useViewListConfig = (sourceName: string, route: any) => {
  // example config
  // if (sourceName === "Things") {
  //   return {
  //     bulkUpload: () => bulkUploadThings({ route }),
  //   };
  // }
};
