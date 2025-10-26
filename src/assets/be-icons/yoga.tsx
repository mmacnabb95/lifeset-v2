import React from "react";
import { Ellipse, Line, Path } from "react-native-svg";

const Yoga: React.FunctionComponent<{
  iconColor?: string;
}> = ({ iconColor }) => {
  return (
    <>
      <Path
        d="M6.54581 18.4054H6.63672"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Ellipse
        cx="12.0001"
        cy="5.54664"
        rx="1.81818"
        ry="2.21694"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Path
        d="M12.9088 3.77356C12.9088 2.30429 12.5018 2 11.9998 2C11.4977 2 11.0907 2.30429 11.0907 3.77356"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Line
        x1="2.75"
        y1="21.0388"
        x2="21.25"
        y2="21.0388"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M9.2731 10.8675V15.3014H14.7276V10.8675"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M6.54581 13.0846L7.4549 10.4243C7.75793 9.5375 9.09126 7.76395 12.0004 7.76395C14.9094 7.76395 16.2428 9.5375 16.5458 10.4243L17.4549 13.0846"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M6.54512 13.0846L3.45227 15.7244C3.16046 15.9735 3.14565 16.4194 3.42028 16.6873V16.6873C3.90295 17.1582 4.66493 17.1835 5.1778 16.7457L7.90875 14.4148C8.21178 14.1192 8.90875 13.262 9.27239 10.4243"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M17.4547 13.0846L20.5475 15.7244C20.8394 15.9735 20.8542 16.4194 20.5795 16.6873V16.6873C20.0969 17.1582 19.3349 17.1835 18.822 16.7457L16.0911 14.4148C15.788 14.1192 15.0911 13.262 14.7274 10.4243"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M9.27239 15.3016L5.12989 16.99C3.98878 17.4551 3.58946 18.8449 4.30867 19.8481V19.8481C4.82244 20.5648 5.75961 20.8542 6.58688 20.5516L12.4542 18.4053"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Path
        d="M14.7274 15.302L18.7122 16.6902C19.9345 17.116 20.4305 18.5499 19.7323 19.6395V19.6395C19.2032 20.4653 18.154 20.8068 17.2408 20.4505L12.0002 18.4057"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Path
        d="M17.4544 18.405L12.6183 16.8326C12.2164 16.7019 11.7834 16.7019 11.3814 16.8326L7.90897 17.9616"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M13.3639 17.0757L14.0592 18.093C14.1499 18.2257 14.0548 18.4058 13.894 18.4058H12.4548"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
};

export default Yoga;
