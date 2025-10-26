import React, { useState, useEffect } from 'react';
import { ScrollView, View, Pressable, Image, FlatList, useWindowDimensions } from 'react-native';
import { Typography, TypographyTypes } from '../../components/common/typography';
import FullScreenWithBackground from '../user/fullScreenWithBackground/fullScreenWithBackground';
import constants from 'src/themes/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { PngIcon } from '../../components/common/pngIcon/pngIcon';
import { fireMediumHapticFeedback } from 'src/utils/haptics';
import { workoutData, type Workout } from '../../config/workouts';
import { useDispatch } from 'react-redux';
import { createUserWorkout } from 'src/redux/domain/features/userWorkout/collection-slice';
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";

const WorkoutCard = ({ workout, onPress }: { 
  workout: Workout,
  onPress: () => void,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2; // 2 columns with less padding

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ([{ 
        width: cardWidth,
        margin: 4, // Reduced margin
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: constants.white,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        opacity: pressed ? 0.9 : 1,
      }])}
    >
      <Image
        source={{ uri: workout.imageUrl }}
        style={{
          width: '100%',
          height: 120,
          resizeMode: 'cover',
        }}
      />
      <View style={{ padding: 12 }}>
        <Typography
          type={TypographyTypes.H5}
          text={workout.title}
          style={{
            color: constants.black900,
            marginBottom: 4,
            fontSize: 16,
          }}
        />
        <Typography
          type={TypographyTypes.Body2}
          text={workout.description}
          style={{
            color: constants.black600,
          }}
        />
      </View>
    </Pressable>
  );
};

const WorkoutCollection = ({ 
  title, 
  workouts, 
  onWorkoutPress 
}: { 
  title: string, 
  workouts: readonly Workout[],
  onWorkoutPress: (workoutId: number) => void
}) => (
  <View style={{ marginBottom: 24 }}>
    <Typography
      type={TypographyTypes.H5}
      text={title}
      style={{
        color: constants.black900,
        marginBottom: 16,
        paddingHorizontal: 16, // Reduced padding
      }}
    />
    <FlatList
      data={workouts.slice(0, 2)} // Only show first 2 items
      renderItem={({ item }) => (
        <WorkoutCard
          workout={item}
          onPress={() => onWorkoutPress(item.workoutId)}
        />
      )}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: 12,
        alignItems: 'center', // Center the cards
      }}
      scrollEnabled={false}
    />
  </View>
);

const WorkoutDashboard = ({
  navigation,
  route,
  summaryOnly,
  style,
  scrollEnabled = true,
}: {
  navigation: any;
  route: any;
  summaryOnly?: boolean;
  style?: any;
  scrollEnabled?: boolean;
}) => {
  const dispatch = useDispatch();
  const { userId } = useUserInfo();

  const handleGetPersonalized = () => {
    fireMediumHapticFeedback();
    navigation.navigate('UserWorkoutAssignment');
  };

  const handleWorkoutPress = async (workoutId: number) => {
    fireMediumHapticFeedback();
    
    try {
      // Find the workout data from our local config
      const selectedWorkout = [...workoutData.featuredWorkouts, ...workoutData.quickHomeWorkouts]
        .find(w => w.workoutId === workoutId);

      if (!selectedWorkout) {
        console.error('Workout not found:', workoutId);
        return;
      }

      // Create a user workout
      const actionResult = await dispatch(createUserWorkout({
        User: userId,
        Workout: workoutId
      }));

      // Check if we have a successful result
      if ('payload' in actionResult && actionResult.payload) {
        // Now navigate to the workout view with the new userWorkoutId
        navigation.navigate('UserWorkoutView', { 
          workoutId: workoutId,
          userWorkoutId: actionResult.payload.Id
        });
      } else {
        console.error('Failed to create workout:', actionResult.error);
      }
    } catch (error) {
      console.error('Error creating user workout:', error);
      // Handle error - maybe show a toast or alert
    }
  };

  return (
    <FullScreenWithBackground 
      headerCompenstation={summaryOnly ? false : true}
      colours={["#9BE9EE", "#6FB28E", "#005484"]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 30,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text="Workouts"
            style={{
              color: constants.white,
              marginBottom: 10,
            }}
          />
        </View>

        {!summaryOnly && (
          <View
            style={{
              flex: 1,
              backgroundColor: "#EFEEF5",
              borderTopLeftRadius: constants.radiusXXLarge,
              borderTopRightRadius: constants.radiusXXLarge,
            }}
          >
            <ScrollView
              bounces={true}
              showsVerticalScrollIndicator={true}
              scrollEnabled={scrollEnabled}
              contentContainerStyle={{
                paddingBottom: 80,
              }}
              scrollEventThrottle={16}
            >
              <View
                style={{
                  paddingHorizontal: 16, // Reduced from 20
                  paddingTop: 20,
                }}
              >
                <Typography
                  type={TypographyTypes.H5}
                  text="Choose Your Workout"
                  style={{
                    color: constants.black900,
                    marginBottom: 20,
                  }}
                />

                {/* Get Personalized Program Button */}
                <Pressable 
                  onPress={handleGetPersonalized}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    marginBottom: 20,
                  })}
                >
                  <LinearGradient
                    colors={["#9BE9EE", "#6FB28E", "#005484"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 12,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ marginRight: 16 }}>
                      <PngIcon
                        iconName="gym"
                        height={32}
                        width={32}
                      />
                    </View>
                    <View>
                      <Typography
                        type={TypographyTypes.H5}
                        text="Get Personalized Program"
                        style={{
                          color: '#1A1A1A',
                          marginBottom: 4,
                          fontSize: 20,
                        }}
                      />
                      <Typography
                        type={TypographyTypes.Body2}
                        text="Create a custom workout plan"
                        style={{
                          color: '#1A1A1A',
                          opacity: 0.9,
                        }}
                      />
                    </View>
                  </LinearGradient>
                </Pressable>

                {/* Featured Workouts Section */}
                <WorkoutCollection
                  title="Featured Workouts"
                  workouts={workoutData.featuredWorkouts}
                  onWorkoutPress={handleWorkoutPress}
                />

                {/* Quick Home Workouts Section */}
                <WorkoutCollection
                  title="Quick Home Workouts"
                  workouts={workoutData.quickHomeWorkouts}
                  onWorkoutPress={handleWorkoutPress}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </FullScreenWithBackground>
  );
};

export default WorkoutDashboard; 