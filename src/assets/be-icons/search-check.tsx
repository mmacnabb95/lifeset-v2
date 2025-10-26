import React from "react";
import { Path } from "react-native-svg";

const SearchCheck: React.FunctionComponent<{
  iconColor?: string;
}> = ({ iconColor }) => {
  return (
    <>
      <Path
        d="M7.71428 8.66667L10.7819 10.9674C11.2004 11.2812 11.79 11.2196 12.1345 10.8259L18.1905 3.90476"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M19.1428 10.5714C19.1428 12.3624 18.5819 14.1083 17.5387 15.5641C16.4955 17.0199 15.0225 18.1123 13.3266 18.688C11.6307 19.2637 9.79709 19.2937 8.08327 18.7738C6.36944 18.2539 4.86151 17.2102 3.77126 15.7894C2.681 14.3685 2.06319 12.6419 2.00459 10.8519C1.94599 9.06189 2.44955 7.29851 3.44454 5.8094C4.43954 4.32028 5.87598 3.18024 7.55214 2.54938C9.22829 1.91852 11.0599 1.82853 12.7899 2.29206"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M22 22L16.9206 16.9206"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
};

export default SearchCheck;
