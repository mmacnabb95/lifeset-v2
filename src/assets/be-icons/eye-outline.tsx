import React from "react";
import { Path } from "react-native-svg";

const EyeOutline: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Path
        d="M12 5.25C8.83 5.25 6.25 7.83 6.25 11C6.25 14.17 8.83 16.75 12 16.75C15.17 16.75 17.75 14.17 17.75 11C17.75 7.83 15.17 5.25 12 5.25ZM12 15.25C9.66 15.25 7.75 13.34 7.75 11C7.75 8.66 9.66 6.75 12 6.75C14.34 6.75 16.25 8.66 16.25 11C16.25 13.34 14.34 15.25 12 15.25Z"
        fill={props?.iconColor}
      />
      <Path
        d="M12 8.75C10.76 8.75 9.75 9.76 9.75 11C9.75 12.24 10.76 13.25 12 13.25C13.24 13.25 14.25 12.24 14.25 11C14.25 9.76 13.24 8.75 12 8.75Z"
        fill={props?.iconColor}
      />
      <Path
        d="M21.25 11.47V10.53C21.25 10.42 21.24 10.31 21.22 10.2C20.83 7.89 19.34 5.83 17.09 4.27C14.87 2.72 12.24 1.97 9.65002 2.18C6.25002 2.46 3.30002 4.56 1.77002 7.51C1.43002 8.15 1.43002 8.86 1.77002 9.5C2.62002 11.14 3.87002 12.53 5.37002 13.5"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.63 13.5C19.58 12.82 20.4 11.96 21.22 10.2"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default EyeOutline; 