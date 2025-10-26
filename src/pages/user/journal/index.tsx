import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Typography, WebFadeIn } from "../../../components/common";
import constants from "src/themes/constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { CATEGORIES, Categories, CategoryLabels, LEGACY_CATEGORY_MAPPING, SAVE_CATEGORY_MAPPING } from "./constants";
import { useDispatch, useSelector } from "react-redux";
import { setHeaderTitle } from "../../../redux/features/misc/slice";
import { ButtonTypes } from "../../../components/common/button";
import { TypographyTypes } from "../../../components/common/typography";
import moment from "moment";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { StackNavigationProp } from "@react-navigation/stack";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { getJournals, clearJournalError, journalErrorSelector } from "../../../redux/domain/features/journal/collection-slice";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

type RootStackParamList = {
  JournalEdit: { journalId: string; category: Categories };
  JournalView: { journalId: number; category: Categories };
  Journal: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Journal'>;

const ENTRIES_PER_PAGE = 20;

const getCategoryButtonStyle = (isSelected: boolean) => ({
  backgroundColor: isSelected ? constants.primaryColor : constants.white,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 12,
  marginRight: 6,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  borderWidth: 1,
  borderColor: constants.primaryColor,
});

const MyMindsetJournalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const layoutStyles = useLayoutStyles();
  const { userId } = useUserInfo();
  const [selectedCategory, setSelectedCategory] = useState<Categories | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);
  const error = useSelector(journalErrorSelector);

  const fetchJournals = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await dispatch(getJournals({ user: userId }));
      if (result.payload) {
        setJournals(result.payload);
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
    }
  }, [dispatch, userId]);

  const handleCreateNewEntry = () => {
    const defaultCategory = Categories.Thoughts;
    const targetCategory = selectedCategory === 'all' ? defaultCategory : selectedCategory;
    
    console.log('Create button pressed with:', {
      selectedCategory,
      targetCategory,
      mappedCategory: SAVE_CATEGORY_MAPPING[targetCategory],
      navigationParams: {
        journalId: "new",
        category: targetCategory
      }
    });
    
    fireMediumHapticFeedback();
    navigation.navigate('JournalEdit', {
      journalId: "new",
      category: targetCategory
    });
  };

  const refreshAll = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchJournals();
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [isRefreshing, fetchJournals]);

  const filteredEntries = journals ? journals.filter(entry => {
    if (selectedCategory === 'all') return true;
    
    const backendCategory = SAVE_CATEGORY_MAPPING[selectedCategory as Categories];
    const entryCategory = entry.Category;
    
    // Handle both direct matches and legacy mappings
    return entryCategory === backendCategory || 
           (LEGACY_CATEGORY_MAPPING[entryCategory] === selectedCategory);
  }).sort((a, b) => moment(b.CreatedAt).valueOf() - moment(a.CreatedAt).valueOf()) : [];

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadInitialData = async () => {
      if (mounted && !isRefreshing) {
        timeoutId = setTimeout(refreshAll, 100);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshAll, isRefreshing]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      
      if (mounted) {
        dispatch(setHeaderTitle("My Mindset Journal"));
        dispatch(clearJournalError());
        refreshAll();
      }

      return () => {
        mounted = false;
        dispatch(setHeaderTitle(""));
      };
    }, [dispatch, refreshAll])
  );

  if (isLoading) {
    return (
      <View style={[layoutStyles.headerPageCompensation, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Typography text="Loading..." type={TypographyTypes.Body1} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FAFF18", "#FFDF70", "#FFA800"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.3, y: 0.1 }}
      style={[
        { height: "100%", flexGrow: 1 },
        layoutStyles.headerPageCompensation,
      ]}
    >
      <WebFadeIn background={false}>
        <View style={{ padding: 16 }}>
          <Button
            title="Create New Entry"
            type={ButtonTypes.Primary}
            onPress={handleCreateNewEntry}
            style={{
              marginBottom: 20,
            }}
            icon="✏️"
            loading={isRefreshing}
          />

          <View style={{ marginBottom: 20 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              <Pressable
                onPress={() => setSelectedCategory('all')}
                style={({ pressed }) => [
                  getCategoryButtonStyle(selectedCategory === 'all'),
                  { opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Typography
                  text="🔍"
                  style={{
                    fontSize: 16,
                    marginRight: 6,
                  }}
                />
                <Typography
                  text="All"
                  style={{
                    color: selectedCategory === 'all' ? constants.white : constants.primaryColor,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                />
              </Pressable>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.category)}
                  style={({ pressed }) => [
                    getCategoryButtonStyle(selectedCategory === category.category),
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                >
                  <Typography
                    text={category.emoji}
                    style={{
                      fontSize: 16,
                      marginRight: 6,
                    }}
                  />
                  <Typography
                    text={category.name}
                    style={{
                      color: selectedCategory === category.category ? constants.white : constants.primaryColor,
                      fontSize: 13,
                      fontWeight: '500',
                    }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {filteredEntries.map(entry => (
            <Pressable
              key={entry.Id}
              onPress={() => navigation.navigate("JournalView", {
                journalId: entry.Id,
                category: entry.Category,
              })}
              style={({ pressed }) => ({
                backgroundColor: constants.white,
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography
                  text={entry.Title}
                  type={TypographyTypes.Subtitle1}
                  style={{ color: constants.primaryColor, flex: 1 }}
                />
                <Typography
                  text={CategoryLabels[entry.Category as keyof typeof CategoryLabels]}
                  type={TypographyTypes.Caption1}
                  style={{ color: constants.black900, marginLeft: 8 }}
                />
              </View>
              <Typography
                text={moment(entry.CreatedAt).format("MMMM Do, YYYY")}
                type={TypographyTypes.Body2}
                style={{ color: "#848484" }}
              />
            </Pressable>
          ))}
        </ScrollView>
      </WebFadeIn>
    </LinearGradient>
  );
};

export default MyMindsetJournalScreen;
