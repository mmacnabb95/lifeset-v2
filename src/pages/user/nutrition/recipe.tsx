import React from 'react';
import { ScrollView, View } from 'react-native';
import FullScreenWithBackground from '../fullScreenWithBackground/fullScreenWithBackground';
import { Typography } from 'src/components/common';
import { TypographyTypes } from 'src/components/common/typography';
import constants from 'src/themes/constants';

const RecipeScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const { recipe } = route.params;

  return (
    <FullScreenWithBackground 
      headerCompenstation={true}
      colours={["#90EE90", "#32CD32", "#13bf38"]}
    >
      <ScrollView
        style={{ height: '100%' }}
        nestedScrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: 'space-between',
          marginTop: -20,
          flexGrow: 1,
        }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: 'center',
            paddingTop: 20,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text={recipe.title}
            style={{
              color: constants.white,
              marginBottom: 10,
              textAlign: 'center',
            }}
          />
          <Typography
            type={TypographyTypes.Body1}
            text={recipe.description}
            style={{
              color: constants.white,
              marginBottom: 20,
              textAlign: 'center',
              opacity: 0.9,
            }}
          />
        </View>

        {/* Recipe Details */}
        <View
          style={{
            flexGrow: 1,
            backgroundColor: '#EFEEF5',
            borderTopLeftRadius: constants.radiusXXLarge,
            borderTopRightRadius: constants.radiusXXLarge,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          {/* Quick Info */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
              backgroundColor: constants.white,
              padding: 15,
              borderRadius: 12,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Time"
                style={{ color: constants.black600, marginBottom: 5 }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text={`${recipe.duration} min`}
                style={{ color: constants.black900 }}
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Servings"
                style={{ color: constants.black600, marginBottom: 5 }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text={recipe.servings.toString()}
                style={{ color: constants.black900 }}
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Calories"
                style={{ color: constants.black600, marginBottom: 5 }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text={recipe.nutrition.calories.toString()}
                style={{ color: constants.black900 }}
              />
            </View>
          </View>

          {/* Nutrition Info */}
          <View
            style={{
              backgroundColor: constants.white,
              padding: 15,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <Typography
              type={TypographyTypes.H5}
              text="Nutrition"
              style={{
                color: constants.black900,
                marginBottom: 15,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Typography
                  type={TypographyTypes.Body2}
                  text="Protein"
                  style={{ color: constants.black600, marginBottom: 5 }}
                />
                <Typography
                  type={TypographyTypes.Body1}
                  text={`${recipe.nutrition.protein}g`}
                  style={{ color: constants.black900 }}
                />
              </View>
              <View>
                <Typography
                  type={TypographyTypes.Body2}
                  text="Carbs"
                  style={{ color: constants.black600, marginBottom: 5 }}
                />
                <Typography
                  type={TypographyTypes.Body1}
                  text={`${recipe.nutrition.carbs}g`}
                  style={{ color: constants.black900 }}
                />
              </View>
              <View>
                <Typography
                  type={TypographyTypes.Body2}
                  text="Fat"
                  style={{ color: constants.black600, marginBottom: 5 }}
                />
                <Typography
                  type={TypographyTypes.Body1}
                  text={`${recipe.nutrition.fat}g`}
                  style={{ color: constants.black900 }}
                />
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View style={{ marginBottom: 30 }}>
            <Typography
              type={TypographyTypes.H5}
              text="Ingredients"
              style={{
                color: constants.black900,
                marginBottom: 15,
              }}
            />
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <Typography
                key={index}
                type={TypographyTypes.Body1}
                text={`• ${ingredient}`}
                style={{
                  color: constants.black600,
                  marginBottom: 8,
                }}
              />
            ))}
          </View>

          {/* Instructions */}
          <View>
            <Typography
              type={TypographyTypes.H5}
              text="Instructions"
              style={{
                color: constants.black900,
                marginBottom: 15,
              }}
            />
            {recipe.steps.map((step: string, index: number) => (
              <Typography
                key={index}
                type={TypographyTypes.Body1}
                text={`${index + 1}. ${step}`}
                style={{
                  color: constants.black600,
                  marginBottom: 12,
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default RecipeScreen; 