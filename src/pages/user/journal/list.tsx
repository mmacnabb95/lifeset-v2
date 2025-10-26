import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setHeaderTitle } from "../../../redux/features/misc/slice";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Icon,
  Typography,
  WebFadeIn,
} from "../../../components/common";
import { Categories, CategoryLabels } from "./constants";
import { useMyGratitudeJournalCollection } from "../../../redux/domain/features/myGratitudeJournal/useMyGratitudeJournalCollection";
import { useGoalsJournalCollection } from "../../../redux/domain/features/goalsJournal/useGoalsJournalCollection";
import { useTodoListJournalCollection } from "../../../redux/domain/features/todoListJournal/useTodoListJournalCollection";
import { useRelaxListJournalCollection } from "../../../redux/domain/features/relaxListJournal/useRelaxListJournalCollection";
import { useCheckInJournalCollection } from "../../../redux/domain/features/checkInJournal/useCheckInJournalCollection";
import { useMyEntriesJournalCollection } from "../../../redux/domain/features/myEntriesJournal/useMyEntriesJournalCollection";
import { TypographyTypes } from "../../../components/common/typography";
import constants from "../../../themes/constants";
import { ButtonTypes } from "../../../components/common/button";
import moment from "moment";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { getJournals } from "../../../redux/domain/features/journal/collection-slice";
import { unwrapResult } from '@reduxjs/toolkit';

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const ITEMS_PER_PAGE = 15;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexGrow: 1,
    position: 'relative'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  headerText: {
    color: constants.black900,
    fontStyle: 'italic',
    textDecorationLine: 'underline'
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  journalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: constants.white,
    marginBottom: 16
  },
  journalContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleContainer: {
    maxWidth: '95%'
  },
  title: {
    color: constants.primaryColor,
    marginBottom: 8,
    width: '100%'
  },
  date: {
    color: "#848484"
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40
  },
  emptyText: {
    color: constants.black900,
    textAlign: 'center'
  }
});

interface JournalEntry {
  Id: number;
  Title: string;
  Content: string;
  Category: string;
  CreatedAt: string;
  User: number;
}

interface JournalItemProps {
  item: JournalEntry;
  onPress: () => void;
}

const JournalItem = React.memo(({ item, onPress }: JournalItemProps) => (
  <Pressable
    style={styles.journalItem}
    onPress={onPress}
  >
    <View style={styles.journalContent}>
      <View style={styles.titleContainer}>
        <Typography
          text={item.Title}
          type={TypographyTypes.Subtitle1}
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        />
        <Typography
          text={moment(item.CreatedAt).format("MMMM Do, YYYY")}
          type={TypographyTypes.Body2}
          style={styles.date}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
      </View>
    </View>
  </Pressable>
));

const EmptyList = React.memo(() => (
  <View style={styles.emptyContainer}>
    <Typography
      text="No journal entries yet. Create your first one!"
      type={TypographyTypes.Body1}
      style={styles.emptyText}
    />
  </View>
));

interface PageProps {
  navigation: any;
  route: any;
  summaryCategory?: Categories;
}

const MyMindsetJournalListScreen = ({
  route,
  navigation,
  summaryCategory,
}: PageProps) => {
  const dispatch = useDispatch();
  const layoutStyles = useLayoutStyles();
  const { userId } = useUserInfo();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const category = (route.params?.category || summaryCategory) as Categories;

  // Use category-specific hooks with memoization
  const { 
    results: gratitudeEntries, 
    Refresh: refreshGratitude
  } = useMyGratitudeJournalCollection(userId);
  
  const { 
    results: goalsEntries, 
    Refresh: refreshGoals
  } = useGoalsJournalCollection(userId);
  
  const { 
    results: relaxEntries, 
    Refresh: refreshRelax
  } = useRelaxListJournalCollection(userId);
  
  const { 
    results: checkInEntries, 
    Refresh: refreshCheckIn
  } = useCheckInJournalCollection(userId);
  
  const { 
    results: myEntries, 
    Refresh: refreshMyEntries
  } = useMyEntriesJournalCollection(userId);

  // Memoize entries based on category
  const entries = useMemo(() => {
    switch (category) {
      case Categories.MyGratitude:
        return gratitudeEntries || [];
      case Categories.MyGoals:
        return goalsEntries || [];
      case Categories.Thoughts:
        return (myEntries || []).sort(
          (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
      case Categories.CheckIn:
        return checkInEntries || [];
      default:
        return [];
    }
  }, [category, gratitudeEntries, goalsEntries, myEntries, checkInEntries]);

  // Memoize refresh function
  const refreshEntries = useCallback(async () => {
    if (isRefreshing || !category || !userId) return;
    
    setIsRefreshing(true);
    try {
      switch (category) {
        case Categories.MyGratitude:
          if (refreshGratitude) await refreshGratitude();
          break;
        case Categories.MyGoals:
          if (refreshGoals) await refreshGoals();
          break;
        case Categories.Thoughts:
          if (refreshMyEntries) await refreshMyEntries();
          break;
        case Categories.CheckIn:
          if (refreshCheckIn) await refreshCheckIn();
          break;
      }
    } catch (error) {
      console.error('Error refreshing entries:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [category, userId, isRefreshing, refreshGratitude, refreshGoals, refreshMyEntries, refreshCheckIn]);

  // Memoize item renderer
  const renderItem = useCallback(({ item }: { item: JournalEntry }) => (
    <JournalItem
      item={item}
      onPress={() => {
        navigation.navigate("JournalView", {
          journalId: item.Id,
          category: item.Category,
        });
      }}
    />
  ), [navigation]);

  // Initial data load
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted || !isInitialLoad || !category || !userId) return;
      
      setIsRefreshing(true);
      try {
        await refreshEntries();
      } finally {
        if (mounted) {
          setIsInitialLoad(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [category, userId, isInitialLoad, refreshEntries]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setHeaderTitle(CategoryLabels[category] || "Journal"));
      return () => dispatch(setHeaderTitle(""));
    }, [dispatch, category])
  );

  if (isInitialLoad && isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={constants.primaryColor} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FAFF18", "#FFDF70", "#FFA800"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.3, y: 0.1 }}
      style={[styles.container, layoutStyles.headerPageCompensation]}
    >
      <WebFadeIn background={false}>
        <View style={styles.headerContainer}>
          <Typography
            text={CategoryLabels[category]}
            type={TypographyTypes.Subtitle2}
            style={styles.headerText}
          />
        </View>
        
        <View style={styles.listContainer}>
          <FlatList
            data={entries}
            renderItem={renderItem}
            keyExtractor={item => item.Id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyList}
            refreshing={isRefreshing}
            onRefresh={refreshEntries}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            initialNumToRender={10}
          />
        </View>
      </WebFadeIn>
    </LinearGradient>
  );
};

export default React.memo(MyMindsetJournalListScreen);
