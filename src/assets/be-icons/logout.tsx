import React from "react";
import { Path } from "react-native-svg";

const Logout: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Path
        d="M8.8999 7.56023C9.2099 3.96023 11.0599 2.49023 15.1099 2.49023H15.2399C19.7099 2.49023 21.4999 4.28023 21.4999 8.75023V15.2702C21.4999 19.7402 19.7099 21.5302 15.2399 21.5302H15.1099C11.0899 21.5302 9.2399 20.0802 8.9099 16.5402"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.0001 12H3.62012"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.85 8.65002L2.5 12L5.85 15.35"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default Logout;
