import React from "react";
import { Path } from "react-native-svg";

const Location: React.FunctionComponent<{
  iconColor?: string;
}> = ({ iconColor }) => {
  return (
    <>
      <Path
        d="M13.2504 12.8462C14.401 12.8462 15.3337 11.9123 15.3337 10.7603C15.3337 9.60832 14.401 8.67445 13.2504 8.67445C12.0998 8.67445 11.167 9.60832 11.167 10.7603"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M13.2512 16.1833C16.2427 16.1833 18.6679 13.7553 18.6679 10.7601C18.6679 7.76494 16.2427 5.33688 13.2512 5.33688C10.2596 5.33688 7.8345 7.76494 7.8345 10.7601"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M13.25 19.5212C18.0825 19.5212 22 15.5989 22 10.7606C22 5.92225 18.0825 2 13.25 2C8.41748 2 4.49997 5.92225 4.49997 10.7606"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M11.2635 13.0418L9.20945 19.2112C9.13624 19.4311 8.82953 19.4417 8.74139 19.2274L7.86032 17.085C7.68274 16.6533 7.34027 16.3104 6.90902 16.1326L4.76927 15.2505C4.55521 15.1622 4.56577 14.8551 4.78539 14.7818L10.9474 12.7253C11.1427 12.6602 11.3286 12.8462 11.2635 13.0418Z"
        stroke={iconColor}
        strokeWidth="1.5"
      />
    </>
  );
};

export default Location;
