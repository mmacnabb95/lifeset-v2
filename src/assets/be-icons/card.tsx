import React from "react";
import { Line, Path, Rect } from "react-native-svg";

const Card: React.FunctionComponent<{
  iconColor?: string;
}> = ({ iconColor }) => {
  return (
    <>
      <Path
        d="M7.41667 6.0006H6C3.79086 6.0006 2 7.79145 2 10.0006V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2092 22 18V10.0006C22 7.79146 20.2091 6.0006 18 6.0006H17"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Rect
        x="5.3324"
        y="15.5992"
        width="4.16667"
        height="3.99985"
        rx="1"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Line
        x1="11.9158"
        y1="16.4484"
        x2="16.2491"
        y2="16.4484"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Line
        x1="11.9158"
        y1="19.0013"
        x2="18.7491"
        y2="19.0013"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Rect
        x="5.33261"
        y="9.19994"
        width="4.16667"
        height="3.99985"
        rx="1"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Line
        x1="11.9158"
        y1="10.0491"
        x2="16.2491"
        y2="10.0491"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Line
        x1="11.9158"
        y1="12.6019"
        x2="18.7491"
        y2="12.6019"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M10.4999 2.75H14.3332C14.4713 2.75 14.5832 2.86193 14.5832 3V3.98325C14.5832 4.62758 15.1055 5.14991 15.7499 5.14991C16.2561 5.14991 16.6665 5.56032 16.6665 6.06658V6.8498H7.74988V6.39991C7.74988 5.70956 8.30952 5.14991 8.99988 5.14991C9.69023 5.14991 10.2499 4.59027 10.2499 3.89991V3C10.2499 2.86193 10.3618 2.75 10.4999 2.75Z"
        stroke={iconColor}
        strokeWidth="1.5"
      />
    </>
  );
};

export default Card;
