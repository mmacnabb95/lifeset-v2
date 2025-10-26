import React from "react";
import { Circle } from "react-native-svg";

const DND: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Circle cx="8" cy="3" r="2" fill={props?.iconColor} />
      <Circle cx="8" cy="12" r="2" fill={props?.iconColor} />
      <Circle cx="8" cy="21" r="2" fill={props?.iconColor} />
      <Circle cx="16" cy="3" r="2" fill={props?.iconColor} />
      <Circle cx="16" cy="12" r="2" fill={props?.iconColor} />
      <Circle cx="16" cy="21" r="2" fill={props?.iconColor} />
    </>
  );
};

export default DND;
