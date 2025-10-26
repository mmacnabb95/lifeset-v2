import React from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Typography, TypographyTypes } from '../../components/common/typography';
import FullScreenWithBackground from '../user/fullScreenWithBackground/fullScreenWithBackground';
import constants from 'src/themes/constants';
import type { Workout } from '../../config/workouts';

const WorkoutView = ({ 
  navigation, 
  route 
}: { 
  navigation: any; 
  route: { 
    params: { 
      workout: Workout 
    } 
  } 
}) => {
  const { workout } = route.params;

  return (
    <FullScreenWithBackground
      headerCompenstation={true}
      colours={["#9BE9EE", "#6FB28E", "#005484"]}
    >
      <ScrollView>
        <View style={{ flex: 1, padding: 20 }}>
          <Image 
            source={{ uri: workout.imageUrl }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: 12,
              marginBottom: 20
            }}
          />
          
          <Typography
            type={TypographyTypes.H4}
            text={workout.title}
            style={{
              color: constants.black900,
              marginBottom: 12,
            }}
          />
          
          <Typography
            type={TypographyTypes.Body1}
            text={workout.description}
            style={{
              color: constants.black600,
              marginBottom: 20,
            }}
          />
          
          {/* Add more workout details here */}
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default WorkoutView; 