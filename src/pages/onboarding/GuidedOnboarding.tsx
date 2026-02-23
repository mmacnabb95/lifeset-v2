// Guided Onboarding Flow
// Helps new users set up their first goal and habits

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { useMode } from 'src/hooks/useMode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { createGoal, getOrganisationGoals } from 'src/services/firebase/goals';
import { createHabit, getHabits, getOrganisationHabits, Habit } from 'src/services/firebase/habits';
import { linkHabitToGoals } from 'src/services/firebase/goals';
import { getOrganisation } from 'src/services/firebase/organisation';
import { GOAL_TEMPLATES } from 'src/data/goal-templates';
import { HABIT_SUGGESTIONS } from 'src/data/habit-suggestions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GuidedOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack?: () => void; // Optional callback to go back to carousel
  mode?: 'onboarding' | 'add-goal'; // Mode: onboarding (full flow) or add-goal (just goal creation)
}

type Step = 'goal' | 'habits' | 'complete';

export const GuidedOnboarding: React.FC<GuidedOnboardingProps> = ({
  onComplete,
  onSkip,
  onBack,
  mode = 'onboarding',
}) => {
  const insets = useSafeAreaInsets();
  const { userId } = useFirebaseUser();
  const { organisation } = useMode();
  const [fallbackOrgId, setFallbackOrgId] = useState<string | null>(null);
  const [fallbackOrgName, setFallbackOrgName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('goal');
  const [orgGoals, setOrgGoals] = useState<Array<{ id: string; title: string; description?: string; targetCompletions?: number; linkedOrganisationHabitIds: string[] }>>([]);
  const [orgHabits, setOrgHabits] = useState<Array<{ id: string; name: string; description?: string; category?: string; schedule: Record<string, boolean> }>>([]);
  const orgId = organisation?.organisationId || fallbackOrgId;
  const orgName = organisation?.name || fallbackOrgName;
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [customGoalText, setCustomGoalText] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [customHabits, setCustomHabits] = useState<Array<{ name: string }>>([]);
  const [existingHabits, setExistingHabits] = useState<Habit[]>([]);
  const [selectedExistingHabits, setSelectedExistingHabits] = useState<Set<string>>(new Set());
  const [selectedHabitsToCreate, setSelectedHabitsToCreate] = useState<Set<string>>(new Set()); // Track suggested habits to create
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const customGoalInputRef = useRef<TextInput>(null);

  // Load existing habits if in add-goal mode
  React.useEffect(() => {
    if (mode === 'add-goal' && userId && typeof userId === 'string') {
      const loadHabits = async () => {
        try {
          const habitsData = await getHabits(userId);
          setExistingHabits(habitsData);
        } catch (error) {
          console.error('Error loading habits:', error);
        }
      };
      loadHabits();
    }
  }, [mode, userId]);

  // Load org goals and habits when user has organisation (from useMode)
  React.useEffect(() => {
    if (!organisation?.organisationId) return;
    setFallbackOrgId(null);
    setFallbackOrgName(null);
    Promise.all([
      getOrganisationGoals(organisation.organisationId),
      getOrganisationHabits(organisation.organisationId),
    ]).then(([goals, habits]) => {
      setOrgGoals(goals);
      setOrgHabits(habits);
    });
  }, [organisation?.organisationId]);

  // Fallback: when useMode returns no organisation (e.g. add-goal from habits), load from user doc
  React.useEffect(() => {
    if (organisation?.organisationId || !userId || mode !== 'add-goal') return;
    const loadFromUserDoc = async () => {
      try {
        const uid = typeof userId === 'string' ? userId : String(userId);
        const userDoc = await getDoc(doc(db, 'users', uid));
        const data = userDoc.data();
        const orgId = data?.organisationId || data?.activeOrganisationId || (data?.organisations && data.organisations[0]);
        if (!orgId) return;
        setFallbackOrgId(orgId);
        const [goals, habits, org] = await Promise.all([
          getOrganisationGoals(orgId),
          getOrganisationHabits(orgId),
          getOrganisation(orgId),
        ]);
        setOrgGoals(goals);
        setOrgHabits(habits);
        setFallbackOrgName(org?.name || null);
      } catch (err) {
        console.error('Fallback org load error:', err);
      }
    };
    loadFromUserDoc();
  }, [organisation?.organisationId, userId, mode]);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setIsCustomGoal(false);
    setCustomGoalText('');
    setCustomHabits([]); // reset custom habits when switching goals
    // Auto-select suggested habits for this goal (only in onboarding mode)
    if (goalId.startsWith('org_')) {
      const orgGoalId = goalId.replace('org_', '');
      const orgGoal = orgGoals.find(g => g.id === orgGoalId);
      if (orgGoal && mode === 'onboarding') {
        setSelectedHabits(new Set(orgGoal.linkedOrganisationHabitIds.map(id => 'org_habit_' + id)));
      }
    } else if (mode === 'onboarding') {
      const goal = GOAL_TEMPLATES.find(g => g.id === goalId);
      if (goal) {
        setSelectedHabits(new Set(goal.suggestedHabits || []));
      }
    } else if (mode === 'add-goal') {
      // In add-goal mode, try to match suggested habits to existing habits
      if (goalId.startsWith('org_')) {
        const orgGoalId = goalId.replace('org_', '');
        const orgGoal = orgGoals.find(g => g.id === orgGoalId);
        if (orgGoal && existingHabits.length > 0) {
          const matchedHabitIds: string[] = [];
          orgGoal.linkedOrganisationHabitIds.forEach(orgHabitId => {
            const orgHabit = orgHabits.find(h => h.id === orgHabitId);
            if (orgHabit) {
              const matched = existingHabits.find(h =>
                h.name.toLowerCase() === orgHabit.name.toLowerCase()
              );
              if (matched?.id) matchedHabitIds.push(matched.id);
            }
          });
          setSelectedExistingHabits(new Set(matchedHabitIds));
        }
      } else {
      const goal = GOAL_TEMPLATES.find(g => g.id === goalId);
      if (goal && existingHabits.length > 0) {
        const matchedHabitIds: string[] = [];
        goal.suggestedHabits.forEach(suggestedId => {
          const suggestedHabit = HABIT_SUGGESTIONS[suggestedId];
          if (suggestedHabit) {
            // Try to find matching existing habit
            const matched = existingHabits.find(h => {
              const habitNameNormalized = h.name.toLowerCase().replace(/\s+/g, '-');
              const habitNameLower = h.name.toLowerCase();
              const suggestedName = suggestedId.replace(/-/g, ' ').toLowerCase();
              const suggestedHabitName = suggestedHabit.name.toLowerCase();
              
              if (habitNameNormalized === suggestedId) return true;
              if (habitNameLower.includes(suggestedName) || suggestedName.includes(habitNameLower)) return true;
              if (habitNameLower.includes(suggestedHabitName) || suggestedHabitName.includes(habitNameLower)) return true;
              return false;
            });
            
            if (matched && matched.id) {
              matchedHabitIds.push(matched.id);
            }
          }
        });
        setSelectedExistingHabits(new Set(matchedHabitIds));
      }
      }
    }
  };

  const handleCustomGoalSelect = () => {
    setIsCustomGoal(true);
    setSelectedGoal(null);
    setSelectedHabits(new Set()); // Clear auto-selected habits for custom goal
    setSelectedExistingHabits(new Set()); // Clear selected existing habits in add-goal mode
    // For onboarding custom goals, show first input; for add-goal keep hidden until user taps add
    setCustomHabits(mode === 'onboarding' ? [{ name: '' }] : []);
  };

  const handleHabitToggle = (habitId: string) => {
    setSelectedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    // Dismiss keyboard when moving to next step
    Keyboard.dismiss();
    customGoalInputRef.current?.blur();
    
    if (step === 'goal') {
      // Go to habits step
      setStep('habits');
      scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
    } else if (step === 'habits') {
      // Complete flow
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step === 'goal' && onBack) {
      // If on first step and onBack callback exists, go back to intro
      onBack();
    } else if (step === 'habits') {
      setStep('goal');
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    
    // If swiping left from goal step (index < 0 or very close to 0), go back to intro
    if (index < 0 && step === 'goal' && onBack) {
      onBack();
      return;
    }
    
    if (index === 0 && step !== 'goal') {
      setStep('goal');
    } else if (index === 1 && step !== 'habits') {
      setStep('habits');
    }
  };

  const canGoBack = true; // Always show back button (can go back to carousel from goal step if onBack exists)

  const handleComplete = async () => {
    if (!userId || typeof userId !== 'string') {
      onComplete();
      return;
    }

    setLoading(true);

    try {
      let createdGoalId: string | null = null;

      // Create goal if one was selected or custom goal was entered
      if (isCustomGoal && customGoalText.trim()) {
        const goalData: any = {
          userId,
          title: customGoalText.trim(),
          description: '',
          linkedHabitIds: [],
        };

        createdGoalId = await createGoal(goalData);
      } else if (selectedGoal?.startsWith('org_')) {
        const orgGoalId = selectedGoal.replace('org_', '');
        const orgGoal = orgGoals.find(g => g.id === orgGoalId);
        if (orgGoal) {
          const goalData: any = {
            userId,
            title: orgGoal.title,
            description: orgGoal.description || '',
            linkedHabitIds: [],
          };
          if (orgGoal.targetCompletions) {
            goalData.targetCompletions = orgGoal.targetCompletions;
          }
          createdGoalId = await createGoal(goalData);
        }
      } else if (selectedGoal) {
        const goalTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
        if (goalTemplate) {
          const goalData: any = {
            userId,
            title: goalTemplate.title,
            description: goalTemplate.description,
            linkedHabitIds: [],
          };

          if (goalTemplate.targetCompletions) {
            goalData.targetCompletions = goalTemplate.targetCompletions;
          }

          createdGoalId = await createGoal(goalData);
        }
      }

      // Create selected habits (template habits or org habits)
      const createdHabitIds: string[] = [];
      for (const habitId of selectedHabits) {
        if (habitId.startsWith('org_habit_')) {
          const orgHabitId = habitId.replace('org_habit_', '');
          const orgHabit = orgHabits.find(h => h.id === orgHabitId);
          if (orgHabit) {
            const defaultSchedule = {
              monday: true, tuesday: true, wednesday: true, thursday: true,
              friday: true, saturday: true, sunday: true,
            };
            const schedule = orgHabit.schedule
              ? { ...defaultSchedule, ...orgHabit.schedule }
              : defaultSchedule;
            const habitData = {
              userId,
              name: orgHabit.name,
              description: orgHabit.description || '',
              category: orgHabit.category || 'custom',
              schedule,
            };
            const habitIdCreated = await createHabit(habitData);
            createdHabitIds.push(habitIdCreated);
            if (createdGoalId) {
              await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true);
            }
          }
        } else {
        const habitSuggestion = HABIT_SUGGESTIONS[habitId];
        if (habitSuggestion) {
          const habitData = {
            userId,
            name: habitSuggestion.name,
            description: habitSuggestion.description,
            category: habitSuggestion.category,
            schedule: habitSuggestion.defaultSchedule || {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          };

          const habitIdCreated = await createHabit(habitData);
          createdHabitIds.push(habitIdCreated);

          // Link habit to goal if goal was created
          if (createdGoalId) {
            await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true); // Recalculate progress
          }
        }
        }
      }

      // Create custom habits if custom goal was selected (only in onboarding mode)
      // In add-goal mode, custom habits are created in the add-goal specific block below
      if (isCustomGoal && mode === 'onboarding') {
        for (const customHabit of customHabits) {
          if (customHabit.name.trim()) {
            const habitData: any = {
              userId,
              name: customHabit.name.trim(),
              description: '',
              category: 'custom',
              schedule: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
              },
            };

            const habitIdCreated = await createHabit(habitData);
            createdHabitIds.push(habitIdCreated);

            // Link habit to goal if goal was created
            if (createdGoalId) {
              await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true); // Recalculate progress
            }
          }
        }
      }

      // In add-goal mode, link to existing habits and create custom habits
      if (mode === 'add-goal' && createdGoalId) {
        // Link existing habits
        if (selectedExistingHabits.size > 0) {
          const existingHabitIds = Array.from(selectedExistingHabits)
            .map(id => existingHabits.find(h => h.id === id)?.id)
            .filter(Boolean) as string[];
          
          if (existingHabitIds.length > 0) {
            for (const habitId of existingHabitIds) {
              await linkHabitToGoals(userId, habitId, [createdGoalId], true); // Recalculate progress
            }
          }
        }
        
        // Create suggested habits that were selected (habits without matches)
        if (selectedHabitsToCreate.size > 0) {
          for (const habitId of selectedHabitsToCreate) {
            if (habitId.startsWith('org_habit_')) {
              const orgHabitId = habitId.replace('org_habit_', '');
              const orgHabit = orgHabits.find(h => h.id === orgHabitId);
              if (orgHabit) {
                const defaultSchedule = {
                  monday: true, tuesday: true, wednesday: true, thursday: true,
                  friday: true, saturday: true, sunday: true,
                };
                const schedule = orgHabit.schedule
                  ? { ...defaultSchedule, ...orgHabit.schedule }
                  : defaultSchedule;
                const habitData: any = {
                  userId,
                  name: orgHabit.name,
                  description: orgHabit.description || '',
                  category: orgHabit.category || 'custom',
                  schedule,
                };
                const habitIdCreated = await createHabit(habitData);
                await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true);
              }
            } else {
            const suggestedHabit = HABIT_SUGGESTIONS[habitId];
            if (suggestedHabit) {
              const habitData: any = {
                userId,
                name: suggestedHabit.name,
                description: suggestedHabit.description || '',
                category: suggestedHabit.category || 'custom',
                schedule: suggestedHabit.defaultSchedule || {
                  monday: true,
                  tuesday: true,
                  wednesday: true,
                  thursday: true,
                  friday: true,
                  saturday: true,
                  sunday: true,
                },
              };

              const habitIdCreated = await createHabit(habitData);
              await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true); // Recalculate progress
            }
            }
          }
        }
        
        // Create and link custom habits (from "Add Your Own Habit")
        for (const customHabit of customHabits) {
          if (customHabit.name.trim()) {
            const habitData: any = {
              userId,
              name: customHabit.name.trim(),
              description: '',
              category: 'custom',
              schedule: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
              },
            };

            const habitIdCreated = await createHabit(habitData);
            await linkHabitToGoals(userId, habitIdCreated, [createdGoalId], true); // Recalculate progress
          }
        }
      } else if (mode === 'onboarding') {
        // Update goal with linked habit IDs (onboarding mode)
        if (createdGoalId && createdHabitIds.length > 0) {
          // The goal already has linkedHabitIds from linkHabitToGoals, so we're good
        }
      }

      if (mode === 'add-goal') {
        Alert.alert('Success', 'Goal created successfully!', [
          { text: 'OK', onPress: onComplete }
        ]);
      } else {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error completing guided onboarding:', error);
      // In dev mode or when Firebase fails, continue anyway
      // The error is likely due to missing permissions in Expo Go
      if (__DEV__) {
        console.log('⚠️ Dev mode: Continuing despite error');
      }
      // Don't show alert in dev mode to avoid blocking
      if (!__DEV__) {
        Alert.alert('Error', 'Failed to set up your goals and habits. You can add them later.');
      }
      onComplete(); // Continue anyway - always navigate
    } finally {
      setLoading(false);
    }
  };

  const   getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'fitness': '#f0f9ff', // Very light blue
      'health': '#f0fdf4', // Very light green
      'productivity': '#fffbeb', // Very light yellow
      'mental-health': '#faf5ff', // Very light purple
      'nutrition': '#fdf2f8', // Very light pink
      'other': '#f9fafb', // Very light gray
    };
    return colorMap[category] || '#f9fafb';
  };

  const renderGoalStep = () => {
    const categories = Array.from(new Set(GOAL_TEMPLATES.map(g => g.category)));
    
    return (
      <View style={styles.stepContainer}>
        {/* Fixed Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.stepTitle} allowFontScaling={false}>What's your main goal?</Text>
            <Text style={styles.stepSubtitle} allowFontScaling={false}>
              Choose a goal to get started, or skip this step and set up later.
            </Text>
          </View>
        </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Create Your Own Goal Option - Always first */}
          <TouchableOpacity
            style={[
              styles.goalOption,
              { backgroundColor: '#fffbeb' }, // Very light yellow for custom
              isCustomGoal && styles.goalOptionSelected,
            ]}
            onPress={handleCustomGoalSelect}
          >
            <View style={styles.goalOptionContent}>
              <Text style={[
                styles.goalOptionTitle,
                isCustomGoal && styles.goalOptionTitleSelected,
              ]}
              allowFontScaling={false}
              >
                Create your own goal
              </Text>
              <Text style={styles.goalOptionDescription} allowFontScaling={false}>
                Set a custom goal that's meaningful to you
              </Text>
            </View>
            {isCustomGoal && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark} allowFontScaling={false}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Organisation Goals (when user has organisation) */}
          {orgGoals.length > 0 && orgName && (
            <View style={[styles.categorySection, { marginTop: 24 }]}>
              <Text style={styles.categoryTitle} allowFontScaling={false}>
                🏢 {orgName} Goals
              </Text>
              {orgGoals.map(goal => {
                const goalKey = 'org_' + goal.id;
                return (
                  <TouchableOpacity
                    key={goalKey}
                    style={[
                      styles.goalOption,
                      { backgroundColor: '#e3f2fd' },
                      selectedGoal === goalKey && styles.goalOptionSelected,
                    ]}
                    onPress={() => handleGoalSelect(goalKey)}
                  >
                    <View style={styles.goalOptionContent}>
                      <Text style={[
                        styles.goalOptionTitle,
                        selectedGoal === goalKey && styles.goalOptionTitleSelected,
                      ]}
                      allowFontScaling={false}
                      >
                        {goal.title}
                      </Text>
                      <Text style={styles.goalOptionDescription} allowFontScaling={false}>
                        {goal.description || 'Suggested by your studio'}
                      </Text>
                    </View>
                    {selectedGoal === goalKey && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark} allowFontScaling={false}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Custom Goal Text Input */}
          {isCustomGoal && (
            <View style={styles.customGoalInputContainer}>
              <Text style={styles.customGoalLabel} allowFontScaling={false}>Enter your goal:</Text>
              <TextInput
                ref={customGoalInputRef}
                style={styles.customGoalInput}
                placeholder="e.g., Run a marathon, Learn Spanish, Build a business..."
                placeholderTextColor="#999"
                value={customGoalText}
                onChangeText={setCustomGoalText}
                multiline
                maxLength={100}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  customGoalInputRef.current?.blur();
                }}
              />
              <Text style={styles.customGoalHint} allowFontScaling={false}>
                {customGoalText.length}/100 characters
              </Text>
            </View>
          )}

          {/* Template Goals */}
          {categories.map(category => {
            const categoryGoals = GOAL_TEMPLATES.filter(g => g.category === category);
            return (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle} allowFontScaling={false}>
                  {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
                {categoryGoals.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      { backgroundColor: getCategoryColor(goal.category) },
                      selectedGoal === goal.id && styles.goalOptionSelected,
                    ]}
                    onPress={() => handleGoalSelect(goal.id)}
                  >
                    <View style={styles.goalOptionContent}>
                      <Text style={[
                        styles.goalOptionTitle,
                        selectedGoal === goal.id && styles.goalOptionTitleSelected,
                      ]}
                      allowFontScaling={false}
                      >
                        {goal.title}
                      </Text>
                      <Text style={styles.goalOptionDescription} allowFontScaling={false}>
                        {goal.description}
                      </Text>
                    </View>
                    {selectedGoal === goal.id && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark} allowFontScaling={false}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          
        </ScrollView>
      </View>
    );
  };

  const renderHabitsStep = () => {
    // In add-goal mode, show suggested habits like onboarding but link to existing habits
    if (mode === 'add-goal') {
      // Get suggested habits from template or org goal (unified format: { id, name, description? })
      type SuggestedItem = { id: string; name: string; description?: string };
      let suggestedItems: SuggestedItem[] = [];
      
      if (selectedGoal?.startsWith('org_')) {
        const orgGoalId = selectedGoal.replace('org_', '');
        const orgGoal = orgGoals.find(g => g.id === orgGoalId);
        if (orgGoal) {
          suggestedItems = orgGoal.linkedOrganisationHabitIds
            .map(habitId => {
              const h = orgHabits.find(x => x.id === habitId);
              return h ? { id: 'org_habit_' + h.id, name: h.name, description: h.description } : null;
            })
            .filter(Boolean) as SuggestedItem[];
        }
      } else if (selectedGoal) {
        const goalTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
        if (goalTemplate) {
          suggestedItems = goalTemplate.suggestedHabits
            .map(id => {
              const h = HABIT_SUGGESTIONS[id];
              return h ? { id, name: h.name, description: h.description } : null;
            })
            .filter(Boolean) as SuggestedItem[];
        }
      }

      // Match suggested habits to existing habits
      const suggestedWithMatches = suggestedItems.map(suggested => {
        const matched = existingHabits.find(h => {
          const habitNameLower = h.name.toLowerCase();
          const suggestedName = suggested.id.startsWith('org_habit_')
            ? suggested.name.toLowerCase()
            : suggested.id.replace(/-/g, ' ').toLowerCase();
          const suggestedHabitName = suggested.name.toLowerCase();
          if (habitNameLower === suggestedHabitName) return true;
          if (habitNameLower.includes(suggestedHabitName) || suggestedHabitName.includes(habitNameLower)) return true;
          return false;
        });
        return { suggested, matched };
      });

      // Other existing habits not in suggestions
      const otherHabits = existingHabits.filter(h => 
        !suggestedWithMatches.some(({ matched }) => matched?.id === h.id)
      );

      return (
        <View style={styles.stepContainer}>
          {/* Fixed Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              <Text style={styles.stepTitle} allowFontScaling={false}>Link Habits</Text>
              <Text style={styles.stepSubtitle} allowFontScaling={false}>
                {selectedGoal 
                  ? (() => {
                      if (selectedGoal.startsWith('org_')) {
                        const orgGoal = orgGoals.find(g => selectedGoal === 'org_' + g.id);
                        return orgGoal 
                          ? `We've suggested some habits for "${orgGoal.title}". Link the ones you already track, or add new ones.`
                          : 'Link habits that contribute to this goal, or skip this step.';
                      }
                      const goalTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
                      return goalTemplate 
                        ? `We've suggested some habits for "${goalTemplate.title}". Link the ones you already track, or skip this step.`
                        : 'Link habits that contribute to this goal, or skip this step.';
                    })()
                  : isCustomGoal
                  ? 'Link habits that contribute to this goal, or skip this step.'
                  : 'Link habits that contribute to this goal, or skip this step.'}
              </Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Add Custom Habit CTA at top */}
            <TouchableOpacity
              style={[styles.habitOption, styles.addCustomHabitOption]}
              onPress={() => {
                setCustomHabits(prev => [...prev, { name: '' }]);
              }}
            >
              <View style={styles.habitOptionContent}>
                <Text style={styles.addCustomHabitText} allowFontScaling={false}>+ Add Your Own Habit</Text>
                <Text style={styles.habitOptionDescription} allowFontScaling={false}>
                  Create a custom habit to link to this goal
                </Text>
              </View>
            </TouchableOpacity>

            {/* Custom Habit Inputs (appear right below the button) */}
            {customHabits.length > 0 && customHabits.map((customHabit, index) => (
              <View key={`custom-${index}`} style={styles.customHabitContainer}>
                <Text style={styles.customHabitLabel} allowFontScaling={false}>Custom Habit {index + 1}:</Text>
                <TextInput
                  style={styles.customHabitInput}
                  placeholder="e.g., Exercise 30 minutes, Read for 20 minutes..."
                  placeholderTextColor="#999"
                  value={customHabit.name}
                  onChangeText={(text) => {
                    const updated = [...customHabits];
                    updated[index].name = text;
                    setCustomHabits(updated);
                  }}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />
                {customHabits.length > 0 && (
                  <TouchableOpacity
                    style={styles.removeHabitButton}
                    onPress={() => {
                      const updated = customHabits.filter((_, i) => i !== index);
                      setCustomHabits(updated);
                    }}
                  >
                    <Text style={styles.removeHabitButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Suggested Habits (same style as onboarding) */}
            {suggestedWithMatches.length > 0 && suggestedWithMatches.map(({ suggested, matched }) => {
              const habit = suggested;
              const hasMatch = !!matched;
              const isSelected = hasMatch 
                ? selectedExistingHabits.has(matched!.id!) 
                : selectedHabitsToCreate.has(habit.id);
              
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitOption,
                    isSelected && styles.habitOptionSelected,
                  ]}
                  onPress={() => {
                    if (hasMatch && matched?.id) {
                      // Toggle existing habit link
                      setSelectedExistingHabits(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(matched.id!)) {
                          newSet.delete(matched.id!);
                        } else {
                          newSet.add(matched.id!);
                        }
                        return newSet;
                      });
                    } else {
                      // Toggle habit to create
                      setSelectedHabitsToCreate(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(habit.id)) {
                          newSet.delete(habit.id);
                        } else {
                          newSet.add(habit.id);
                        }
                        return newSet;
                      });
                    }
                  }}
                >
                  <View style={styles.habitOptionContent}>
                    <Text style={[
                      styles.habitOptionTitle,
                      isSelected && styles.habitOptionTitleSelected,
                    ]}
                    allowFontScaling={false}
                    >
                      {habit.name}
                    </Text>
                    {habit.description && (
                    <Text style={styles.habitOptionDescription} allowFontScaling={false}>
                      {habit.description}
                    </Text>
                    )}
                  </View>
                  <View style={[
                    styles.habitCheckbox,
                    isSelected && styles.habitCheckboxSelected,
                    !hasMatch && !isSelected && styles.habitCheckboxUnavailable,
                  ]}>
                    {isSelected ? (
                      <Text style={styles.habitCheckmark} allowFontScaling={false}>✓</Text>
                    ) : !hasMatch ? (
                      <Text style={styles.habitCheckmarkUnavailable} allowFontScaling={false}>+</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Other Existing Habits */}
            {otherHabits.length > 0 && (
              <>
                <Text style={styles.otherHabitsTitle} allowFontScaling={false}>Other Habits</Text>
                {otherHabits.map(habit => {
                  const isSelected = selectedExistingHabits.has(habit.id!);
                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={[styles.habitOption, isSelected && styles.habitOptionSelected]}
                      onPress={() => {
                        setSelectedExistingHabits(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(habit.id!)) {
                            newSet.delete(habit.id!);
                          } else {
                            newSet.add(habit.id!);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <View style={styles.habitOptionContent}>
                        <Text style={[
                          styles.habitOptionTitle,
                          isSelected && styles.habitOptionTitleSelected,
                        ]}
                        allowFontScaling={false}
                        >
                          {habit.name}
                        </Text>
                        {habit.description && (
                          <Text style={styles.habitOptionDescription} allowFontScaling={false}>
                            {habit.description}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.habitCheckbox, isSelected && styles.habitCheckboxSelected]}>
                        {isSelected && <Text style={styles.habitCheckmark} allowFontScaling={false}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {selectedExistingHabits.size === 0 && selectedHabitsToCreate.size === 0 && customHabits.every(h => !h.name.trim()) && (
              <Text style={styles.helperText} allowFontScaling={false}>
                You can skip this step and link habits later
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }

    // Onboarding mode (original behavior)
    if (isCustomGoal) {
      return (
        <View style={styles.stepContainer}>
          {/* Fixed Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              <Text style={styles.stepTitle} allowFontScaling={false}>Create Your Own Habits</Text>
              <Text style={styles.stepSubtitle} allowFontScaling={false}>
                Create habits to reach your goal: "{customGoalText}"
              </Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Custom Habits */}
            {customHabits.map((habit, index) => (
              <View key={index} style={styles.customHabitContainer}>
                <Text style={styles.customHabitLabel} allowFontScaling={false}>Habit {index + 1}:</Text>
                <TextInput
                  style={styles.customHabitInput}
                  placeholder="e.g., Exercise 30 minutes, Read for 20 minutes..."
                  placeholderTextColor="#999"
                  value={habit.name}
                  onChangeText={(text) => {
                    const updated = [...customHabits];
                    updated[index].name = text;
                    setCustomHabits(updated);
                  }}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />
                {index === customHabits.length - 1 && customHabits.length < 5 && (
                  <TouchableOpacity
                    style={styles.addHabitButton}
                    onPress={() => setCustomHabits([...customHabits, { name: '' }])}
                  >
                    <Text style={styles.addHabitButtonText} allowFontScaling={false}>+ Add Another Habit</Text>
                  </TouchableOpacity>
                )}
                {customHabits.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeHabitButton}
                    onPress={() => {
                      const updated = customHabits.filter((_, i) => i !== index);
                      setCustomHabits(updated);
                    }}
                  >
                    <Text style={styles.removeHabitButtonText} allowFontScaling={false}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Template goal or org goal - show suggested habits (onboarding mode)
    let suggestedHabits: typeof HABIT_SUGGESTIONS[string][] = [];
    let suggestedOrgHabitsForDisplay: Array<{ id: string; name: string; description?: string }> = [];

    if (selectedGoal?.startsWith('org_')) {
      const orgGoalId = selectedGoal.replace('org_', '');
      const orgGoal = orgGoals.find(g => g.id === orgGoalId);
      if (orgGoal) {
        suggestedOrgHabitsForDisplay = orgGoal.linkedOrganisationHabitIds
          .map(habitId => {
            const h = orgHabits.find(x => x.id === habitId);
            return h ? { id: 'org_habit_' + h.id, name: h.name, description: h.description } : null;
          })
          .filter(Boolean) as Array<{ id: string; name: string; description?: string }>;
      }
    } else if (selectedGoal) {
      const goalTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
      if (goalTemplate) {
        suggestedHabits = goalTemplate.suggestedHabits
          .map(id => HABIT_SUGGESTIONS[id])
          .filter(Boolean);
      }
    }

    // If no goal selected, show some general popular habits
    if (suggestedHabits.length === 0 && suggestedOrgHabitsForDisplay.length === 0) {
      suggestedHabits = [
        HABIT_SUGGESTIONS['workout-daily'],
        HABIT_SUGGESTIONS['meditation'],
        HABIT_SUGGESTIONS['journaling'],
        HABIT_SUGGESTIONS['water-intake'],
        HABIT_SUGGESTIONS['read-daily'],
      ].filter(Boolean);
    }

    return (
      <View style={styles.stepContainer}>
        {/* Fixed Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.stepTitle} allowFontScaling={false}>Select Your Habits</Text>
            <Text style={styles.stepSubtitle} allowFontScaling={false}>
              {selectedGoal 
                ? (() => {
                    if (selectedGoal.startsWith('org_')) {
                      const orgGoal = orgGoals.find(g => selectedGoal === 'org_' + g.id);
                      return orgGoal 
                        ? `We've suggested some habits for "${orgGoal.title}". Select a few to start with, or skip this step.`
                        : 'Select some habits to get started, or skip this step and add them later.';
                    }
                    const goalTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
                    return goalTemplate 
                      ? `We've suggested some habits for "${goalTemplate.title}". Select a few to start with, or skip this step.`
                      : 'Select some habits to get started, or skip this step and add them later.';
                  })()
                : 'Select some habits to get started, or skip this step and add them later.'}
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.optionsContainer}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
        >
          {suggestedOrgHabitsForDisplay.map(habit => {
            const isSelected = selectedHabits.has(habit.id);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitOption,
                  isSelected && styles.habitOptionSelected,
                ]}
                onPress={() => handleHabitToggle(habit.id)}
              >
                <View style={styles.habitOptionContent}>
                  <Text style={[
                    styles.habitOptionTitle,
                    isSelected && styles.habitOptionTitleSelected,
                  ]}
                  allowFontScaling={false}
                  >
                    {habit.name}
                  </Text>
                  {habit.description && (
                  <Text style={styles.habitOptionDescription} allowFontScaling={false}>
                    {habit.description}
                  </Text>
                  )}
                </View>
                <View style={[
                  styles.habitCheckbox,
                  isSelected && styles.habitCheckboxSelected,
                ]}>
                  {isSelected && <Text style={styles.habitCheckmark} allowFontScaling={false}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
          {suggestedHabits.map(habit => {
            const isSelected = selectedHabits.has(habit.id);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitOption,
                  isSelected && styles.habitOptionSelected,
                ]}
                onPress={() => handleHabitToggle(habit.id)}
              >
                <View style={styles.habitOptionContent}>
                  <Text style={[
                    styles.habitOptionTitle,
                    isSelected && styles.habitOptionTitleSelected,
                  ]}
                  allowFontScaling={false}
                  >
                    {habit.name}
                  </Text>
                  <Text style={styles.habitOptionDescription} allowFontScaling={false}>
                    {habit.description}
                  </Text>
                </View>
                <View style={[
                  styles.habitCheckbox,
                  isSelected && styles.habitCheckboxSelected,
                ]}>
                  {isSelected && <Text style={styles.habitCheckmark} allowFontScaling={false}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedHabits.size === 0 && (
          <Text style={[styles.helperText, { marginTop: -40, marginBottom: 8 }]} allowFontScaling={false}>
            You can add habits later by clicking Complete Setup
          </Text>
        )}
      </View>
    );
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View style={[
          styles.progressFill,
          { width: `${((['goal', 'habits'].indexOf(step) + 1) / 2) * 100}%` },
        ]} />
      </View>

      {/* Swipeable Step Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.swipeContainer}
        scrollEnabled={true}
      >
        <View style={styles.swipePage}>
          {renderGoalStep()}
        </View>
        <View style={styles.swipePage}>
          {renderHabitsStep()}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {step === 'goal' ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText} allowFontScaling={false}>{mode === 'add-goal' ? 'Back' : 'Skip'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText} allowFontScaling={false}>← Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            loading && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText} allowFontScaling={false}>
              {mode === 'add-goal' ? 'Create Goal' : (step === 'habits' ? 'Complete Setup' : 'Next')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerSection: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    maxWidth: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for navigation buttons
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  goalOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalOptionSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  goalOptionContent: {
    flex: 1,
    paddingRight: 12,
  },
  goalOptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  goalOptionTitleSelected: {
    color: '#667eea',
  },
  goalOptionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '400',
  },
  checkmarkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmark: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  habitOption: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  habitOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  habitOptionContent: {
    flex: 1,
  },
  habitOptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  habitOptionTitleSelected: {
    color: '#667eea',
  },
  habitOptionDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    fontWeight: '400',
  },
  habitCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#667eea',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  habitCheckboxSelected: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  habitCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  reminderOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  reminderOptionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    letterSpacing: -0.2,
  },
  reminderOptionTextSelected: {
    color: '#667eea',
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 16,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  swipeContainer: {
    flex: 1,
  },
  swipePage: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  customGoalInputContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  customGoalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  customGoalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 110,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontWeight: '500',
  },
  customGoalHint: {
    fontSize: 13,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
    fontWeight: '500',
  },
  customGoalTargetContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  customHabitContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  customHabitLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  customHabitHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  customHabitInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    fontWeight: '500',
  },
  addHabitButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addHabitButtonText: {
    fontSize: 17,
    color: '#667eea',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  removeHabitButton: {
    marginTop: 12,
    padding: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff5f5',
  },
  removeHabitButtonText: {
    fontSize: 15,
    color: '#e74c3c',
    fontWeight: '600',
  },
  habitOptionUnavailable: {
    opacity: 0.6,
  },
  habitCheckboxUnavailable: {
    borderColor: '#999',
    backgroundColor: '#f5f5f5',
  },
  habitCheckmarkUnavailable: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitOptionTextUnavailable: {
    color: '#999',
  },
  habitOptionHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  otherHabitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    marginTop: 20,
    marginBottom: 12,
  },
  existingHabitsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  existingHabitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  existingHabitsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  habitOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  habitOptionTextSelected: {
    fontWeight: '600',
    color: '#667eea',
  },
  addCustomHabitOption: {
    borderStyle: 'dashed',
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  addCustomHabitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 6,
  },
});

