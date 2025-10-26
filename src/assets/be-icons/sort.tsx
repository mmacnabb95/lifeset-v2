import React from "react";
import { Path } from "react-native-svg";

const Sort: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Path
        d="M6.95118 11.9319C6.28263 11.3143 6.71959 10.1974 7.62972 10.1974L16.8301 10.1974C17.7403 10.1974 18.1772 11.3143 17.5087 11.9319L12.9085 16.1814C12.5253 16.5353 11.9345 16.5353 11.5514 16.1814L6.95118 11.9319Z"
        fill={props?.iconColor}
      />
    </>
  );
};

export default Sort;
