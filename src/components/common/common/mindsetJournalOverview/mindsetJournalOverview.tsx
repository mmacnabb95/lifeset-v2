import React from "react";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { Pressable, View } from "react-native";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Typography, TypographyTypes } from "../typography";
import { PngIcon } from "../pngIcon/pngIcon";

export const MindsetJournalOverview = ({
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
        colors={["#FAFF18", "#FFDF70", "#FFA800"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.3, y: 0.1 }}
        style={{ height: '100%' }}
      >
        <Pressable
          onPress={() => {
            fireMediumHapticFeedback();
            navigation.navigate("Main", {
              screen: "Journal"
            });
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
              <PngIcon iconName="journal" height={32} width={32} />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Typography
                type={TypographyTypes.H4}
                text="Journal"
                style={{
                  color: '#505050',
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: '600'
                }}
              />
              <Typography
                type={TypographyTypes.Body1}
                text="Reflect on your journey"
                style={{
                  color: '#505050',
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
