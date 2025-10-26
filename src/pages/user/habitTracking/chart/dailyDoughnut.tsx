import React from "react";
import { Image, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/constants";

const useStyles = require("../styles/styles").default;

export const DailyDoughnut = ({
  text,
  data,
  selected,
}: {
  text: string;
  data: number[];
  selected?: boolean;
}) => {
  const styles = useStyles();

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

  const chartConfig: AbstractChartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (_opacity = 1, _index) => `rgba(255, 255, 255, ${_opacity})`,
  };

  const _data = {
    data: [data[0]],
    colors: [data[0] === 0 ? constants.transparent : getProgressColor(data[0])],
  };

  return (
    <View style={{ borderWidth: 0, marginBottom: 10 }}>
      <Typography
        type={TypographyTypes.Body1}
        style={{
          textAlign: "center",
          color: constants.white,
          opacity: selected ? 1 : 0.7,
          fontWeight: selected ? 600 : 400,
          textTransform: "capitalize",
        }}
        text={text}
      />

      <View style={styles.doughnutContainer}>
        <View
          style={[
            styles.tickContainer,
            data[0] === 1 ? { backgroundColor: getProgressColor(1) } : {},
          ]}
        >
          <>
            {data[0] === 1 && (
              <Image
                source={require("../../../../../assets/smallTick.png")}
                style={{ height: 16, width: 16, tintColor: '#333333' }}
              />
            )}
          </>
        </View>
        <ProgressChart
          data={_data}
          width={40}
          height={40}
          strokeWidth={5}
          hasLegend={true}
          withCustomBarColorFromData={true}
          radius={12}
          chartConfig={chartConfig}
          hideLegend={true}
        />
      </View>
    </View>
  );
};
