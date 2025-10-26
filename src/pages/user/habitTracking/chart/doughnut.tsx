import React, { useEffect, useRef, useState } from "react";
import { View, Animated } from "react-native";
import { Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ProgressCircle } from "react-native-svg-charts";

const useStyles = require("../styles/styles").default;

export const Doughnut = ({
  data,
  title = "For the month",
}: {
  data: number[];
  title?: string;
}) => {
  const styles = useStyles();
  const [progress, setProgress] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const targetValue = data[0] || 0;
    
    // Set up the value listener
    const id = animatedValue.addListener(({ value }) => {
      setProgress(value);
    });
    
    // Configure animation
    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Cleanup
    return () => {
      animatedValue.removeListener(id);
    };
  }, [data]);

  // Calculate the progress color based on completion percentage
  const getProgressColor = (progress: number) => {
    if (progress >= 1) {
      return '#ffda16'; // Gold color at 100%
    } else if (progress >= 0.9) {
      // Interpolate between white and gold from 90% to 100%
      const t = (progress - 0.9) * 10; // normalize to 0-1 range
      const r = Math.round(255 + (255 - 255) * t);
      const g = Math.round(255 + (218 - 255) * t);
      const b = Math.round(255 + (22 - 255) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return 'rgb(255, 255, 255)'; // White color below 90%
  };

  return (
    <View style={styles.doughnutContainer}>
      <View style={styles.circularBackgrond}>
        <View
          style={[styles.centeredText, title ? {} : styles.centeredTextNoTitle]}
        >
          <Typography
            testID="daily_completion_percentage"
            type={TypographyTypes.H1}
            style={styles.centerDoughnutFont}
            text={`${Math.round(data[0] * 100)}%`}
          />
          {!!title && (
            <Typography
              type={TypographyTypes.Body1}
              text={title}
              style={styles.centerDoughnutDescFont}
            />
          )}
        </View>
      </View>
      <View style={[styles.ring, styles.ring1]} />
      <View style={[styles.ring, styles.ring2]} />
      <View style={[styles.ring, styles.ring3]} />
      <View style={[styles.ring, styles.ring4]} />
      <View style={[styles.ring, styles.ring5]} />
      <ProgressCircle
        style={{ height: 160, width: 160 }}
        progress={progress}
        progressColor={getProgressColor(progress)}
        startAngle={0}
        endAngle={360}
        backgroundColor={"rgba(0,0,0,0)"}
        strokeWidth={12}
      />
    </View>
  );
};
