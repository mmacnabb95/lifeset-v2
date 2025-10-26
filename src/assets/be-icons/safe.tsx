import React from "react";
import { Path } from "react-native-svg";

const Safe: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Path
        d="M20.9101 11.1203C20.9101 16.0103 17.3601 20.5903 12.5101 21.9303C12.1801 22.0203 11.8201 22.0203 11.4901 21.9303C6.64008 20.5903 3.09009 16.0103 3.09009 11.1203V6.73028C3.09009 5.91028 3.7101 4.98028 4.4801 4.67028L10.0501 2.39031C11.3001 1.88031 12.7101 1.88031 13.9601 2.39031L19.5301 4.67028C20.2901 4.98028 20.9201 5.91028 20.9201 6.73028L20.9101 11.1203Z"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12.5V15.5"
        stroke={props?.iconColor}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default Safe;
