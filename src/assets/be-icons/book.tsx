import React from "react";
import { Path } from "react-native-svg";

const Book: React.FunctionComponent<{
  iconColor?: string;
}> = ({ iconColor }) => {
  return (
    <>
      <Path
        d="M22 12V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22H4.77778C3.24365 22 2 20.7563 2 19.2222V19.2222C2 17.6881 3.24365 16.4444 4.77778 16.4444H18C19.8856 16.4444 20.8284 16.4444 21.4142 15.8587C22 15.2729 22 14.3301 22 12.4444V6C22 4.11438 22 3.17157 21.4142 2.58579C20.8284 2 19.8856 2 18 2H6C4.11438 2 3.17157 2 2.58579 2.58579C2 3.17157 2 4.11438 2 6V19.2222"
        stroke={iconColor}
        strokeWidth="1.5"
      />
      <Path
        d="M8.25 7.55555L15.75 7.55555"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
};

export default Book;
