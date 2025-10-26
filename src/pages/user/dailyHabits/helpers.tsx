import moment from "moment/moment";
import { Habit } from "../../../../../types/domain/flat-types";
import { FullHabit } from "../../../../../types/custom/types";

export const getWeekDays = () => {
  moment.updateLocale("en", {
    week: {
      // Set the First day of week to Monday
      dow: 1,
    },
  });

  const week = moment().locale("en").startOf("week");

  // 2023-12-12, monday
  const monday = week.format("YYYY-MM-DD, dddd");
  const tuesday = week.add(1, "days").format("YYYY-MM-DD, dddd");
  const wednesday = week.add(1, "days").format("YYYY-MM-DD, dddd");
  const thursday = week.add(1, "days").format("YYYY-MM-DD, dddd");
  const friday = week.add(1, "days").format("YYYY-MM-DD, dddd");
  const saturday = week.add(1, "days").format("YYYY-MM-DD, dddd");
  const sunday = week.add(1, "days").format("YYYY-MM-DD, dddd");

  return [monday, tuesday, wednesday, thursday, friday, saturday, sunday];
};

export const getCompletedDailyTasks = (tasks: any, date: string) => {
  const completedDailyTasks = tasks.filter((task: any) => {
    const completionDates = task?.CompletionOverMonth?.filter(
      (item: any) => !!item?.habitCompleteRecord,
    );

    const isCompleted = completionDates?.some((item: any) => {
      const completionDate = moment(item?.date).format("YYYY-MM-DD");
      const formatedDate = moment(date).format("YYYY-MM-DD");

      return completionDate === formatedDate;
    });

    return isCompleted;
  });

  return completedDailyTasks;
};

export const isTodayInWeek = (schedule: any, day: string) => {
  const days = schedule?.DaySelection;
  return days?.includes(day);
};

export const isTodayInMonth = (schedule: any, date: String) => {
  const dates = schedule?.DaysOfTheMonth;
  return dates?.includes(Number(date));
};

export const getCompletedPercentageForDate = (
  habits: any,
  selectedDate: string,
) => {
  if (!habits) {
    return;
  }

  const day = moment(selectedDate).format("dddd");
  const date = moment(selectedDate).format("DD");

  const todaysTasks = habits?.filter((habit: FullHabit) => {
    const schedule = habit?.Schedule;
    const Repetition = schedule?.Repetition;

    // if (moment(habit.CreatedDate) > moment(selectedDate)) {
    //   return false;
    // }

    if (Repetition === "daily") {
      return habit;
    }

    if (Repetition === "weekly" && isTodayInWeek(schedule, day)) {
      return habit;
    }

    if (Repetition === "monthly" && isTodayInMonth(schedule, date)) {
      return habit;
    }
  });

  const todaysCompletedTasks = todaysTasks?.filter((task) => {
    const completionDates = task?.CompletionOverMonth?.filter(
      (item: any) => !!item?.habitCompleteRecord,
    );

    const isCompleted = completionDates?.some((item: any) => {
      const completionDate = moment(
        item?.habitCompleteRecord?.HabitCompletedDate,
      ).format("YYYY-MM-DD");
      const today = moment(selectedDate).format("YYYY-MM-DD");

      return completionDate === today;
    });

    return isCompleted;
  });

  const completionRatio =
    (todaysCompletedTasks?.length ?? 0) / (todaysTasks?.length ?? 0);

  const completionPercentage = isNaN(completionRatio) ? 0 : completionRatio;

  return completionPercentage;
};
