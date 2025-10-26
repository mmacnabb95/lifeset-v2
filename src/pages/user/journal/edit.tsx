import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation, RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Body, Typography, WebFadeIn } from "../../../components/common";
import { CATEGORIES, Categories, SAVE_CATEGORY_MAPPING } from "./constants";
import { TypographyTypes } from "../../../components/common/typography";
import constants from "../../../themes/constants";
import { setHeaderTitle } from "../../../redux/features/misc/slice";
import JournalForm from "../../../components/domain/journal/journal.form";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { LinearGradient } from "expo-linear-gradient";
import * as Yup from "yup";
import { getJournal, journalSelector } from "../../../redux/domain/features/journal/collection-slice";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

type RootStackParamList = {
  JournalEdit: { journalId: string; category?: Categories };
  JournalView: { journalId: number; category: Categories };
  JournalList: { category: Categories };
  Journal: undefined;
};

type JournalEditScreenRouteProp = RouteProp<RootStackParamList, 'JournalEdit'>;

interface Props {
  route: JournalEditScreenRouteProp;
  navigation: any;
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flexGrow: 1
  },
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    padding: 16,
    paddingTop: 4
  },
  errorContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8
  },
  errorText: {
    color: '#c62828',
    fontSize: 14
  },
  categoryContainer: {
    marginBottom: 12
  },
  categoryTitle: {
    marginBottom: 8,
    color: constants.black900,
    fontSize: 16,
    fontWeight: '600'
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 4
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
    width: '30%',
    flexBasis: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: constants.primaryColor
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500'
  },
  formContainer: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 0,
    position: 'relative'
  }
});

const JournalEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const layoutStyles = useLayoutStyles();
  const { userId } = useUserInfo();
  const formRef = React.useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Categories>(
    route.params?.category || Categories.Thoughts
  );
  const [error, setError] = useState<string | null>(null);
  const journalEntry = useSelector(journalSelector(Number(route.params?.journalId)));

  const handleSave = useCallback(() => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  }, []);

  // Memoize form configuration
  const formConfig = useMemo(() => {
    const getRandomPrompt = (prompts: string[]) => {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      return prompts[randomIndex];
    };

    const getCategoryPlaceholders = () => {
      const gratitudePrompts = [
        "What are three things you're grateful for today?",
        "Who made a positive impact in your life recently?",
        "What's something in your daily routine you're thankful for?",
        "What's a challenge that taught you something valuable?",
        "What's a small blessing you noticed today?",
        "What's something about yourself you're grateful for?",
        "What's an opportunity you're thankful for?",
        "Who's someone that makes your life better and why?",
        "What's a simple pleasure you're grateful for?",
        "What's something in nature you appreciate?",
        "What made you smile today?",
        "What's a memory you're grateful to have?",
        "What's a skill or ability you're thankful for?",
        "What's something you take for granted that you're actually lucky to have?",
        "What's a mistake or failure you're now grateful for?",
        "What's something about your body or health you appreciate?",
        "What's a piece of technology you're thankful for?",
        "What's something someone did for you that you appreciate?",
        "What's a comfort or convenience you're grateful for?",
        "What's something you learned recently that you're thankful for?",
        "What's a relationship in your life you're grateful for?",
        "What's something about your home you appreciate?",
        "What's a freedom or privilege you're thankful for?",
        "What's an experience from yesterday you're grateful for?",
        "What's something about your current situation you can be thankful for?",
        "What is one thing you're grateful for today?",
        "Who in your life has supported you the most, and why?",
        "What is something difficult that ended up making you stronger?",
        "What's a challenge you faced that you now appreciate?",
        "How has your journey helped you grow?",
        "What's one thing about your body or mind that you're grateful for?",
        "What's a small but meaningful moment from today that brought you joy?",
        "Who is someone you admire, and what about them are you grateful for?",
        "What's a past failure or setback that you now see as a gift?",
        "What's one lesson you've learned recently that has improved your mindset?"
      ];

      const goalsPrompts = [
        "What's one goal you want to achieve this month?",
        "What steps can you take today toward your bigger goals?",
        "What's holding you back from achieving your goals?",
        "What would make this week successful for you?",
        "What's a habit you want to build or break?",
        "What's your next milestone and how will you reach it?",
        "What skills do you need to develop for your goals?",
        "What's one area of your life you want to improve?",
        "What's a goal that excites and scares you?",
        "How can you make progress on your goals today?",
        "What's a long-term goal you can break down into smaller steps?",
        "What's a goal you've been putting off and why?",
        "What resources do you need to achieve your current goal?",
        "What's a goal that would make the biggest impact on your life?",
        "How can you measure progress toward your goal?",
        "What's a goal you can accomplish in the next 24 hours?",
        "What's something you want to master? What's your first step?",
        "What's a goal that aligns with your core values?",
        "What's a goal you need to modify or adjust?",
        "Who could help you achieve your goals?",
        "What's a goal that would push you out of your comfort zone?",
        "What's a financial goal you want to work toward?",
        "What's a health or fitness goal you want to achieve?",
        "What's a relationship goal you want to work on?",
        "What's a professional goal you want to pursue?",
        "Do you set specific goals for yourself? If so, how do you track progress?",
        "What motivates you to improve?",
        "How do you maintain focus when you're tired or unmotivated?",
        "What is one short-term goal you're currently working toward?",
        "What would success look like for you in the next month?",
        "What habits do you need to develop to reach your biggest goal?",
        "What obstacles could prevent you from reaching your goal, and how will you overcome them?",
        "How do you stay motivated when progress feels slow?",
        "What's one small action you can take today to move toward your goal?",
        "How do you measure progress in your personal growth or performance?",
        "What drives you to pursue your goals—internal passion or external rewards?",
        "How do you handle setbacks when working toward a goal?",
        "What is a past goal you achieved that you're really proud of?"
      ];

      const thoughtsPrompts = [
        "What's been on your mind lately?",
        "What's something you want to understand better about yourself?",
        "What's a belief that's been challenging you?",
        "What's something you've learned about yourself recently?",
        "What's a change you've noticed in yourself?",
        "What's something you want to explore or understand deeper?",
        "What's a pattern you've noticed in your life?",
        "What's something you want to remember about this moment?",
        "What's a question you've been asking yourself?",
        "What's something you want to process or think through?",
        "What's a fear you'd like to overcome?",
        "What's a value you want to live more aligned with?",
        "What's something you need to let go of?",
        "What's a decision you're wrestling with?",
        "What's something you want to do differently?",
        "What's a lesson life is trying to teach you right now?",
        "What's a belief about yourself you want to challenge?",
        "What's something you need to forgive yourself for?",
        "What's a boundary you need to set or maintain?",
        "What's something you're curious about?",
        "What's a conversation you need to have?",
        "What's something you want to celebrate about yourself?",
        "What's a habit or behavior you want to understand better?",
        "What's something you're ready to change?",
        "What's a strength you want to develop further?",
        "When do you feel most confident in yourself, and what contributes to that feeling?",
        "What do you believe are your biggest strengths?",
        "Do you compare yourself to others? How does that affect you?",
        "What's a recurring thought you've been having lately?",
        "How do you talk to yourself when you face a challenge?",
        "What beliefs do you hold about yourself that either help or limit you?",
        "What's one thought you need to let go of to move forward?",
        "How do you react to negative thoughts—do you challenge them or let them go?",
        "If your mind was a teammate or coach, what kind of advice would it be giving you?",
        "How does your internal dialogue change when you're feeling confident vs. uncertain?",
        "What's one empowering thought you can focus on today?",
        "How do your thoughts impact your performance or daily motivation?",
        "What's a thought that always makes you feel stronger?"
      ];

      const checkInPrompts = [
        "How are you really feeling right now?",
        "What's your energy level today and why?",
        "What's working well in your life right now?",
        "What's challenging you at the moment?",
        "What do you need more or less of right now?",
        "What's one win from today, no matter how small?",
        "What's something you're looking forward to?",
        "What's one thing that would make today better?",
        "How's your progress toward your recent goals?",
        "What's one thing you can do for self-care today?",
        "What's your biggest source of stress right now?",
        "What's bringing you joy these days?",
        "What's something you need to hear right now?",
        "How's your work-life balance feeling?",
        "What's something you're proud of from this week?",
        "What's an emotion you're sitting with today?",
        "What's your gut telling you about something?",
        "What's your body telling you it needs?",
        "What's a boundary you need to check in with?",
        "How are your relationships feeling?",
        "What's something you want to acknowledge about today?",
        "What's your mental state like right now?",
        "What's an area of your life that needs attention?",
        "What's something you're avoiding dealing with?",
        "What's your intuition telling you about a situation?",
        "How do you define success for yourself?",
        "Do you compare yourself to others? How does that affect you?",
        "What is one area where you'd like to improve mentally?",
        "How are you feeling mentally and physically right now?",
        "On a scale from 1-10, how well are you taking care of yourself this week?",
        "What has been the highlight of your day so far?",
        "What is something you're currently struggling with?",
        "What's one thing you need more of in your life right now?",
        "Have you been prioritizing rest and recovery as much as you should?",
        "What's one emotion you've been feeling a lot lately?",
        "Are your daily actions aligning with your long-term goals?",
        "What's one thing you could do today to feel more balanced?",
        "What's something you need to let go of to feel lighter?"
      ];

      switch (selectedCategory) {
        case Categories.MyGratitude:
          return {
            title: "What are you grateful for today?",
            content: getRandomPrompt(gratitudePrompts)
          };
        case Categories.MyGoals:
          return {
            title: "What goal are you focusing on?",
            content: getRandomPrompt(goalsPrompts)
          };
        case Categories.CheckIn:
          return {
            title: "How are you doing today?",
            content: getRandomPrompt(checkInPrompts)
          };
        default:
          return {
            title: "What's on your mind?",
            content: getRandomPrompt(thoughtsPrompts)
          };
      }
    };

    const placeholders = getCategoryPlaceholders();

    return {
      formItem: {
        ...journalEntry,
        Category: SAVE_CATEGORY_MAPPING[selectedCategory],
        User: userId,
        CreatedAt: journalEntry?.CreatedAt || new Date().toISOString()
      },
      customTextValues: [
        { 
          propertyName: "Title", 
          label: "Title",
          placeholder: placeholders.content
        },
        { 
          propertyName: "Content", 
          label: "",
          placeholder: "Write your thoughts here..."
        }
      ],
      validationSchema: {
        Title: Yup.string().required('Title is required'),
        Content: Yup.string().required('Content is required'),
        Category: Yup.string().required('Category is required')
      },
      style: {
        form: { paddingBottom: 40 }
      }
    };
  }, [journalEntry, selectedCategory, userId]);

  const handleFormResponse = useCallback(({ response, isValid }: { response?: any; isValid?: any }) => {
    if (response?.error) {
      setError(response.error);
    } else {
      navigation.navigate('Journal');
    }
  }, [navigation]);

  const handleDeleteConfirmation = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Delete Journal Entry",
        "Are you sure you want to delete this entry?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false)
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true)
          }
        ],
        { cancelable: false }
      );
    });
  }, []);

  // Load journal entry when editing
  useEffect(() => {
    if (route.params?.journalId !== "new") {
      dispatch(getJournal(Number(route.params?.journalId)));
    }
  }, [dispatch, route.params?.journalId]);

  // Update selected category when route params change
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  const renderCategoryButton = useCallback((category: typeof CATEGORIES[0]) => (
    <Pressable
      key={category.id}
      onPress={() => setSelectedCategory(category.category)}
      style={[
        styles.categoryButton,
        {
          backgroundColor: selectedCategory === category.category 
            ? constants.primaryColor 
            : constants.white
        }
      ]}
    >
      <View style={styles.categoryButtonContent}>
        <Typography
          text={category.emoji}
          style={styles.categoryEmoji}
        />
        <Typography
          text={category.name}
          style={[
            styles.categoryText,
            {
              color: selectedCategory === category.category 
                ? constants.white 
                : constants.primaryColor
            }
          ]}
        />
      </View>
    </Pressable>
  ), [selectedCategory]);

  return (
    <LinearGradient
      colors={["#FAFF18", "#FFDF70", "#FFA800"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.3, y: 0.1 }}
      style={[styles.container, layoutStyles.headerPageCompensation]}
    >
      <WebFadeIn background={false}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'transparent',
        }}>
          <Typography 
            text={route.params?.journalId === "new" ? "New Entry" : "Edit Entry"}
            type={TypographyTypes.H6}
            style={{ 
              color: constants.black900,
              fontSize: 18,
              fontWeight: '600'
            }}
          />
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              backgroundColor: constants.primaryColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Typography
              text="Save"
              style={{
                color: constants.white,
                fontSize: 14,
                fontWeight: '600',
              }}
            />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        >
          <Body>
            <>
              {error && (
                <View style={styles.errorContainer}>
                  <Typography
                    text={error}
                    style={styles.errorText}
                  />
                </View>
              )}
              
              <View style={styles.categoryContainer}>
                <Typography
                  text="Select Category"
                  type={TypographyTypes.H6}
                  style={styles.categoryTitle}
                />
                <View style={styles.categoriesWrapper}>
                  {CATEGORIES.map(renderCategoryButton)}
                </View>
              </View>

              <View style={styles.formContainer}>
                <JournalForm
                  ref={formRef}
                  formItem={formConfig.formItem}
                  customTextValues={formConfig.customTextValues}
                  injectedValidationSchema={formConfig.validationSchema}
                  afterCreate={handleFormResponse}
                  afterUpdate={handleFormResponse}
                  afterDelete={handleFormResponse}
                  beforeDelete={handleDeleteConfirmation}
                  hideButtons={true}
                  style={{
                    form: { 
                      paddingBottom: 20,
                      marginTop: 0,
                      paddingHorizontal: 0,
                      position: 'relative'
                    }
                  }}
                  readOnly={["Category"]}
                />
              </View>
            </>
          </Body>
        </ScrollView>
      </WebFadeIn>
    </LinearGradient>
  );
};

export default React.memo(JournalEditScreen); 