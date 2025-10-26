import React from "react";
import { Pressable, View } from "react-native";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { PngIcon } from "../pngIcon/pngIcon";
import { LinearGradient } from "expo-linear-gradient";
import { Typography, TypographyTypes } from "../typography";

export const MeditationDashboardTile = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  return (
    <DashboardTile 
      style={{ 
        padding: 0, 
        overflow: "hidden", 
        height: 160
      }}
    >
      <LinearGradient
        colors={["#E0B0FF", "#9B59B6", "#662D91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.3, y: 0.1 }}
        style={{ height: '100%' }}
      >
        <Pressable
          onPress={() => {
            fireMediumHapticFeedback();
            navigation.navigate("Meditation");
          }}
          style={({ pressed }) => [
            {
              height: "100%",
              width: "100%",
              opacity: pressed ? 0.9 : 1,
              padding: 12,
            },
          ]}
        >
          <View style={{ height: '100%' }}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <PngIcon iconName="yoga2" height={32} width={32} />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Typography
                type={TypographyTypes.H4}
                text="Meditation"
                style={{
                  color: '#FFFFFF',
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: '600'
                }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text="Take a moment to breathe"
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  opacity: 0.9
                }}
              />
            </View>
          </View>
        </Pressable>
      </LinearGradient>
    </DashboardTile>
  );
}; 