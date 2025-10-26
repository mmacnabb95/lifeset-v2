import React from "react";
import { Rect } from "react-native-svg";

const Menu: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Rect x="3" y="7" width="20" height="2" rx="1" fill={props?.iconColor} />
      <Rect x="14" y="14" width="9" height="2" rx="1" fill={props?.iconColor} />
    </>
  );
};

export default Menu;
