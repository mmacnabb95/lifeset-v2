import React from "react";
import * as config from "../componentConfig/config";

export const Slot = ({
  index,
  componentName,
  navigation,
  route,
  source,
  parentPageIsCloseToBottomOfScroll,
}: {
  index: any;
  componentName: string;
  navigation: any;
  route: any;
  source: any;
  parentPageIsCloseToBottomOfScroll?: boolean;
}) => {
  const injectingComponent = (config as any).ComponentConfig![componentName];

  if (injectingComponent?.inject?.position === index) {
    return (
      <>
        {injectingComponent.inject.component({
          navigation,
          route,
          source,
          parentPageIsCloseToBottomOfScroll,
        })}
      </>
    );
  } else {
    return <></>;
  }
};
