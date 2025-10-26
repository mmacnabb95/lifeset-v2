import { StyleSheet, useWindowDimensions } from "react-native";
import commonConstants from "../../constants";

const useStyles = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLargeScreen = windowWidth > commonConstants.avgDeviceSize;

  const editList = {
    flex: 1,
    paddingTop: 120,
    // paddingLeft: 20,
    // paddingRight: 20,
  };

  const subList = {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    borderColor: "green",
    // borderWidth: 5,
    // minHeight: 100,
    // flexShrink: 1,
    // maxHeight: 500,
    // height: 10
  };

  const headerInSubList = {
    minHeight: 42,
  };

  const form = {
    flex: 1,
    // flexShrink: 1,
    // maxHeight: "100%",
    borderColor: "red",
    // borderWidth: 5,
    // height: 500,
  };

  // const subEditPage = {
  //   height: 100,
  //   borderWidth: 1,
  // };

  return StyleSheet.create({
    settingsForm: {
      // paddingTop: 120,
      // flex: 1,
    },
    habitEditPage: {
      paddingTop: 120,
      flex: 1,
      paddingBottom: 0,
      // height: "100%",
    },
    habitForm: {
      width: "100%",
      maxWidth: 400,
      minWidth: isLargeScreen ? 300 : 200,
      alignItems: "flex-start",
      minHeight: isLargeScreen ? windowHeight : windowHeight - 120,
      backgroundColor: commonConstants.white,
    },
    userHabitPackHabitForm: {
      width: "100%",
      maxWidth: 400,
      minWidth: isLargeScreen ? 300 : 200,
      alignItems: "flex-start",
      minHeight: isLargeScreen ? windowHeight : windowHeight - 120,
      backgroundColor: commonConstants.white,
    },
    journalEditPage: {
      flex: 1,
    },
    journalForm: {
      flex: 1,
    },
    exerciseEditList: editList,
    workoutEditPage: {
      // flex: 1,
      // maxHeight: 500,
      // borderWidth: 10,
    },
    workoutForm: form,
    workoutDayForm: form,
    workoutDayExerciseForm: form,
    workoutExerciseSetForm: form,
    workoutDayEditList: subList,
    workoutDayExerciseEditList: subList,
    workoutExerciseSetEditList: subList,
    habitPackHabitEditList: subList,
    habitPackHabitEditListHeaderStyle: headerInSubList,
    userHabitPackHabitEditList: subList,
    userHabitPackHabitEditListHeaderStyle: headerInSubList,
    workoutDayEditListHeaderStyle: headerInSubList,
    workoutDayExerciseEditListHeaderStyle: headerInSubList,
    workoutExerciseSetEditListHeaderStyle: headerInSubList,
    // companyUserEditList: subList,
    exerciseEditPage: {
      paddingTop: 80,
    },
    exerciseForm: {
      flex: 1,
    },
  });
};

export default useStyles;
