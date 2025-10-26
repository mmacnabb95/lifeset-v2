import React, { useState } from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { Typography, TypographyTypes } from '../../components/common/typography';
import FullScreenWithBackground from '../user/fullScreenWithBackground/fullScreenWithBackground';
import constants from 'src/themes/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { PngIcon } from '../../components/common/pngIcon/pngIcon';
import { fireMediumHapticFeedback } from 'src/utils/haptics';
import * as ImagePicker from 'expo-image-picker';

interface WorkoutFormData {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  coverImage?: string;
}

const CreateWorkout = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WorkoutFormData>({
    title: '',
    description: '',
    duration: 4,
    difficulty: 'beginner'
  });

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle image upload to your server here
      setFormData(prev => ({
        ...prev,
        coverImage: result.assets[0].uri
      }));
    }
  };

  const renderStep1 = () => (
    <View style={{ padding: 20 }}>
      <Typography
        type={TypographyTypes.H4}
        text="Create Your Workout"
        style={{
          color: constants.black900,
          marginBottom: 20,
        }}
      />
      
      {/* Cover Image Upload */}
      <Pressable 
        onPress={handleImagePick}
        style={{
          height: 200,
          backgroundColor: '#F5F5F5',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        {formData.coverImage ? (
          <Image 
            source={{ uri: formData.coverImage }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 12,
            }}
          />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <PngIcon
              iconName="upload"
              height={32}
              width={32}
            />
            <Typography
              type={TypographyTypes.Body1}
              text="Upload Cover Image"
              style={{
                color: constants.black600,
                marginTop: 8,
              }}
            />
          </View>
        )}
      </Pressable>

      {/* Form fields will go here */}
      
      {/* Navigation buttons */}
      <Pressable
        onPress={() => setCurrentStep(2)}
        style={{
          backgroundColor: constants.primaryColor,
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <Typography
          type={TypographyTypes.ButtonTextPrimary}
          text="Next: Add Exercises"
          style={{ color: constants.white }}
        />
      </Pressable>
    </View>
  );

  return (
    <FullScreenWithBackground
      headerCompenstation={true}
      colours={["#9BE9EE", "#6FB28E", "#005484"]}
    >
      <ScrollView
        style={{ height: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        {currentStep === 1 && renderStep1()}
        {/* Additional steps will be added here */}
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default CreateWorkout; 