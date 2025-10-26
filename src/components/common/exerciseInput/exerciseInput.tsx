import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Typography, TypographyTypes } from '../typography';
import constants from 'src/themes/constants';
import { PngIcon } from '../pngIcon/pngIcon';

interface ExerciseInputProps {
  exercise: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    restBetweenSets: number;
    notes?: string;
  };
  onChange: (field: string, value: any) => void;
  onDelete: () => void;
}

export const ExerciseInput = ({ exercise, onChange, onDelete }: ExerciseInputProps) => {
  return (
    <View
      style={{
        backgroundColor: constants.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      {/* Exercise Name */}
      <View style={{ marginBottom: 16 }}>
        <Typography
          type={TypographyTypes.Body2}
          text="Exercise Name"
          style={{
            color: constants.black600,
            marginBottom: 4,
          }}
        />
        <TextInput
          value={exercise.name}
          onChangeText={(value) => onChange('name', value)}
          style={{
            borderWidth: 1,
            borderColor: constants.black200,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
          }}
          placeholder="e.g., Bench Press"
        />
      </View>

      {/* Sets and Reps */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Typography
            type={TypographyTypes.Body2}
            text="Sets"
            style={{
              color: constants.black600,
              marginBottom: 4,
            }}
          />
          <TextInput
            value={exercise.sets.toString()}
            onChangeText={(value) => onChange('sets', parseInt(value) || 0)}
            style={{
              borderWidth: 1,
              borderColor: constants.black200,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Typography
            type={TypographyTypes.Body2}
            text="Reps"
            style={{
              color: constants.black600,
              marginBottom: 4,
            }}
          />
          <TextInput
            value={exercise.reps.toString()}
            onChangeText={(value) => onChange('reps', parseInt(value) || 0)}
            style={{
              borderWidth: 1,
              borderColor: constants.black200,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Weight and Rest */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Typography
            type={TypographyTypes.Body2}
            text="Weight (kg)"
            style={{
              color: constants.black600,
              marginBottom: 4,
            }}
          />
          <TextInput
            value={exercise.weight?.toString() || ''}
            onChangeText={(value) => onChange('weight', parseInt(value) || 0)}
            style={{
              borderWidth: 1,
              borderColor: constants.black200,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            keyboardType="number-pad"
            placeholder="Optional"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Typography
            type={TypographyTypes.Body2}
            text="Rest (seconds)"
            style={{
              color: constants.black600,
              marginBottom: 4,
            }}
          />
          <TextInput
            value={exercise.restBetweenSets.toString()}
            onChangeText={(value) => onChange('restBetweenSets', parseInt(value) || 0)}
            style={{
              borderWidth: 1,
              borderColor: constants.black200,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Notes */}
      <View style={{ marginBottom: 16 }}>
        <Typography
          type={TypographyTypes.Body2}
          text="Notes"
          style={{
            color: constants.black600,
            marginBottom: 4,
          }}
        />
        <TextInput
          value={exercise.notes || ''}
          onChangeText={(value) => onChange('notes', value)}
          style={{
            borderWidth: 1,
            borderColor: constants.black200,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            minHeight: 80,
          }}
          multiline
          placeholder="Add any additional notes here"
        />
      </View>

      {/* Delete Button */}
      <Pressable
        onPress={onDelete}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          backgroundColor: '#FEE2E2',
          borderRadius: 8,
        }}
      >
        <PngIcon
          iconName="trash"
          height={20}
          width={20}
        />
        <Typography
          type={TypographyTypes.Body2}
          text="Delete Exercise"
          style={{
            color: '#DC2626',
            marginLeft: 8,
          }}
        />
      </Pressable>
    </View>
  );
}; 