import React, { useState, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Body, Typography, WebFadeIn } from "src/components/common";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import constants from "src/themes/constants";
import { TypographyTypes } from "src/components/common/typography";
import { MeditationCategory, CATEGORY_DESCRIPTIONS, MEDITATION_SESSIONS, MeditationSession } from "./constants";
import { MeditationCategoryTile } from "src/components/common/meditationCategory/meditationCategory";
import { MeditationSessionTile } from "src/components/common/meditationSession/meditationSession";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const MeditationScreen = ({
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
  const layoutStyles = useLayoutStyles();
  const [selectedCategory, setSelectedCategory] = useState<MeditationCategory | null>(null);

  const filteredSessions = useMemo(() => {
    if (!selectedCategory) return [];
    return MEDITATION_SESSIONS.filter(session => session.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <FullScreenWithBackground 
      headerCompenstation={summaryOnly ? false : true}
      colours={["#E0B0FF", "#9B59B6", "#662D91"]}
    >
      <ScrollView
        style={{ height: "100%" }}
        nestedScrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            justifyContent: "space-between",
            marginTop: -20,
            flexGrow: 1,
          },
          style,
        ]}
        scrollEnabled={scrollEnabled}
      >
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            paddingTop: 20,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text="Meditation"
            style={{
              color: constants.white,
              marginBottom: 10,
            }}
          />
          
          {/* Summary view for dashboard tile */}
          {summaryOnly && (
            <View>
              <Typography
                type={TypographyTypes.Body1}
                text="Take a moment to breathe"
                style={{
                  color: constants.white,
                  textAlign: "center",
                }}
              />
            </View>
          )}
        </View>

        {/* Full screen view */}
        {!summaryOnly && (
          <View
            style={{
              flexGrow: 1,
              backgroundColor: "#EFEEF5",
              borderTopLeftRadius: constants.radiusXXLarge,
              borderTopRightRadius: constants.radiusXXLarge,
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
          >
            <Typography
              type={TypographyTypes.H5}
              text={selectedCategory ? "Select a Session" : "Choose Your Practice"}
              style={{
                color: constants.black900,
                marginBottom: 20,
              }}
            />

            {!selectedCategory ? (
              // Show categories
              Object.values(MeditationCategory).map((category) => (
                <MeditationCategoryTile
                  key={category}
                  category={category}
                  description={CATEGORY_DESCRIPTIONS[category]}
                  onPress={() => setSelectedCategory(category)}
                  isSelected={selectedCategory === category}
                />
              ))
            ) : (
              // Show sessions for selected category
              <View>
                <Typography
                  type={TypographyTypes.Body2}
                  text="← Back to Categories"
                  style={{
                    color: constants.black600,
                    marginBottom: 20,
                    textDecorationLine: "underline",
                  }}
                  onPress={() => setSelectedCategory(null)}
                />
                {filteredSessions.map((session) => (
                  <MeditationSessionTile
                    key={session.id}
                    session={session}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default MeditationScreen; 