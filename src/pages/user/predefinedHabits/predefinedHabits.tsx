import React from "react";
import { Image, ScrollView, View } from "react-native";
import { Button, Typography, WebFadeIn } from "src/components/common";
import { ButtonTypes } from "src/components/common/button";
import { useDispatch, useSelector } from "react-redux";
import {
  Habitpack,
  Habitpackhabit,
  Schedule,
} from "../../../../../types/domain/flat-types";
import { useFocusEffect } from "@react-navigation/native";
import { TypographyTypes } from "src/components/common/typography";
import { setPredefinedHabit } from "src/redux/features/misc/slice";
import _ from "lodash";
import { useTranslation } from "src/translations/useTranslation";
import { HabitTemplate, habitTemplates } from "./habitTemplate";
import { HabitCategory } from "./habitCategory";
import { useHabitPackCollection } from "src/redux/domain/features/habitPack/useHabitPackCollection";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { usePublishedUserHabitPacksSearchCollection } from "src/redux/domain/features/publishedUserHabitPack/usePublishedUserHabitPackSearchCollection";
import { initialLoadSize, useOnScrollContainerCloseToBottom } from "src/utils";
import { publishedUserHabitPacksLoading } from "src/redux/domain/features/publishedUserHabitPack/collection-slice";
import { Loading } from "src/components/common/loading/loading";
import constants from "src/themes/constants";

const useStyles = require("./styles/styles").default;
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

export interface ScheduledHabit extends Habitpackhabit {
  Schedule?: Schedule;
  readonly?: boolean;
  UserHabitPack?: number;
}
interface HabitPackWithHabits extends Habitpack {
  habits: Habitpackhabit[] | ScheduledHabit[];
  author?: string;
}

const PredefinedHabits = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const styles = useStyles();
  const layoutStyles = useLayoutStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { companyId } = useUserInfo();

  const { results: habitPacks } = useHabitPackCollection(companyId, 1000);

  const loading = useSelector(publishedUserHabitPacksLoading);
  const {
    loadMore,
    reSearch,
    searchResult: userHabitPackTemplates,
  } = usePublishedUserHabitPacksSearchCollection(initialLoadSize);

  const { scrollCallback } = useOnScrollContainerCloseToBottom({
    onScrollContainerCloseToBottom: loadMore,
  });

  useFocusEffect(
    React.useCallback(() => {
      reSearch();
    }, []),
  );

  return (
    <WebFadeIn
      background={false}
      style={
        [
          styles.container,
          layoutStyles.headerPageCompensation,
        ] as unknown as Record<string, string | number>
      }
    >
      <ScrollView
        style={{ height: "100%" }}
        nestedScrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 10,
          paddingBottom: 30,
        }}
        testID="predefined-habits-page"
        onScroll={!loading ? scrollCallback : undefined}
      >
        <View
          style={{
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View>
            <View style={styles.homeText}>
              <Typography
                type={TypographyTypes.H3}
                text={t("habits.predefined.title")}
                style={styles.title}
              />
            </View>
          </View>
          <View style={{ marginTop: 24 }}>
            <Button
              onPress={() => {
                dispatch(setPredefinedHabit(undefined));
                navigation.navigate("HabitEdit", { habitId: "new" });
              }}
              type={ButtonTypes.Primary}
              testID="add-custom-habit"
              style={{ flexDirection: "row" }}
            >
              <Image
                style={{ height: 24, width: 24, marginRight: 10 }}
                source={require("../../../../assets/candlestick.png")}
              />
              <Typography
                text={t("habits.predefined.addCustom")}
                type={TypographyTypes.ButtonTextPrimary}
              />
            </Button>
          </View>
        </View>
        <>
          {habitPacks?.map((hp: HabitPackWithHabits) => {
            return (
              <HabitCategory key={hp.Name} title={hp.Name} habits={hp.habits} />
            );
          })}
          {habitTemplates.map((ht: HabitTemplate) => {
            return (
              <HabitCategory
                key={ht.Category}
                title={ht.Category}
                habits={ht.habits}
              />
            );
          })}
          <View
            style={{
              width: "100%",
              paddingHorizontal: 20,
              marginTop: 20,
            }}
          >
            <View
              style={{
                width: "100%",
                // height: 10,
                borderBottomColor: "rgba(0,0,0,0.2)",
                borderBottomWidth: 1,
              }}
        //    />
          //  <Typography
            //  type={TypographyTypes.Body1}
              //text={"Lifeset Habit Challenges"}
              //style={{
                //textAlign: "center",
                //marginTop: 20,
                //fontFamily: constants.font600,
                //fontSize: 20,
                //lineHeight: 25,
              //}}
            />
          </View>
          {_.orderBy(userHabitPackTemplates, ["Id"], ["desc"])?.map(
            (hp: HabitPackWithHabits) => {
              return (
                <HabitCategory
                  key={hp.Name}
                  title={hp.Name}
                  habits={hp.habits}
                  author={hp.author}
                  addAllOnly
                />
              );
            },
          )}
          <View style={{ minHeight: 100, maxHeight: 100 }}>
            {loading && <Loading />}
          </View>
        </>
      </ScrollView>
    </WebFadeIn>
  );
};

export default PredefinedHabits;
