import React, { useEffect } from "react";
import { View } from "react-native";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { setHeaderTitle } from "../../../../redux/features/misc/slice";
import { useDispatch } from "react-redux";
import { Categories } from "../constants";

type ParamList = {
  JournalEdit: {
    category: string;
  };
};

export const JournalEditTop = ({ formRef }: any) => {
  const route = useRoute<RouteProp<ParamList, "JournalEdit">>();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const category = route.params?.category as Categories;

  useFocusEffect(
    React.useCallback(() => {
      formRef.current?.setFieldValue("Category", category);
      setTimeout(() => {
        dispatch(setHeaderTitle("Note"));
      });
    }, [dispatch]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      dispatch(setHeaderTitle(""));
    });

    return unsubscribe;
  }, [dispatch, navigation]);

  return <View key={"edit-top"} />;
};
